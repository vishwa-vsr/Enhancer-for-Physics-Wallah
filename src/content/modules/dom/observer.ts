import { state } from '../../state';
import { getActiveVideo, getCachedVideo } from '../video/detector';
import { getActiveVideoElement, setupVideoListeners } from '../video/controller';
import { injectSpeedControl } from '../ui/speed-hud';
import { injectQualityControl } from '../ui/quality-hud';
import { injectSkipSilenceButton } from '../ui/silence-hud';
import { injectInstantHideButton } from '../ui/focus-mode';
import { injectFinishTimeBadge } from '../ui/finish-time';
import { isSSEngineRunning, ssInit } from '../audio/skip-silence';

let isModifyingDOM = false;
let monitorTimeout: any = null;
let monitorIntervalId: any = null;
let observer: MutationObserver | null = null;

// Helper to check if all necessary extension controls are already placed and connected
export function areControlsHealthy(): boolean {
  if (!state.extensionEnabled) return true;
  const speedCtrl = document.getElementById('pwc-speed-control');
  if (!speedCtrl || !speedCtrl.isConnected) return false;

  if (state.showFinishTime) {
    const finishBadge = document.getElementById('pwc-finish-time-badge');
    if (!finishBadge || !finishBadge.isConnected) return false;
  }

  if (state.constantVideoQuality) {
    const qualityCtrl = document.getElementById('pwc-quality-control');
    if (!qualityCtrl || !qualityCtrl.isConnected) return false;
  }

  const hideBtn = document.getElementById('pwc-instant-hide-btn');
  if (state.enableInstantHide) {
    if (!hideBtn || !hideBtn.isConnected) return false;
  } else if (hideBtn) {
    return false;
  }

  return true;
}

// Throttled execution of DOM monitoring to optimize performance
export function throttledMonitor(): void {
  if (monitorTimeout) return;
  monitorTimeout = setTimeout(() => {
    monitorTimeout = null;
    monitor();
    manageMonitorInterval();
  }, 150);
}

// Start or stop the safety-net interval based on whether a video exists
export function manageMonitorInterval(): void {
  const cached = getCachedVideo();
  const hasVideo = !!(cached && (cached as any).isConnected);
  if (hasVideo && !monitorIntervalId) {
    // Video found — start a relaxed safety-net interval
    monitorIntervalId = setInterval(() => {
      // If controls are already alive and healthy, do zero work
      if (areControlsHealthy()) return;
      throttledMonitor();
    }, 2000);
  } else if (!hasVideo && monitorIntervalId) {
    // No video — stop the interval to save CPU
    clearInterval(monitorIntervalId);
    monitorIntervalId = null;
  }
}

// Main monitoring function
export function monitor(): void {
  if (isModifyingDOM) return;
  const video = getActiveVideo();
  if (video) {
    if (video !== getActiveVideoElement()) {
      setupVideoListeners(video);
    }
    // Fast path: if all controls are already in the DOM and connected, skip injection cycle
    if (areControlsHealthy()) {
      if (state.skipSilenceEnabled && !isSSEngineRunning() && !video.paused) {
        ssInit();
      }
      return;
    }

    isModifyingDOM = true;
    try {
      injectSpeedControl();
      injectQualityControl();
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

  observer = new MutationObserver((mutations) => {
    if (isModifyingDOM) return;

    let hasRelevantMutation = false;
    for (let i = 0; i < mutations.length; i++) {
      const mut = mutations[i];
      const target = mut.target as HTMLElement;

      // Skip mutations strictly inside chat, doubt, comment, emote, or live interactive containers
      if (
        target &&
        typeof target.closest === 'function' &&
        (target.closest('[class*="chat" i]') ||
          target.closest('[id*="chat" i]') ||
          target.closest('[class*="doubt" i]') ||
          target.closest('[class*="comment" i]') ||
          target.closest('[class*="poll" i]') ||
          target.closest('[class*="emote" i]') ||
          target.closest('[id*="emote" i]') ||
          target.closest('#interactive-layer-wrapper') ||
          target.closest('#player-animation'))
      ) {
        continue;
      }

      // Skip mutations where only pwc elements were added
      if (mut.addedNodes.length > 0) {
        let onlySelf = true;
        for (let j = 0; j < mut.addedNodes.length; j++) {
          const node = mut.addedNodes[j] as HTMLElement;
          const id = node.id || '';
          const cls = typeof node.className === 'string' ? node.className : '';
          if (id.startsWith('pwc-') || cls.includes('pwc-')) continue;
          onlySelf = false;
          break;
        }
        if (onlySelf) continue;
      }

      hasRelevantMutation = true;
      break;
    }

    if (hasRelevantMutation) {
      throttledMonitor();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Initial execution
  monitor();
  manageMonitorInterval();
}
