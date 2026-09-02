import { state } from '../../state';
import { getActiveVideo, getCachedVideo } from '../video/detector';
import { applyTemporarySpeed, togglePlayPause, getActiveVideoElement } from '../video/controller';
import { isUserTyping } from './keyboard';

let spacePressTimer: any = null;
let isHoldingSpace = false;
let speedBeforeHold = 1.0;
let isPointerHoldingOnPlayer = false;

export function isUserHoldingSpace(): boolean {
  return isHoldingSpace;
}

export function isPointerHolding(): boolean {
  return isPointerHoldingOnPlayer;
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
    true
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
    true
  );

  window.addEventListener('blur', cancelSpaceHold);

  // Track screen hold state to suppress custom top pill during PW native screen hold
  const startHold = (e: Event) => {
    const video = getActiveVideoElement() || getCachedVideo() || getActiveVideo();
    if (!video) return;
    const playerContainer =
      document.getElementById('video-player-container') ||
      video.closest('.video-player-app') ||
      video.parentElement;
    if (playerContainer && e.target && playerContainer.contains(e.target as Node)) {
      isPointerHoldingOnPlayer = true;
    }
  };

  const endHold = () => {
    isPointerHoldingOnPlayer = false;
  };

  document.addEventListener('pointerdown', startHold, true);
  document.addEventListener('mousedown', startHold, true);
  document.addEventListener('touchstart', startHold, true);

  document.addEventListener('pointerup', endHold, true);
  document.addEventListener('mouseup', endHold, true);
  document.addEventListener('touchend', endHold, true);
  document.addEventListener('pointercancel', endHold, true);
}
