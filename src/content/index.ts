import { state, initState, subscribeState } from './state';
import { applySpeedToActiveVideo, setVideoPlaybackRate } from './modules/video/controller';
import { applySettingsHTML, applyDistractorsState, classMap } from './modules/distractions/focus-css';
import { applyAlwaysExpandState, updatePlayerTicks } from './modules/ui/speed-hud';
import { injectFinishTimeBadge, updateFinishTime } from './modules/ui/finish-time';
import {
  ssInit,
  ssDestroy,
  isSSEngineRunning,
  getSSCurrentState,
  getSSAudioContext,
  getSSGainNode,
} from './modules/audio/skip-silence';
import { initKeyboardShortcuts } from './modules/shortcuts/keyboard';
import { initSpaceHold } from './modules/shortcuts/space-hold';
import { initAutoPause } from './modules/visibility/auto-pause';
import { startDomObserver } from './modules/dom/observer';
import { HideSettings } from './types';

// Entry point initialization
function init(): void {
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
      if (currentState.skipSilenceEnabled) {
        ssInit();
      }
      previousSkipSilenceEnabled = currentState.skipSilenceEnabled;
      return;
    }

    if (changedKeys.includes('extensionEnabled')) {
      focusChanged = true;
    }

    const hideKeys = Object.keys(classMap) as (keyof HideSettings)[];
    for (const key of hideKeys) {
      if (changedKeys.includes(key)) {
        focusChanged = true;
      }
    }

    if (changedKeys.includes('enableInstantHide')) {
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
        ssInit();
      } else if (!currentState.skipSilenceEnabled && wasEnabled) {
        ssDestroy();
      }
    }

    if (changedKeys.includes('skipSilenceSilenceSpeed')) {
      if (isSSEngineRunning() && getSSCurrentState() === 'silence') {
        setVideoPlaybackRate(currentState.skipSilenceSilenceSpeed);
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

    if (changedKeys.includes('snapPoints')) {
      updatePlayerTicks(currentState.snapPoints);
    }

    if (changedKeys.includes('preferredSpeed')) {
      applySpeedToActiveVideo();
    }

    if (focusChanged) {
      applySettingsHTML(currentState.hideSettings);
      applyDistractorsState();
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    }
  });

  // 2. Initialize state from storage
  initState();

  // 3. Register user interactions & global listeners
  initKeyboardShortcuts();
  initSpaceHold();
  initAutoPause();

  // 4. Start DOM observer for dynamic injections
  startDomObserver();
}

// Execute immediately upon content script injection
init();
