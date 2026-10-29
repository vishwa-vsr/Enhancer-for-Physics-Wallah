import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { getOuterPlayerContainer } from '../distractions/elements';
import { isHandlingRecordedPoll } from '../distractions/poll-blocker';

let idleTimer: number | null = null;
let isInitialized = false;

const OPEN_PANEL_SELECTOR =
  '[role="dialog"], [aria-modal="true"], [class*="timeline-sidebar" i], [id*="timeline-sidebar" i], [class*="Timeline_sidebar"], [class*="Timeline_container"], [class*="drawer" i], [class*="Drawer"]';

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

  // Check Video.js locked/open menus
  const vjsMenu = scope.querySelector('.vjs-menu.vjs-lock-showing');
  if (vjsMenu && (vjsMenu as HTMLElement).offsetWidth > 0) return true;

  return false;
}

function wakeUp(): void {
  document.querySelectorAll('.pwc-autohide-inactive').forEach((el) => {
    el.classList.remove('pwc-autohide-inactive');
  });
}

function sleep(): void {
  if (!state.extensionEnabled || !state.autoHideControls) {
    wakeUp();
    return;
  }

  const video = getActiveVideo();
  if (!video) return;

  // If paused and the user chose NOT to auto-hide during pause, keep awake
  if (video.paused && !state.autoHideWhenPaused) {
    wakeUp();
    return;
  }

  // If user is currently browsing an open settings/quality menu, keep awake
  if (isMenuOrPopupOpen()) {
    scheduleNextCheck();
    return;
  }

  // Fade out player controls and hide cursor (without collapsing outer page layout)
  const container = getOuterPlayerContainer();
  if (container) {
    container.classList.add('pwc-autohide-inactive');
  }
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

  const delayMs = Math.max(200, (state.autoHideDelay || 0.8) * 1000);
  idleTimer = window.setTimeout(sleep, delayMs);
}

function onUserActivity(e: Event): void {
  if (!e.isTrusted) return;
  if (!isEventInsidePlayer(e)) return;
  if (isEventInsideOpenPanel(e)) return;
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
    scheduleNextCheck();
  }
}

export function initAutoHide(): void {
  if (isInitialized) return;
  isInitialized = true;

  const options = { passive: true };
  window.addEventListener('mousemove', onUserActivity, options);
  window.addEventListener('mousedown', onUserActivity, options);
  window.addEventListener('touchstart', onUserActivity, options);
  window.addEventListener('wheel', onUserActivity, options);

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
      if (isHandlingRecordedPoll()) {
        return;
      }
      if (!state.autoHideWhenPaused) {
        wakeUp();
      } else {
        scheduleNextCheck();
      }
    },
    true,
  );

  syncAutoHide();
}
