import { state } from '../../state';
import { getActiveVideo, getCachedVideo, clearVideoCache } from '../video/detector';
import { getActiveVideoElement, setupVideoListeners, setActiveVideoElement } from '../video/controller';
import { resetDistractionCaches } from '../distractions/elements';
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

export function isLecturePage(): boolean {
  return (
    (typeof location !== 'undefined' && location.href.includes('/watch')) ||
    !!document.getElementById('video-player-container') ||
    !!document.getElementById('pw_auth-flow') ||
    !!document.querySelector('video')
  );
}

let lastUrl = typeof location !== 'undefined' ? location.href : '';

export function checkUrlChange(): void {
  if (typeof location === 'undefined') return;
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    onLectureChanged();
  }
}

export function onLectureChanged(): void {
  clearVideoCache();
  setActiveVideoElement(null);
  resetDistractionCaches();
  throttledMonitor();
  manageMonitorInterval();
}

// Start or stop the safety-net interval: runs only while waiting for controls on lecture pages
export function manageMonitorInterval(): void {
  const onWatch = isLecturePage();
  const healthy = areControlsHealthy();

  // If on a lecture page and controls are not yet healthy, pulse once a second
  if (onWatch && !healthy) {
    if (!monitorIntervalId) {
      monitorIntervalId = setInterval(() => {
        checkUrlChange();
        if (areControlsHealthy()) {
          // Stop timer completely once controls are in place and healthy to save CPU
          clearInterval(monitorIntervalId);
          monitorIntervalId = null;
          return;
        }
        throttledMonitor();
      }, 1000);
    }
  } else if ((!onWatch || healthy) && monitorIntervalId) {
    // Controls are healthy or navigated away from lecture pages — stop timer completely
    clearInterval(monitorIntervalId);
    monitorIntervalId = null;
  }
}

let wakeupInitialized = false;

// Global wake-up triggers on user interaction, navigation, and video playback
export function initWakeupTriggers(): void {
  if (wakeupInitialized || typeof window === 'undefined') return;
  wakeupInitialized = true;

  const onInteractionOrPlay = () => {
    checkUrlChange();
    if (areControlsHealthy()) return;
    throttledMonitor();
  };

  // User interactions: click, touch, or keypress anywhere on the page
  window.addEventListener('pointerdown', onInteractionOrPlay, { capture: true, passive: true });
  window.addEventListener('keydown', onInteractionOrPlay, { capture: true, passive: true });

  // Media play event: capture play events from any video on the page
  window.addEventListener('play', onInteractionOrPlay, { capture: true, passive: true });

  // Browser back/forward navigation
  window.addEventListener('popstate', onInteractionOrPlay, { passive: true });
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
