import { state } from '../../state';
import { getActiveVideo } from './detector';
import { getOuterPlayerContainer } from '../distractions/elements';
import { showVolumeHud } from '../ui/volume-hud';

let touchpadAccumulator = 0;
let touchpadTimer: ReturnType<typeof setTimeout> | null = null;
let isListenerActive = false;

// Excluded selectors: bottom controls, buttons, sliders, speed/quality widgets, input elements
const EXCLUDED_CONTROLS_SELECTOR = [
  '#footer-right-section',
  '#footer-left-section',
  '#progress-control',
  '#progress-placeholder',
  '.player-footer',
  '.vjs-control-bar',
  '.pwc-speed-container',
  '#pwc-speed-control',
  '.pwc-quality-container',
  '#pwc-quality-control',
  '.pwc-ss-container',
  '#pwc-finish-time-badge',
  'button',
  '[role="button"]',
  '[role="slider"]',
  'input',
  'textarea',
  '[class*="timeline-sidebar" i]',
  '[id*="timeline-sidebar" i]',
].join(', ');

function applyVolumeAdjustment(video: HTMLVideoElement, deltaPercent: number): void {
  // If video is muted, treat current perceived volume as 0 when scrolling up
  const currentVol = video.muted ? 0 : video.volume;
  let newVol = currentVol + deltaPercent;

  // Clamp strictly between 0.0 and 1.0 (0% to 100%)
  newVol = Math.max(0, Math.min(1, Math.round(newVol * 100) / 100));

  if (newVol > 0 && video.muted) {
    video.muted = false;
  }

  video.volume = newVol;

  // Notify video element so standard player bars (VideoJS) sync their bottom slider
  try {
    video.dispatchEvent(new Event('volumechange'));
  } catch {
    /* ignore */
  }

  showVolumeHud(newVol, video.muted || newVol === 0);
}

function handleWheel(event: WheelEvent): void {
  // 1. Guard: feature must be enabled
  if (!state.extensionEnabled || !state.volumeScrollEnabled) {
    return;
  }

  // 2. Locate active video and player container
  const video = getActiveVideo();
  if (!video) return;

  const container = getOuterPlayerContainer() || video.parentElement;
  if (!container) return;

  const target = event.target as HTMLElement | null;
  if (!target) return;

  // 3. Verify event is inside the player container (if outside, let page scroll normally)
  if (!container.contains(target) && target !== video) {
    return;
  }

  // 4. Exclude bottom control bar, buttons, and custom widgets
  if (target.closest && target.closest(EXCLUDED_CONTROLS_SELECTOR)) {
    return;
  }

  // 5. Intercept wheel event on the main video screen area
  event.preventDefault();
  event.stopPropagation();

  // 6. Differentiate between mouse wheel notches and continuous touchpad swipes
  const absDelta = Math.abs(event.deltaY);
  const isMouseWheel =
    event.deltaMode !== 0 ||
    (Number.isInteger(event.deltaY) && absDelta >= 100 && (absDelta % 100 === 0 || absDelta % 120 === 0));

  if (isMouseWheel) {
    // Physical mouse wheel: rolling forward/up is negative deltaY, which increases volume
    const direction = event.deltaY < 0 ? 1 : -1;
    applyVolumeAdjustment(video, direction * 0.05);
  } else {
    // Touchpad swipe: two-finger upward gesture sends positive deltaY on Windows natural scroll
    const STEP_THRESHOLD = 14;
    touchpadAccumulator += event.deltaY;

    if (touchpadTimer) {
      clearTimeout(touchpadTimer);
    }
    touchpadTimer = setTimeout(() => {
      touchpadAccumulator = 0;
    }, 150);

    if (Math.abs(touchpadAccumulator) >= STEP_THRESHOLD) {
      const steps = Math.trunc(touchpadAccumulator / STEP_THRESHOLD);
      touchpadAccumulator -= steps * STEP_THRESHOLD;
      // Positive steps (swiping up) increases volume
      const deltaPercent = steps * 0.02;
      applyVolumeAdjustment(video, deltaPercent);
    }
  }
}

export function initVolumeScroll(): void {
  if (isListenerActive) return;
  window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
  isListenerActive = true;
}

export function destroyVolumeScroll(): void {
  if (!isListenerActive) return;
  window.removeEventListener('wheel', handleWheel, { capture: true });
  isListenerActive = false;
  if (touchpadTimer) {
    clearTimeout(touchpadTimer);
    touchpadTimer = null;
  }
  touchpadAccumulator = 0;
}
