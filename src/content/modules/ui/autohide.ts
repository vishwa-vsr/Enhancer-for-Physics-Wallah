import { state, subscribeState } from '../../state';
import { getActiveVideo } from '../video/detector';
import { getOuterPlayerContainer } from '../distractions/elements';
import { isLiveVideo } from './finish-time';

let idleTimer: number | null = null;
let isInitialized = false;
let isStateSubscribed = false;
let isDraggingSlider = false;
let hoveredControlElement: Element | null = null;
let lastUserPauseInteractionTime = 0;

function getPlayerContainer(): HTMLElement | null {
  const container = getOuterPlayerContainer();
  if (!container || container === document.body || container === document.documentElement) {
    return null;
  }
  return container;
}

const OPEN_PANEL_SELECTOR =
  '[role="dialog"], [aria-modal="true"], [class*="timeline-sidebar" i], [id*="timeline-sidebar" i], [class*="Timeline_sidebar"], [class*="Timeline_container"], [class*="drawer" i], [class*="Drawer"]';

const CONTROLS_HOVER_SELECTOR =
  '#player-footer-controls, .player-footer, #progress-placeholder, #progress-control, #footer-left-section, #footer-right-section, #pwc-controls-tray, #pwc-instant-hide-btn, .pwc-speed-container, .pwc-speed-slider-container, .pwc-quality-container, .pwc-quality-menu, .vjs-progress-control, .vjs-control-bar';

const SLIDER_DRAG_SELECTOR =
  'input[type="range"], .pwc-speed-slider, .pwc-slider-wrapper, .vjs-progress-control, .vjs-progress-holder, .vjs-slider, [role="slider"], #progress-placeholder, #progress-control';

function isUserTypingInInput(): boolean {
  const active = document.activeElement;
  if (!active) return false;
  const tagName = active.tagName.toLowerCase();
  if (
    tagName === 'textarea' ||
    (active as HTMLElement).isContentEditable ||
    active.getAttribute('role') === 'textbox'
  ) {
    return true;
  }
  if (tagName === 'input') {
    const type = ((active as HTMLInputElement).type || 'text').toLowerCase();
    return ['text', 'search', 'email', 'number', 'password', 'tel', 'url'].includes(type);
  }
  return false;
}

function isEventInsidePlayer(e: Event): boolean {
  if (document.fullscreenElement) {
    return true;
  }
  const container = getOuterPlayerContainer();
  if (!container) return false;

  const target = e.target;
  if (target instanceof Node && container.contains(target)) {
    return true;
  }
  if (typeof e.composedPath === 'function') {
    const path = e.composedPath();
    if (path.includes(container)) {
      return true;
    }
  }
  return false;
}

function isEventInsideOpenPanel(e: Event): boolean {
  const target = e.target;
  if (target instanceof Element && target.closest(OPEN_PANEL_SELECTOR)) {
    return true;
  }
  return false;
}

function isMenuOrPopupOpen(): boolean {
  const scope = getOuterPlayerContainer() || document;

  // Check headlessui open menus (settings gear, dropdowns), excluding our own speed badge
  const openHeadless = scope.querySelector(
    '[data-headlessui-state*="open"], [aria-expanded="true"]:not(.pwc-speed-badge)',
  );
  if (openHeadless) return true;

  // Check our custom quality menu
  const qualityMenu = document.querySelector('.pwc-quality-container.pwc-menu-open');
  if (qualityMenu) return true;

  // Check temporarily expanded / inline-editing speed control (do not block Auto-Hide when always-expanded)
  const speedPopup = scope.querySelector(
    '.pwc-speed-container.pwc-speed-editing, .pwc-speed-container.pwc-expanded:not(.pwc-always-expanded)',
  );
  if (speedPopup) return true;

  // Check Video.js locked/open menus
  const vjsMenu = scope.querySelector('.vjs-menu.vjs-lock-showing');
  if (vjsMenu && (vjsMenu as HTMLElement).offsetWidth > 0) return true;

  return false;
}

function isHoveringInteractiveControls(): boolean {
  if (hoveredControlElement && hoveredControlElement.isConnected) {
    return true;
  }
  hoveredControlElement = null;
  const scope = getPlayerContainer() || document;
  const targets = scope.querySelectorAll(CONTROLS_HOVER_SELECTOR);
  for (let i = 0; i < targets.length; i++) {
    const el = targets[i] as HTMLElement;
    if (el.matches(':hover') && el.offsetWidth > 0 && el.offsetHeight > 0) {
      return true;
    }
  }
  return false;
}

function isPlayerPaused(video: HTMLVideoElement | null, container: HTMLElement | null): boolean {
  if (video) return video.paused;
  if (!container) return false;
  return Boolean(
    container.classList.contains('vjs-paused') || container.querySelector('.video-js.vjs-paused'),
  );
}

// Keep our Auto-Hide as the single authority when extensionEnabled is true so PW's 5s React timer cannot override Auto-Hide OFF or delays > 5s
export function syncAutoHideBossClass(): void {
  const container = getPlayerContainer();
  const shouldKeepVisible =
    Boolean(state.extensionEnabled) &&
    Boolean(container) &&
    !container!.classList.contains('pwc-autohide-inactive') &&
    !container!.classList.contains('pwc-collapsed-state');

  document.querySelectorAll('.pwc-autohide-boss').forEach((el) => {
    if (!shouldKeepVisible || el !== container) {
      el.classList.remove('pwc-autohide-boss');
    }
  });

  if (container && shouldKeepVisible) {
    container.classList.add('pwc-autohide-boss');
  }
}

function wakeUp(): void {
  document.querySelectorAll('.pwc-autohide-inactive').forEach((el) => {
    el.classList.remove('pwc-autohide-inactive');
  });
  syncAutoHideBossClass();
}

function sleep(): void {
  if (!state.extensionEnabled || !state.autoHideControls) {
    wakeUp();
    return;
  }

  const video = getActiveVideo();
  const container = getPlayerContainer();
  if (!video && !container) return;

  // If paused and the user chose NOT to auto-hide during pause, keep awake
  if (isPlayerPaused(video, container) && !state.autoHideWhenPaused) {
    wakeUp();
    return;
  }

  // Keep controls awake while dragging sliders, hovering control bar/tray/sliders, or with open menus
  if (isDraggingSlider || isHoveringInteractiveControls() || isMenuOrPopupOpen()) {
    scheduleNextCheck();
    return;
  }

  // Fade out player controls and hide cursor (without collapsing outer page layout or interactive play/pause layer)
  if (container && !container.classList.contains('pwc-collapsed-state')) {
    container.classList.add('pwc-autohide-inactive');
  }
  syncAutoHideBossClass();
}

function scheduleNextCheck(): void {
  if (idleTimer !== null) {
    window.clearTimeout(idleTimer);
    idleTimer = null;
  }

  if (!state.extensionEnabled || !state.autoHideControls) {
    wakeUp();
    return;
  }

  syncAutoHideBossClass();
  const delayMs = Math.max(200, (state.autoHideDelay || 0.8) * 1000);
  idleTimer = window.setTimeout(sleep, delayMs);
}

function isConsistentShortcutKey(e: KeyboardEvent): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  if (
    e.key === ' ' ||
    e.key === 'ArrowLeft' ||
    e.key === 'ArrowRight' ||
    e.key === 'ArrowUp' ||
    e.key === 'ArrowDown'
  ) {
    return true;
  }
  if (!state.enableHotkeys) return false;
  const k = e.key.toLowerCase();
  return [state.keySpeedUp, state.keySlowDown, state.keyReset].some((target) => {
    if (!target) return false;
    if (target === '>') return e.key === '>' || (e.shiftKey && e.key === '.');
    if (target === '<') return e.key === '<' || (e.shiftKey && e.key === ',');
    return k === target.toLowerCase();
  });
}

function onUserActivity(e: Event): void {
  if (!e.isTrusted) return;
  const container = getPlayerContainer();
  if (container?.classList.contains('pwc-collapsed-state')) return;
  if (!isEventInsidePlayer(e)) return;
  if (isEventInsideOpenPanel(e)) return;
  if (e.type === 'mousemove' || e.type === 'mouseover') {
    const target = e.target as Element | null;
    hoveredControlElement = target ? target.closest(CONTROLS_HOVER_SELECTOR) : null;
  }
  wakeUp();
  scheduleNextCheck();
}

export function syncAutoHide(): void {
  if (!state.extensionEnabled || !state.autoHideControls) {
    if (idleTimer !== null) {
      window.clearTimeout(idleTimer);
      idleTimer = null;
    }
    wakeUp();
  } else {
    syncAutoHideBossClass();
    scheduleNextCheck();
  }
}

export function initAutoHide(): void {
  if (isInitialized) return;
  isInitialized = true;

  if (!isStateSubscribed) {
    isStateSubscribed = true;
    subscribeState(() => {
      syncAutoHide();
    });
  }

  const options = { passive: true };
  window.addEventListener('mousemove', onUserActivity, options);
  window.addEventListener('touchstart', onUserActivity, options);

  // Track explicit user pause actions and keep Space/Arrow/Speed/Escape keys consistent with wake rules
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (isUserTypingInInput()) return;

      if (e.key === 'Escape') {
        if (document.querySelector('.pwc-autohide-inactive')) {
          wakeUp();
          scheduleNextCheck();
        }
        return;
      }

      if (!e.isTrusted) return;
      if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        lastUserPauseInteractionTime = Date.now();
      }
      if (!isConsistentShortcutKey(e)) return;

      const container = getOuterPlayerContainer();
      const isHidden =
        Boolean(container?.classList.contains('pwc-collapsed-state')) ||
        Boolean(container?.classList.contains('pwc-autohide-inactive'));

      // Space/Arrow/Speed keys never wake controls from Instant Hide or Auto-Hide;
      // if already awake, only keep the timer consistent when Auto-Hide is active.
      if (!isHidden) {
        scheduleNextCheck();
      } else {
        syncAutoHideBossClass();
      }
    },
    { capture: true, passive: true },
  );

  window.addEventListener(
    'pointerdown',
    (e: PointerEvent) => {
      if (!e.isTrusted) return;
      const target = e.target as HTMLElement | null;
      if (
        target?.closest(
          '.vjs-play-control, .vjs-tech, video, .player, [aria-label*="play" i], [aria-label*="pause" i]',
        )
      ) {
        lastUserPauseInteractionTime = Date.now();
      }
      if (isEventInsidePlayer(e) && target?.closest(SLIDER_DRAG_SELECTOR)) {
        isDraggingSlider = true;
        wakeUp();
        scheduleNextCheck();
      }
    },
    { capture: true, passive: true },
  );

  const endSliderDrag = () => {
    if (!isDraggingSlider) return;
    isDraggingSlider = false;
    scheduleNextCheck();
  };
  window.addEventListener('pointerup', endSliderDrag, { capture: true, passive: true });
  window.addEventListener('pointercancel', endSliderDrag, { capture: true, passive: true });
  window.addEventListener(
    'blur',
    () => {
      hoveredControlElement = null;
      endSliderDrag();
    },
    { passive: true },
  );

  // Track pointer hover over bottom bar, #pwc-controls-tray, or sliders for reliable awake checks
  window.addEventListener(
    'mouseover',
    (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target && isEventInsidePlayer(e)) {
        hoveredControlElement = target.closest(CONTROLS_HOVER_SELECTOR);
      }
    },
    { passive: true },
  );

  window.addEventListener(
    'mouseout',
    (e: MouseEvent) => {
      if (!hoveredControlElement) return;
      const related = e.relatedTarget as Element | null;
      if (!related || !related.closest(CONTROLS_HOVER_SELECTOR)) {
        hoveredControlElement = null;
      }
    },
    { passive: true },
  );

  // Monitor play/pause on active video to update hide behavior
  document.addEventListener(
    'play',
    () => {
      scheduleNextCheck();
    },
    true,
  );

  document.addEventListener(
    'pause',
    () => {
      const video = getActiveVideo();
      const isLive = video ? isLiveVideo(video) : false;
      const isProgrammaticPollPause =
        state.blockRecordedPolls && !isLive && Date.now() - lastUserPauseInteractionTime > 300;
      const container = getOuterPlayerContainer();
      const isInstantHidden = Boolean(container?.classList.contains('pwc-collapsed-state'));

      if (!state.autoHideWhenPaused && !isProgrammaticPollPause && !isInstantHidden) {
        wakeUp();
      } else {
        scheduleNextCheck();
      }
    },
    true,
  );

  syncAutoHide();
}
