import { state } from '../../state';

const PROMO_CLOSE_SELECTOR =
  'button[aria-label*="advertisement" i], button[aria-label*="close ad" i]';
const MAX_PROMO_RETRY_ATTEMPTS = 20;

let promoSkipTimer: number | null = null;

function stopPromoSkipTimer(): void {
  if (promoSkipTimer !== null) {
    if (typeof window !== 'undefined') {
      window.clearInterval(promoSkipTimer);
    } else {
      clearInterval(promoSkipTimer);
    }
    promoSkipTimer = null;
  }
}

/**
 * Checks if a given HTMLVideoElement belongs to a promotional commercial ad
 * (e.g. In-house PW course offer video like Saarthi Arjuna JEE).
 */
export function isPromoVideo(video: HTMLVideoElement | null | undefined): boolean {
  if (!video) return false;

  try {
    // 1. Direct src check: PW admin promo mp4 uploads
    const src = (video.currentSrc || video.src || '').toLowerCase();
    if (src.includes('/admin/') && src.includes('.mp4')) {
      return true;
    }

    // Never treat the main Video.js lecture player as an inline promo video
    if (video.closest('.video-js')) {
      return false;
    }

    // 2. Scoped check: walk a few non-lecture containers around the standalone video
    let ancestor: HTMLElement | null = video.parentElement;
    for (let depth = 0; depth < 5 && ancestor; depth += 1) {
      if (ancestor.querySelector('.video-js')) {
        break;
      }
      if (ancestor.querySelector(PROMO_CLOSE_SELECTOR)) {
        return true;
      }
      ancestor = ancestor.parentElement;
    }

    // 3. Document-level fallback: active advertisement close button while video is outside .video-js
    const closeBtn = document.querySelector<HTMLElement>(PROMO_CLOSE_SELECTOR);
    if (closeBtn && !closeBtn.closest('[id^="pwc-"]')) {
      return true;
    }
  } catch {
    // Ignored
  }

  return false;
}

function fastForwardPromoVideo(video: HTMLVideoElement): void {
  try {
    video.muted = true;
    video.playbackRate = 16.0;
    if (video.duration && isFinite(video.duration) && video.currentTime < video.duration) {
      video.currentTime = video.duration;
    }
  } catch {
    // Ignored
  }
}

function findPromoCloseButton(): HTMLButtonElement | null {
  const candidates = document.querySelectorAll<HTMLButtonElement>(PROMO_CLOSE_SELECTOR);
  for (let i = 0; i < candidates.length; i += 1) {
    const btn = candidates[i];
    if (!btn.closest('[id^="pwc-"]')) {
      return btn;
    }
  }
  return null;
}

/**
 * Performs a single pass to fast-forward active promo videos and close the ad banner.
 * Returns true if any promo video or close button is still present.
 */
function runPromoSkipPass(): boolean {
  const closeBtn = findPromoCloseButton();
  const promoVideos = Array.from(document.querySelectorAll<HTMLVideoElement>('video')).filter(
    isPromoVideo,
  );

  if (!closeBtn && promoVideos.length === 0) {
    return false;
  }

  for (let i = 0; i < promoVideos.length; i += 1) {
    fastForwardPromoVideo(promoVideos[i]);
  }

  if (closeBtn && !closeBtn.disabled) {
    try {
      closeBtn.click();
    } catch {
      // Ignored
    }
  }

  return true;
}

/**
 * Finds any active promotional video ad container and close button,
 * and if extensionEnabled + autoSkipPromoAds are enabled, skips and closes it immediately.
 */
export function handlePromoAds(): void {
  if (!state.extensionEnabled || !state.autoSkipPromoAds) {
    stopPromoSkipTimer();
    return;
  }

  if (!runPromoSkipPass()) {
    stopPromoSkipTimer();
    return;
  }

  // Rapid safety-net pulse (every 50ms for up to 1 second) to dismiss if delayed by countdown
  if (promoSkipTimer === null && typeof window !== 'undefined') {
    let attempts = 0;
    promoSkipTimer = window.setInterval(() => {
      attempts += 1;
      if (!state.extensionEnabled || !state.autoSkipPromoAds) {
        stopPromoSkipTimer();
        return;
      }

      const stillActive = runPromoSkipPass();
      if (!stillActive || attempts >= MAX_PROMO_RETRY_ATTEMPTS) {
        stopPromoSkipTimer();
      }
    }, 50);
  }
}
