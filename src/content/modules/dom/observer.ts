import { state } from '../../state';
import { getActiveVideo, clearVideoCache } from '../video/detector';
import {
  getActiveVideoElement,
  setupVideoListeners,
  setActiveVideoElement,
} from '../video/controller';
import { resetDistractionCaches } from '../distractions/elements';
import { handlePromoAds } from '../distractions/promo-skipper';
import { handleRecordedPolls } from '../distractions/poll-blocker';
import { applyDistractorsState } from '../distractions/focus-css';
import { injectSpeedControl } from '../ui/speed-hud';
import { injectQualityControl } from '../ui/quality-hud';
import { injectSkipSilenceButton } from '../ui/silence-hud';
import { injectInstantHideButton } from '../ui/focus-mode';
import { injectFinishTimeBadge } from '../ui/finish-time';
import { syncAutoHideBossClass } from '../ui/autohide';
import {
  CONTROLS_TRAY_ID,
  areTrayControlsOrdered,
  clearControlsTray,
  findControlsToolbar,
  isInsideControlsTray,
  removeControlsTrayIfEmpty,
} from '../ui/toast';
import { ensureAudioPipelineRunning } from '../audio/skip-silence';
import { isUserTyping } from '../shortcuts/keyboard';

let isModifyingDOM = false;
let monitorTimeout: ReturnType<typeof setTimeout> | null = null;
let monitorIntervalId: ReturnType<typeof setInterval> | null = null;
let observer: MutationObserver | null = null;

// Helper to check if all necessary extension controls are already placed, grouped, and ordered in #pwc-controls-tray
export function areControlsHealthy(): boolean {
  if (!state.extensionEnabled) {
    return (
      !document.getElementById(CONTROLS_TRAY_ID) &&
      !document.getElementById('pwc-speed-control') &&
      !document.getElementById('pwc-quality-control') &&
      !document.getElementById('pwc-ss-container') &&
      !document.getElementById('pwc-finish-time-badge') &&
      !document.getElementById('pwc-instant-hide-btn')
    );
  }

  const toolbar = findControlsToolbar();
  const tray = document.getElementById(CONTROLS_TRAY_ID);
  if (!toolbar || !tray || !tray.isConnected || tray.parentElement !== toolbar) {
    return false;
  }

  if (!isInsideControlsTray(document.getElementById('pwc-speed-control'))) return false;

  const ssCtrl = document.getElementById('pwc-ss-container');
  if (state.skipSilenceEnabled) {
    if (!isInsideControlsTray(ssCtrl)) return false;
  } else if (ssCtrl) {
    return false;
  }

  const finishBadge = document.getElementById('pwc-finish-time-badge');
  const needsFinishBadge =
    state.lectureTimeEnabled && (state.showFinishTime || state.showLiveCatchUp);
  if (needsFinishBadge) {
    if (!isInsideControlsTray(finishBadge)) return false;
  } else if (finishBadge) {
    return false;
  }

  const qualityCtrl = document.getElementById('pwc-quality-control');
  if (state.constantVideoQuality) {
    if (!isInsideControlsTray(qualityCtrl)) return false;
  } else if (qualityCtrl) {
    return false;
  }

  const hideBtn = document.getElementById('pwc-instant-hide-btn');
  if (state.enableInstantHide) {
    if (!isInsideControlsTray(hideBtn)) return false;
  } else if (hideBtn) {
    return false;
  }

  return areTrayControlsOrdered(tray);
}

// Throttled execution of DOM monitoring to optimize performance
export function throttledMonitor(): void {
  handlePromoAds();
  handleRecordedPolls();
  if (monitorTimeout) return;
  monitorTimeout = setTimeout(() => {
    monitorTimeout = null;
    handlePromoAds();
    handleRecordedPolls();
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
          if (monitorIntervalId !== null) {
            clearInterval(monitorIntervalId);
            monitorIntervalId = null;
          }
          return;
        }
        throttledMonitor();
      }, 1000);
    }
  } else if ((!onWatch || healthy) && monitorIntervalId !== null) {
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
  window.addEventListener(
    'keydown',
    () => {
      if (isUserTyping()) return;
      onInteractionOrPlay();
    },
    { capture: true, passive: true },
  );

  // Media play event: capture play events from any video on the page
  window.addEventListener('play', onInteractionOrPlay, { capture: true, passive: true });

  // Browser back/forward navigation
  window.addEventListener('popstate', onInteractionOrPlay, { passive: true });
}

// Main monitoring function
export function monitor(): void {
  if (isModifyingDOM) return;

  const video = getActiveVideo();
  const hasToolbar = !video && Boolean(findControlsToolbar());

  if (!state.extensionEnabled && !video && !hasToolbar) {
    isModifyingDOM = true;
    try {
      clearControlsTray();
      applyDistractorsState();
      syncAutoHideBossClass();
    } finally {
      isModifyingDOM = false;
    }
    return;
  }

  if (video || hasToolbar) {
    if (video && video !== getActiveVideoElement()) {
      setupVideoListeners(video);
    }
    // Fast path: if all controls are already in the DOM and connected, still ensure Focus Toggles & Auto-Hide are enforced
    if (areControlsHealthy()) {
      isModifyingDOM = true;
      try {
        applyDistractorsState();
        syncAutoHideBossClass();
      } finally {
        isModifyingDOM = false;
      }
      if (
        video &&
        ((state.skipSilenceEnabled && state.skipSilenceActive) ||
          state.volumeBalancerEnabled) &&
        !video.paused
      ) {
        ensureAudioPipelineRunning();
      }
      return;
    }

    isModifyingDOM = true;
    try {
      injectFinishTimeBadge();
      injectSkipSilenceButton();
      injectQualityControl();
      injectSpeedControl();
      injectInstantHideButton();
      if (!state.extensionEnabled) {
        clearControlsTray();
      } else {
        removeControlsTrayIfEmpty();
      }
      applyDistractorsState();
      syncAutoHideBossClass();
    } finally {
      isModifyingDOM = false;
    }
    if (
      video &&
      ((state.skipSilenceEnabled && state.skipSilenceActive) ||
        state.volumeBalancerEnabled) &&
      !video.paused
    ) {
      ensureAudioPipelineRunning();
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
          (!state.blockRecordedPolls && target.closest('[class*="poll" i]')) ||
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
