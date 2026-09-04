import { state } from '../../state';
import { getActiveVideo, getCachedVideo } from '../video/detector';
import { getActiveVideoElement, setupVideoListeners } from '../video/controller';
import { injectSpeedControl } from '../ui/speed-hud';
import { injectSkipSilenceButton } from '../ui/silence-hud';
import { injectInstantHideButton } from '../ui/focus-mode';
import { injectFinishTimeBadge } from '../ui/finish-time';
import { injectSyncButton } from '../sync/sync-button';
import { isSSEngineRunning, ssInit } from '../audio/skip-silence';

let isModifyingDOM = false;
let monitorTimeout: any = null;
let monitorIntervalId: any = null;
let observer: MutationObserver | null = null;

// Throttled execution of DOM monitoring to optimize performance
export function throttledMonitor(): void {
  if (monitorTimeout) return;
  monitorTimeout = setTimeout(() => {
    monitorTimeout = null;
    monitor();
    manageMonitorInterval();
  }, 150);
}

// Start or stop the safety-net interval based on whether a video or tab navigation exists
export function manageMonitorInterval(): void {
  const cached = getCachedVideo();
  const hasVideo = !!(cached && (cached as any).isConnected);
  const hasTabs = !!document.querySelector('[class*="_parentTab_"]');
  const needsInterval = hasVideo || hasTabs;

  if (needsInterval && !monitorIntervalId) {
    // Active elements found — start the safety-net interval
    monitorIntervalId = setInterval(throttledMonitor, 1000);
  } else if (!needsInterval && monitorIntervalId) {
    // Nothing active — stop the interval to save CPU
    clearInterval(monitorIntervalId);
    monitorIntervalId = null;
  }
}

// Main monitoring function
export function monitor(): void {
  if (isModifyingDOM) return;

  // 1. In-page Sync button injection (runs on tabbed pages regardless of video presence)
  try {
    injectSyncButton();
  } catch (err) {
    console.error('[Padhle] Error injecting sync button:', err);
  }

  // 2. Video HUD and controls (only on video player pages)
  const video = getActiveVideo();
  if (video) {
    if (video !== getActiveVideoElement()) {
      setupVideoListeners(video);
    }
    isModifyingDOM = true;
    try {
      injectSpeedControl();
      injectSkipSilenceButton();
      injectInstantHideButton();
      injectFinishTimeBadge();
    } finally {
      isModifyingDOM = false;
    }
    if (state.skipSilenceEnabled && !isSSEngineRunning() && !video.paused) {
      ssInit();
    }
  }
}

// Setup DOM Observer for dynamic injections and visibility synchronization
export function startDomObserver(): void {
  if (observer) return;

  observer = new MutationObserver(() => {
    if (isModifyingDOM) return;
    throttledMonitor();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Initial execution
  monitor();
  manageMonitorInterval();
}
