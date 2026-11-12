import { state } from '../../state';
import { getActiveVideo, getCachedVideo } from '../video/detector';
import {
  applyTemporarySpeed,
  togglePlayPause,
  getActiveVideoElement,
  restoreSpeedAfterPointerHold,
} from '../video/controller';
import { isUserTyping } from './keyboard';

export const NATIVE_HOLD_SPEED = 2.0;
export const NATIVE_HOLD_DELAY_MS = 400;
export const NATIVE_HOLD_MOVE_THRESHOLD_PX = 12;

let spacePressTimer: ReturnType<typeof setTimeout> | null = null;
let isHoldingSpace = false;
let spaceKeyDownIntercepted = false;
let speedBeforeHold = 1.0;
let isPointerDownOnPlayer = false;
let isPointerHoldActive = false;
let isReleasingPointerHold = false;
let pointerHoldTimer: ReturnType<typeof setTimeout> | null = null;
let pointerReleaseTimer: ReturnType<typeof setTimeout> | null = null;
let pointerStartX: number | null = null;
let pointerStartY: number | null = null;

export function isUserHoldingSpace(): boolean {
  return isHoldingSpace;
}

export function isPointerHolding(): boolean {
  return isPointerHoldActive;
}

export function isPointerDown(): boolean {
  return isPointerDownOnPlayer;
}

export function isPointerReleasing(): boolean {
  return isReleasingPointerHold;
}

function clearPointerHoldTimer(): void {
  if (pointerHoldTimer) {
    clearTimeout(pointerHoldTimer);
    pointerHoldTimer = null;
  }
}

function clearPointerReleaseTimer(): void {
  if (pointerReleaseTimer) {
    clearTimeout(pointerReleaseTimer);
    pointerReleaseTimer = null;
  }
}

export function activatePointerHold(): void {
  if (!isPointerDownOnPlayer) return;
  clearPointerHoldTimer();
  isPointerHoldActive = true;
}

export function cancelPointerHold(): void {
  const wasHoldActive = isPointerHoldActive;
  clearPointerHoldTimer();
  clearPointerReleaseTimer();
  isPointerDownOnPlayer = false;
  isPointerHoldActive = false;
  isReleasingPointerHold = false;
  pointerStartX = null;
  pointerStartY = null;
  if (wasHoldActive) {
    restoreSpeedAfterPointerHold();
  }
}

function getPointerCoords(e: Event): { x: number; y: number } | null {
  if ('touches' in e) {
    const touch = (e as TouchEvent).touches?.[0];
    if (touch) {
      return { x: touch.clientX, y: touch.clientY };
    }
  }
  if (e instanceof MouseEvent) {
    return { x: e.clientX, y: e.clientY };
  }
  return null;
}

function isInteractiveControlTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      '.player-footer, .player-header, #footer-left-section, #footer-right-section, ' +
        '#progress-control, .vjs-progress-control, .vjs-progress-holder, ' +
        '[class*="progress-control" i], [class*="progress-bar" i], [class*="seekbar" i], [class*="seek-bar" i], ' +
        '.vjs-control-bar, .vjs-menu, .vjs-setting-menu, [data-headlessui-state], ' +
        '#pwc-speed-control, #pwc-ss-container, #pwc-quality-control, #pwc-instant-hide-btn, ' +
        '#pwc-finish-time-badge, button, input, select, textarea, a, ' +
        '[role="button"], [role="slider"], [role="menu"], [role="menuitem"]',
    ),
  );
}

// Safety net: Reset hold-space state when tab loses focus or window blurs
export function cancelSpaceHold(): void {
  spaceKeyDownIntercepted = false;
  if (spacePressTimer) {
    clearTimeout(spacePressTimer);
    spacePressTimer = null;
  }
  if (isHoldingSpace) {
    isHoldingSpace = false;
    state.currentSpeed = speedBeforeHold;
    restoreSpeedAfterPointerHold();
  }
}

let isInitialized = false;

export function initSpaceHold(): void {
  if (isInitialized) return;
  isInitialized = true;

  // Dedicated capture-phase Spacebar interceptors to prevent double-toggling
  document.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (!state.extensionEnabled || e.isComposing) return;
      if (e.key !== ' ' && e.code !== 'Space') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Safety check: Ignore if typing in text fields, or if key is auto-repeating from an input that just closed
      if (isUserTyping(e.target)) return;
      if (e.repeat && !spaceKeyDownIntercepted) return;

      if (state.holdSpaceSpeedUp) {
        spaceKeyDownIntercepted = true;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (isHoldingSpace) return;
        if (!spacePressTimer) {
          speedBeforeHold = state.currentSpeed;
          spacePressTimer = setTimeout(() => {
            isHoldingSpace = true;
            applyTemporarySpeed(state.holdSpaceSpeed);
          }, 300);
        }
      }
    },
    true,
  );

  document.addEventListener(
    'keyup',
    (e: KeyboardEvent) => {
      if (!state.extensionEnabled) return;
      if (e.key !== ' ' && e.code !== 'Space') return;

      if (state.holdSpaceSpeedUp) {
        if (!spaceKeyDownIntercepted && !isHoldingSpace) return;
        spaceKeyDownIntercepted = false;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (spacePressTimer) {
          clearTimeout(spacePressTimer);
          spacePressTimer = null;
        }

        if (isHoldingSpace) {
          isHoldingSpace = false;
          state.currentSpeed = speedBeforeHold;
          restoreSpeedAfterPointerHold();
        } else {
          // Only toggle play/pause if user is not typing in a text field
          if (!isUserTyping()) {
            togglePlayPause();
          }
        }
      }
    },
    true,
  );

  // Track screen hold state for PW native hold-click to 2x (matches PW's 400ms / 12px threshold)
  const startHold = (e: Event) => {
    if (!state.extensionEnabled) return;
    if (e instanceof MouseEvent && e.button !== 0) return;
    if (typeof PointerEvent !== 'undefined' && e instanceof PointerEvent && !e.isPrimary) return;
    if ('touches' in e && (e as TouchEvent).touches.length > 1) return;
    if (isInteractiveControlTarget(e.target)) return;

    const video = getActiveVideoElement() || getCachedVideo() || getActiveVideo();
    if (!video) return;
    const playerContainer =
      document.getElementById('video-player-container') ||
      video.closest('.video-player-app') ||
      video.parentElement;
    if (playerContainer && e.target && playerContainer.contains(e.target as Node)) {
      if (!isPointerDownOnPlayer && !isPointerHoldActive) {
        const coords = getPointerCoords(e);
        pointerStartX = coords?.x ?? null;
        pointerStartY = coords?.y ?? null;
      }
      clearPointerReleaseTimer();
      isReleasingPointerHold = false;
      isPointerDownOnPlayer = true;
      if (!pointerHoldTimer && !isPointerHoldActive) {
        pointerHoldTimer = setTimeout(() => {
          pointerHoldTimer = null;
          const activeVid = getActiveVideoElement() || getCachedVideo() || getActiveVideo();
          if (state.extensionEnabled && isPointerDownOnPlayer && activeVid && !activeVid.paused) {
            isPointerHoldActive = true;
          }
        }, NATIVE_HOLD_DELAY_MS);
      }
    }
  };

  const moveHold = (e: Event) => {
    if (typeof PointerEvent !== 'undefined' && e instanceof PointerEvent && !e.isPrimary) return;
    if (!isPointerDownOnPlayer || isPointerHoldActive || !pointerHoldTimer) return;
    const coords = getPointerCoords(e);
    if (!coords || pointerStartX === null || pointerStartY === null) return;
    if (
      Math.abs(coords.x - pointerStartX) > NATIVE_HOLD_MOVE_THRESHOLD_PX ||
      Math.abs(coords.y - pointerStartY) > NATIVE_HOLD_MOVE_THRESHOLD_PX
    ) {
      clearPointerHoldTimer();
      isPointerDownOnPlayer = false;
      pointerStartX = null;
      pointerStartY = null;
    }
  };

  const endHold = (e?: Event) => {
    if (e && typeof PointerEvent !== 'undefined' && e instanceof PointerEvent && !e.isPrimary) {
      return;
    }
    clearPointerHoldTimer();
    const wasHoldActive = isPointerHoldActive;
    isPointerDownOnPlayer = false;
    isPointerHoldActive = false;
    pointerStartX = null;
    pointerStartY = null;

    if (wasHoldActive) {
      isReleasingPointerHold = true;
      setTimeout(() => {
        restoreSpeedAfterPointerHold();
      }, 0);
      clearPointerReleaseTimer();
      pointerReleaseTimer = setTimeout(() => {
        pointerReleaseTimer = null;
        isReleasingPointerHold = false;
        restoreSpeedAfterPointerHold();
      }, 80);
    }
  };

  window.addEventListener('blur', () => {
    cancelSpaceHold();
    endHold();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelSpaceHold();
      endHold();
    }
  });

  document.addEventListener('pointerdown', startHold, true);
  document.addEventListener('mousedown', startHold, true);
  document.addEventListener('touchstart', startHold, true);

  document.addEventListener('pointermove', moveHold, { capture: true, passive: true });
  document.addEventListener('mousemove', moveHold, { capture: true, passive: true });
  document.addEventListener('touchmove', moveHold, { capture: true, passive: true });

  document.addEventListener('pointerup', endHold, true);
  document.addEventListener('mouseup', endHold, true);
  document.addEventListener('touchend', endHold, true);
  document.addEventListener('touchcancel', endHold, true);
  document.addEventListener('pointercancel', endHold, true);
  document.addEventListener('contextmenu', endHold, true);
  document.addEventListener('dragstart', endHold, true);
}
