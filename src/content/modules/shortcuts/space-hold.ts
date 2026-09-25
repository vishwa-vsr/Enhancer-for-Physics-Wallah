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

let spacePressTimer: ReturnType<typeof setTimeout> | null = null;
let isHoldingSpace = false;
let speedBeforeHold = 1.0;
let isPointerDownOnPlayer = false;
let isPointerHoldActive = false;
let isReleasingPointerHold = false;
let pointerHoldTimer: ReturnType<typeof setTimeout> | null = null;
let pointerReleaseTimer: ReturnType<typeof setTimeout> | null = null;

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

export function activatePointerHold(): void {
  if (!isPointerDownOnPlayer) return;
  if (pointerHoldTimer) {
    clearTimeout(pointerHoldTimer);
    pointerHoldTimer = null;
  }
  isPointerHoldActive = true;
}

export function cancelPointerHold(): void {
  if (pointerHoldTimer) {
    clearTimeout(pointerHoldTimer);
    pointerHoldTimer = null;
  }
  if (pointerReleaseTimer) {
    clearTimeout(pointerReleaseTimer);
    pointerReleaseTimer = null;
  }
  isPointerDownOnPlayer = false;
  isPointerHoldActive = false;
  isReleasingPointerHold = false;
}

function isInteractiveControlTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      '.player-footer, .player-header, .vjs-control-bar, .vjs-menu, .vjs-setting-menu, ' +
        '#pwc-speed-control, #pwc-ss-container, #pwc-quality-control, #pwc-instant-hide-btn, ' +
        '#pwc-finish-time-badge, button, input, select, textarea, a, ' +
        '[role="button"], [role="slider"], [role="menu"], [role="menuitem"]',
    ),
  );
}

// Safety net: Reset hold-space state when tab loses focus or window blurs
export function cancelSpaceHold(): void {
  if (spacePressTimer) {
    clearTimeout(spacePressTimer);
    spacePressTimer = null;
  }
  if (isHoldingSpace) {
    applyTemporarySpeed(speedBeforeHold);
    isHoldingSpace = false;
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
      if (!state.extensionEnabled) return;
      if (e.key !== ' ' && e.code !== 'Space') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Safety check: Ignore if typing in text fields
      if (isUserTyping()) return;

      if (state.holdSpaceSpeedUp) {
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
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (spacePressTimer) {
          clearTimeout(spacePressTimer);
          spacePressTimer = null;
        }

        if (isHoldingSpace) {
          applyTemporarySpeed(speedBeforeHold);
          isHoldingSpace = false;
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

  // Track screen hold state for PW native hold-click to 2x
  const startHold = (e: Event) => {
    if (e instanceof MouseEvent && e.button !== 0) return;
    if (isInteractiveControlTarget(e.target)) return;

    const video = getActiveVideoElement() || getCachedVideo() || getActiveVideo();
    if (!video) return;
    const playerContainer =
      document.getElementById('video-player-container') ||
      video.closest('.video-player-app') ||
      video.parentElement;
    if (playerContainer && e.target && playerContainer.contains(e.target as Node)) {
      if (pointerReleaseTimer) {
        clearTimeout(pointerReleaseTimer);
        pointerReleaseTimer = null;
        isReleasingPointerHold = false;
      }
      isPointerDownOnPlayer = true;
      if (!pointerHoldTimer) {
        // Fallback when playbackRate is already 2.0x (where setting 2.0x won't fire ratechange)
        pointerHoldTimer = setTimeout(() => {
          pointerHoldTimer = null;
          const activeVid = getActiveVideoElement() || getCachedVideo() || getActiveVideo();
          if (
            isPointerDownOnPlayer &&
            activeVid &&
            !activeVid.paused &&
            Math.abs(activeVid.playbackRate - NATIVE_HOLD_SPEED) < 0.05
          ) {
            isPointerHoldActive = true;
          }
        }, 350);
      }
    }
  };

  const endHold = () => {
    if (pointerHoldTimer) {
      clearTimeout(pointerHoldTimer);
      pointerHoldTimer = null;
    }
    const wasHoldActive = isPointerHoldActive;
    isPointerDownOnPlayer = false;
    isPointerHoldActive = false;

    if (wasHoldActive) {
      isReleasingPointerHold = true;
      setTimeout(() => {
        restoreSpeedAfterPointerHold();
      }, 0);
      if (pointerReleaseTimer) clearTimeout(pointerReleaseTimer);
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

  document.addEventListener('pointerdown', startHold, true);
  document.addEventListener('mousedown', startHold, true);
  document.addEventListener('touchstart', startHold, true);

  document.addEventListener('pointerup', endHold, true);
  document.addEventListener('mouseup', endHold, true);
  document.addEventListener('touchend', endHold, true);
  document.addEventListener('pointercancel', endHold, true);
  document.addEventListener('contextmenu', endHold, true);
  document.addEventListener('dragstart', endHold, true);
}

