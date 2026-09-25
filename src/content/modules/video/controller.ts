import { state, safeSetSettings } from '../../state';
import { getActiveVideo } from './detector';
import { resetDistractionCaches } from '../distractions/elements';
import { updateFinishTime } from '../ui/finish-time';
import { updateUI } from '../ui/speed-hud';
import {
  isSSEngineRunning,
  getSSCurrentState,
  getSSConnectedVideo,
  ssInit,
  ssDestroy,
  onSSVideoPause,
  resetSSSessionSaved,
} from '../audio/skip-silence';
import {
  isUserHoldingSpace,
  isPointerHolding,
  isPointerDown,
  isPointerReleasing,
  activatePointerHold,
  cancelPointerHold,
  NATIVE_HOLD_SPEED,
} from '../shortcuts/space-hold';
import { autoApplyPreferredQuality } from './quality-controller';

let activeVideo: HTMLVideoElement | null = null;
let isSettingRate = false;
let lastSetRate: number | null = null;
let settingRateTimer: ReturnType<typeof setTimeout> | null = null;

export function getActiveVideoElement(): HTMLVideoElement | null {
  return activeVideo;
}

export function setActiveVideoElement(video: HTMLVideoElement | null): void {
  activeVideo = video;
}

// Resolve normal (speech) playback speed, respecting active PW 2x hold-click
export function getEffectiveNormalSpeed(): number {
  if (isPointerHolding()) return NATIVE_HOLD_SPEED;
  return state.extensionEnabled ? state.currentSpeed : 1.0;
}

// Resolve silence-skip playback speed, using the faster speed when holding click for 2x
export function getEffectiveSilenceSpeed(): number {
  if (isPointerHolding()) {
    return Math.max(NATIVE_HOLD_SPEED, state.skipSilenceSilenceSpeed);
  }
  return state.skipSilenceSilenceSpeed;
}

// Safely set video playback rate without event loop oscillation
export function setVideoPlaybackRate(rate: number): void {
  const video = getActiveVideo();
  if (!video) return;
  const clamped = Math.round(rate * 100) / 100;
  if (Math.abs(video.playbackRate - clamped) > 0.02) {
    isSettingRate = true;
    lastSetRate = clamped;
    video.playbackRate = clamped;
    if (settingRateTimer) clearTimeout(settingRateTimer);
    settingRateTimer = setTimeout(() => {
      isSettingRate = false;
    }, 150);
  }
}

// Restore user's preferred speed (or active silence speed) after releasing PW native hold-click
export function restoreSpeedAfterPointerHold(): void {
  if (isUserHoldingSpace() || isPointerHolding()) return;
  if (state.skipSilenceEnabled && isSSEngineRunning() && getSSCurrentState() === 'silence') {
    setVideoPlaybackRate(getEffectiveSilenceSpeed());
  } else {
    setVideoPlaybackRate(getEffectiveNormalSpeed());
  }
  updateUI();
}

// Helper to step speed up or down by 0.1, clamped to 0.5–4.0
export function stepSpeed(direction: number): number {
  const val =
    direction > 0
      ? Math.min(4.0, state.currentSpeed + 0.1)
      : Math.max(0.5, state.currentSpeed - 0.1);
  return Math.round(val * 10) / 10;
}

// Set the playback speed on the video element
export function applySpeedToActiveVideo(): void {
  const video = getActiveVideo();
  if (!video) return;

  if (video !== activeVideo) {
    setupVideoListeners(video);
  }

  setVideoPlaybackRate(getEffectiveNormalSpeed());
  updateUI();
}

// Listen to video events to sync our UI badge
export function setupVideoListeners(video: HTMLVideoElement): void {
  if (activeVideo) {
    try {
      activeVideo.removeEventListener('ratechange', onRateChange);
      activeVideo.removeEventListener('play', onVideoPlay);
      activeVideo.removeEventListener('pause', onVideoPause);
      activeVideo.removeEventListener('ended', onVideoPause);
      activeVideo.removeEventListener('timeupdate', updateFinishTime);
      activeVideo.removeEventListener('durationchange', updateFinishTime);
      activeVideo.removeEventListener('seeking', updateFinishTime);
      activeVideo.removeEventListener('seeked', updateFinishTime);
    } catch (_e) {
      // Ignored: video element already detached
    }
  }

  activeVideo = video;

  // Reset cached player controls when switching active videos
  resetDistractionCaches();

  // Reset skip silence session counter and reconnect engine for new video
  resetSSSessionSaved();
  if (state.skipSilenceEnabled && getSSConnectedVideo() !== video) {
    ssDestroy();
    setTimeout(() => {
      if (state.skipSilenceEnabled) ssInit();
    }, 500);
  }

  activeVideo.addEventListener('ratechange', onRateChange);
  activeVideo.addEventListener('play', onVideoPlay);
  activeVideo.addEventListener('pause', onVideoPause);
  activeVideo.addEventListener('ended', onVideoPause);
  activeVideo.addEventListener('timeupdate', updateFinishTime);
  activeVideo.addEventListener('durationchange', updateFinishTime);
  activeVideo.addEventListener('seeking', updateFinishTime);
  activeVideo.addEventListener('seeked', updateFinishTime);

  // Auto-apply preferred quality when video is loaded/switched
  autoApplyPreferredQuality();
}

// Update speed UI when speed changes (syncs with native controls)
export function onRateChange(): void {
  if (!activeVideo) return;
  if (
    isSettingRate &&
    lastSetRate !== null &&
    Math.abs(activeVideo.playbackRate - lastSetRate) <= 0.02
  ) {
    return;
  }
  if (isUserHoldingSpace()) {
    if (Math.abs(activeVideo.playbackRate - state.holdSpaceSpeed) > 0.05) {
      setVideoPlaybackRate(state.holdSpaceSpeed);
    }
    return;
  }

  // Detect PW native hold-click to 2x while pointer is pressed on the player
  if (
    isPointerDown() &&
    !isPointerHolding() &&
    Math.abs(activeVideo.playbackRate - NATIVE_HOLD_SPEED) < 0.05
  ) {
    activatePointerHold();
  }

  // Ignore intermediate ratechange events while releasing pointer hold and snap back to target speed
  if (isPointerReleasing()) {
    restoreSpeedAfterPointerHold();
    return;
  }

  // If Skip Silence is running, never let automated or native player events overwrite user's preferred speed
  if (state.skipSilenceEnabled && isSSEngineRunning()) {
    const expectedSpeed =
      getSSCurrentState() === 'silence' ? getEffectiveSilenceSpeed() : getEffectiveNormalSpeed();
    if (Math.abs(activeVideo.playbackRate - expectedSpeed) > 0.05) {
      setVideoPlaybackRate(expectedSpeed);
    }
    return;
  }

  if (isPointerHolding()) return;
  state.currentSpeed = activeVideo.playbackRate;
  updateUI();
}

// Apply speed and wake up audio immediately on play to preserve user gesture
export function onVideoPlay(): void {
  if (state.skipSilenceEnabled && !isSSEngineRunning()) {
    ssInit();
  }
  setTimeout(() => {
    applySpeedToActiveVideo();
    autoApplyPreferredQuality();
    if (state.skipSilenceEnabled && !isSSEngineRunning()) {
      ssInit();
    }
  }, 200);
}

// Reset silence states when video is paused or ended
export function onVideoPause(): void {
  cancelPointerHold();
  onSSVideoPause();
}

// Save the speed setting and apply it to the video
export function saveSpeed(speed: number): void {
  state.currentSpeed = speed;
  applySpeedToActiveVideo();
  safeSetSettings({ preferredSpeed: speed });
}

// Helper to toggle play/pause natively through player controls
export function togglePlayPause(): void {
  const video = getActiveVideo();
  if (!video) return;
  const playerContainer =
    document.getElementById('video-player-container') ||
    video.closest('.video-player-app') ||
    video.parentElement;
  if (playerContainer) {
    const playBtn = playerContainer.querySelector<HTMLElement>(
      '.vjs-play-control, [class*="play-control" i], [class*="play-btn" i], .play-btn, .vjs-play-btn',
    );
    if (playBtn) {
      playBtn.click();
      return;
    }
  }
  // Fallback 1: Toggle via HTML5 video API
  try {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  } catch {
    // Fallback 2: click the video element
    video.click();
  }
}

// Set temporary speed without saving it permanently to storage
export function applyTemporarySpeed(speed: number): void {
  state.currentSpeed = speed;
  setVideoPlaybackRate(speed);
  updateUI();
}
