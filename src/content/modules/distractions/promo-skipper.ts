import { state } from '../../state';

let promoSkipTimer: number | null = null;

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

    // 2. Check if the video is inside or near an advertisement container
    const container = video.closest('.video-player-app, [class*="player" i], div');
    if (container) {
      if (
        container.querySelector(
          'button[aria-label*="advertisement" i], button[aria-label*="close ad" i]',
        )
      ) {
        return true;
      }
    }

    // 3. Document-level check: If there is an active "Close advertisement" button
    // and the video is NOT inside a standard Video.js player (.video-js)
    if (
      document.querySelector(
        'button[aria-label*="advertisement" i], button[aria-label*="close ad" i]',
      )
    ) {
      if (!video.closest('.video-js')) {
        return true;
      }
    }
  } catch (_e) {
    // Ignored
  }

  return false;
}

/**
 * Finds any active promotional video ad container and close button,
 * and if autoSkipPromoAds is enabled, skips and closes it immediately.
 */
export function handlePromoAds(): void {
  // If auto-skip is disabled, clear any pending timer and exit
  if (!state.autoSkipPromoAds) {
    if (promoSkipTimer !== null) {
      clearInterval(promoSkipTimer);
      promoSkipTimer = null;
    }
    return;
  }

  const closeBtn = document.querySelector<HTMLButtonElement>(
    'button[aria-label*="advertisement" i], button[aria-label*="close ad" i]',
  );
  const allVideos = Array.from(document.querySelectorAll<HTMLVideoElement>('video'));
  const promoVideos = allVideos.filter(isPromoVideo);

  if (!closeBtn && promoVideos.length === 0) {
    return;
  }

  // Fast-forward and mute any promo videos to end them immediately
  for (const v of promoVideos) {
    try {
      v.muted = true;
      v.playbackRate = 16.0;
      if (v.duration && isFinite(v.duration) && v.currentTime < v.duration) {
        v.currentTime = v.duration;
      }
    } catch (_e) {
      // Ignored
    }
  }

  // Click the close button if present and active
  if (closeBtn && !closeBtn.disabled) {
    try {
      closeBtn.click();
    } catch (_e) {
      // Ignored
    }
  }

  // Rapid safety-net pulse (every 50ms for up to 1 second) to dismiss if delayed by countdown
  if (promoSkipTimer === null) {
    let attempts = 0;
    promoSkipTimer = window.setInterval(() => {
      attempts++;
      const activeBtn = document.querySelector<HTMLButtonElement>(
        'button[aria-label*="advertisement" i], button[aria-label*="close ad" i]',
      );
      const activeVideos = Array.from(document.querySelectorAll<HTMLVideoElement>('video')).filter(
        isPromoVideo,
      );

      if (activeBtn && !activeBtn.disabled) {
        try {
          activeBtn.click();
        } catch (_e) {
          // Ignored
        }
      }
      for (const v of activeVideos) {
        try {
          v.muted = true;
          v.playbackRate = 16.0;
          if (v.duration && isFinite(v.duration) && v.currentTime < v.duration) {
            v.currentTime = v.duration;
          }
        } catch (_e) {
          // Ignored
        }
      }

      if ((!activeBtn && activeVideos.length === 0) || attempts >= 20) {
        if (promoSkipTimer !== null) {
          clearInterval(promoSkipTimer);
          promoSkipTimer = null;
        }
      }
    }, 50);
  }
}
