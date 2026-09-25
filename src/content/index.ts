import { state, initState, subscribeState } from './state';
import {
  applySpeedToActiveVideo,
  setVideoPlaybackRate,
  getEffectiveSilenceSpeed,
} from './modules/video/controller';
import {
  initQualityController,
  applyQuality,
  syncConstantQuality,
} from './modules/video/quality-controller';
import {
  applySettingsHTML,
  applyDistractorsState,
  classMap,
} from './modules/distractions/focus-css';
import { applyAlwaysExpandState, updatePlayerTicks } from './modules/ui/speed-hud';
import { injectFinishTimeBadge, updateFinishTime } from './modules/ui/finish-time';
import { injectInstantHideButton } from './modules/ui/focus-mode';
import {
  ssInit,
  ssDestroy,
  isSSEngineRunning,
  getSSCurrentState,
  getSSAudioContext,
  getSSGainNode,
  initGlobalGestureUnlock,
  syncSSLowCpuMode,
} from './modules/audio/skip-silence';
import { getActiveVideo } from './modules/video/detector';
import { initKeyboardShortcuts } from './modules/shortcuts/keyboard';
import { initSpaceHold, cancelPointerHold, cancelSpaceHold } from './modules/shortcuts/space-hold';
import { initAutoPause } from './modules/visibility/auto-pause';
import { initFocusLock, deactivateFocusLock } from './modules/ui/focus-lock';
import { startDomObserver, throttledMonitor, initWakeupTriggers } from './modules/dom/observer';
import { initAutoHide, syncAutoHide } from './modules/ui/autohide';
import { HideSettings } from './types';

// Entry point initialization
function init(): void {
  // Guard against non-video subframes (e.g. payment, quizzes, chat frames)
  if (window.top !== window.self && !document.querySelector('video')) {
    return;
  }

  // 1. Subscribe to reactive state updates from storage
  let previousSkipSilenceEnabled = state.skipSilenceEnabled;

  subscribeState((currentState, changedKeys) => {
    let focusChanged = false;

    if (changedKeys.includes('*')) {
      // Initial state loaded
      applyAlwaysExpandState();
      applySettingsHTML(currentState.hideSettings);
      applyDistractorsState();
      applySpeedToActiveVideo();
      syncAutoHide();
      syncConstantQuality(currentState.constantVideoQuality);
      if (currentState.constantVideoQuality) {
        applyQuality(currentState.preferredQuality);
      }
      const initVid = getActiveVideo();
      if (currentState.skipSilenceEnabled && initVid && !initVid.paused) {
        ssInit();
      }
      previousSkipSilenceEnabled = currentState.skipSilenceEnabled;
      return;
    }

    if (changedKeys.includes('extensionEnabled')) {
      if (!currentState.extensionEnabled) {
        // Turning the extension off must also end any running Focus Lock
        // session so all distraction hiding is restored cleanly.
        deactivateFocusLock();
        cancelPointerHold();
        cancelSpaceHold();
      }
      injectInstantHideButton();
      focusChanged = true;
    }

    const hideKeys = Object.keys(classMap) as (keyof HideSettings)[];
    for (const key of hideKeys) {
      if (changedKeys.includes(key)) {
        focusChanged = true;
      }
    }

    if (changedKeys.includes('enableInstantHide')) {
      injectInstantHideButton();
      focusChanged = true;
    }

    if (changedKeys.includes('alwaysExpandWidget')) {
      applyAlwaysExpandState();
    }

    if (changedKeys.includes('showFinishTime')) {
      injectFinishTimeBadge();
      updateFinishTime();
    }

    if (changedKeys.includes('finishTimeFormat')) {
      updateFinishTime();
    }

    if (changedKeys.includes('skipSilenceEnabled')) {
      const wasEnabled = previousSkipSilenceEnabled;
      previousSkipSilenceEnabled = currentState.skipSilenceEnabled;
      if (currentState.skipSilenceEnabled && !wasEnabled) {
        const activeVid = getActiveVideo();
        if (activeVid && !activeVid.paused) {
          ssInit();
        }
      } else if (!currentState.skipSilenceEnabled && wasEnabled) {
        ssDestroy();
      }
    }

    if (changedKeys.includes('skipSilenceSilenceSpeed')) {
      if (isSSEngineRunning() && getSSCurrentState() === 'silence') {
        setVideoPlaybackRate(getEffectiveSilenceSpeed());
      }
    }

    if (changedKeys.includes('skipSilenceMute')) {
      const audioCtx = getSSAudioContext();
      const gainNode = getSSGainNode();
      if (gainNode && audioCtx) {
        if (currentState.skipSilenceMute && getSSCurrentState() === 'silence') {
          gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.01);
        } else {
          gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 0.01);
        }
      }
    }

    if (changedKeys.includes('skipSilenceLowCpu')) {
      syncSSLowCpuMode(currentState.skipSilenceLowCpu);
    }

    if (changedKeys.includes('snapPoints')) {
      updatePlayerTicks(currentState.snapPoints);
    }

    if (changedKeys.includes('preferredSpeed')) {
      applySpeedToActiveVideo();
    }

    if (changedKeys.includes('constantVideoQuality')) {
      syncConstantQuality(currentState.constantVideoQuality);
      if (currentState.constantVideoQuality) {
        applyQuality(currentState.preferredQuality);
      }
      focusChanged = true;
    }

    if (changedKeys.includes('preferredQuality')) {
      if (currentState.constantVideoQuality) {
        applyQuality(currentState.preferredQuality);
      }
    }

    if (
      changedKeys.includes('autoHideControls') ||
      changedKeys.includes('autoHideDelay') ||
      changedKeys.includes('autoHideWhenPaused')
    ) {
      syncAutoHide();
    }

    if (focusChanged) {
      applySettingsHTML(currentState.hideSettings);
      applyDistractorsState();
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    }
  });

  // 2. Initialize quality controller & bridge listener
  initQualityController();

  // 3. Initialize state from storage
  initState();

  // 4. Register user interactions & global listeners
  initGlobalGestureUnlock();
  initKeyboardShortcuts();
  initAutoHide();
  initSpaceHold();
  initAutoPause();
  initFocusLock();
  initWakeupTriggers();

  // 5. Start DOM observer for dynamic injections
  startDomObserver();

  // 6. Refresh controls upon full-screen toggling or window resize
  document.addEventListener('fullscreenchange', throttledMonitor);
  window.addEventListener('resize', throttledMonitor);
}

// Execute immediately upon content script injection
init();
