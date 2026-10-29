import { ContentState, HideSettings, LiveCatchUpFormat, StateChangeListener, ThemeMode, VideoQuality } from './types';
import { resolveSafeSpeedShortcuts, sanitizeSpeedShortcut } from '../shared/shortcuts';

export const DEFAULT_HIDE_SETTINGS: HideSettings = {
  hideAskAI: false,
  hideDoubt: false,
  hideChat: false,
  hideNotes: false,
  hideNoteTimeline: false,
  hideSpeed: false,
  hideQuality: true,
  hideSkipSilence: false,
  hideSetting: false,
  hideTimeLine: false,
  hideTimeText: false,
  hideNextLecture: false,
  hideNextChapter: false,
  hideAttemptDPP: false,
};

export const DEFAULT_CONTENT_STATE: ContentState = {
  currentSpeed: 1.0,
  constantVideoQuality: false,
  preferredQuality: '720p',
  snapPoints: [1.0, 1.5, 2.0, 2.5],

  hideSettings: { ...DEFAULT_HIDE_SETTINGS },
  enableInstantHide: false,
  autoSkipPromoAds: false,
  blockRecordedPolls: false,

  enableHotkeys: false,
  disableScroll: false,
  volumeScrollEnabled: false,
  showVolumeBubble: true,
  volumeBubbleDelay: 0.4,
  holdSpaceSpeedUp: false,
  holdSpaceSpeed: 2.0,
  alwaysExpandWidget: false,
  lectureTimeEnabled: true,
  showFinishTime: true,
  finishTimeFormat: 'clock',
  showLiveCatchUp: true,
  liveCatchUpFormat: 'catch',
  keySpeedUp: 'h',
  keySlowDown: 'j',
  keyReset: 'l',
  autoPauseOnHide: false,

  keyChat: 'c',
  keyTimeline: 't',
  keyNotes: 'n',
  keyDoubt: 'd',
  keyFullscreen: 'f',
  keyExit: 'e',
  allowShortcutsWhenHidden: false,

  autoHideControls: false,
  autoHideDelay: 0.8,
  autoHideWhenPaused: false,

  skipSilenceEnabled: false,
  skipSilenceSilenceSpeed: 6.0,
  skipSilenceThreshold: -40,
  skipSilenceDynamicThreshold: true,
  skipSilenceMute: false,
  skipSilenceTimeSaved: 0,
  skipSilenceMinDuration: 0.5,
  skipSilenceLowCpu: false,

  volumeBalancerEnabled: false,
  volumeBalancerMode: 'balanced',

  extensionEnabled: true,
  themeMode: 'dark',
};

export const state: ContentState = {
  ...DEFAULT_CONTENT_STATE,
  hideSettings: { ...DEFAULT_HIDE_SETTINGS },
};

const listeners: Set<StateChangeListener> = new Set();

export function subscribeState(listener: StateChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(changedKeys: string[]): void {
  listeners.forEach((fn) => {
    try {
      fn(state, changedKeys);
    } catch (err) {
      console.error('PW Control state listener error:', err);
    }
  });
}

// Sanitize 4 snap points array
export function sanitizeSnapPoints(points: any): number[] {
  if (!points || !Array.isArray(points) || points.length !== 4) {
    return [1.0, 1.5, 2.0, 2.5];
  }
  const raw = points.map((v) => {
    let n = parseFloat(v);
    if (isNaN(n) || n < 0.5) n = 0.5;
    if (n > 4.0) n = 4.0;
    return Math.round(n * 10) / 10;
  });
  raw.sort((a, b) => a - b);
  for (let i = 1; i < raw.length; i++) {
    if (raw[i] <= raw[i - 1]) {
      raw[i] = Math.min(4.0, Math.round((raw[i - 1] + 0.1) * 10) / 10);
    }
  }
  for (let i = raw.length - 2; i >= 0; i--) {
    if (raw[i] >= raw[i + 1]) {
      raw[i] = Math.max(0.5, Math.round((raw[i + 1] - 0.1) * 10) / 10);
    }
  }
  return raw;
}

// Helper to safely access chrome storage without throwing context invalidated exceptions
export function safeGetSettings(callback: (result: Record<string, any>) => void): void {
  if (
    typeof chrome === 'undefined' ||
    !chrome.runtime ||
    !chrome.runtime.id ||
    !chrome.storage ||
    !chrome.storage.local
  ) {
    return;
  }
  try {
    chrome.storage.local.get(
      [
        'preferredSpeed',
        'constantVideoQuality',
        'preferredQuality',
        'hideAskAI',
        'hideDoubt',
        'hideChat',
        'hideNotes',
        'hideNoteTimeline',
        'hideSpeed',
        'hideQuality',
        'hideSkipSilence',
        'hideSetting',
        'hideTimeLine',
        'hideTimeText',
        'hideNextLecture',
        'hideNextChapter',
        'hideAttemptDPP',
        'enableInstantHide',
        'autoSkipPromoAds',
        'blockRecordedPolls',
        'enableHotkeys',
        'disableScroll',
        'volumeScrollEnabled',
        'showVolumeBubble',
        'volumeBubbleDelay',
        'holdSpaceSpeedUp',
        'holdSpaceSpeed',
        'alwaysExpandWidget',
        'lectureTimeEnabled',
        'showFinishTime',
        'finishTimeFormat',
        'showLiveCatchUp',
        'liveCatchUpFormat',
        'keySpeedUp',
        'keySlowDown',
        'keyReset',
        'keyChat',
        'keyTimeline',
        'keyNotes',
        'keyDoubt',
        'keyFullscreen',
        'keyExit',
        'allowShortcutsWhenHidden',
        'autoHideControls',
        'autoHideDelay',
        'autoHideWhenPaused',
        'snapPoints',
        'extensionEnabled',
        'skipSilenceEnabled',
        'skipSilenceSilenceSpeed',
        'skipSilenceThreshold',
        'skipSilenceDynamicThreshold',
        'skipSilenceMute',
        'skipSilenceTimeSaved',
        'skipSilenceMinDuration',
        'skipSilenceLowCpu',
        'volumeBalancerEnabled',
        'volumeBalancerMode',
        'autoPauseOnHide',
        'themeMode',
      ],
      function (result) {
        try {
          if (chrome.runtime && chrome.runtime.id) {
            callback(result);
          }
        } catch (_e) {
          // Ignored: extension context invalidated
        }
      },
    );
  } catch (_err) {
    // Ignored: chrome runtime unavailable
  }
}

// Helper to safely write chrome storage without throwing context invalidated exceptions
export function safeSetSettings(data: Record<string, any>): void {
  if (
    typeof chrome === 'undefined' ||
    !chrome.runtime ||
    !chrome.runtime.id ||
    !chrome.storage ||
    !chrome.storage.local
  ) {
    return;
  }
  try {
    chrome.storage.local.set(data, function () {
      // Read lastError to suppress orphaned context developer warnings in console
      const _lastError = chrome.runtime.lastError;
      void _lastError;
    });
  } catch (_err) {
    // Ignored: chrome runtime unavailable
  }
}

let isInitialized = false;

function readShortcutKey(value: unknown, fallback: string): string {
  return value !== undefined ? String(value) : fallback;
}

// Initialize state from storage and listen to onChanged
export function initState(onLoaded?: () => void): void {
  if (isInitialized) return;
  isInitialized = true;

  safeGetSettings(function (result) {
    state.extensionEnabled = result.extensionEnabled !== false;
    if (result.preferredSpeed) {
      state.currentSpeed = parseFloat(result.preferredSpeed);
    }
    state.constantVideoQuality = !!result.constantVideoQuality;
    if (result.preferredQuality) {
      state.preferredQuality = result.preferredQuality;
    }
    const hideKeys = Object.keys(DEFAULT_HIDE_SETTINGS) as (keyof HideSettings)[];
    for (const key of hideKeys) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        state.hideSettings[key] = !!result[key];
      }
    }

    state.enableInstantHide = !!result.enableInstantHide;
    state.autoSkipPromoAds = !!result.autoSkipPromoAds;
    state.blockRecordedPolls = !!result.blockRecordedPolls;
    state.enableHotkeys = !!result.enableHotkeys;
    state.disableScroll = !!result.disableScroll;
    state.volumeScrollEnabled = !!result.volumeScrollEnabled;
    state.showVolumeBubble = result.showVolumeBubble !== false;
    state.volumeBubbleDelay =
      result.volumeBubbleDelay !== undefined ? parseFloat(result.volumeBubbleDelay) : 0.4;
    state.holdSpaceSpeedUp = !!result.holdSpaceSpeedUp;
    state.holdSpaceSpeed =
      result.holdSpaceSpeed !== undefined ? parseFloat(result.holdSpaceSpeed) : 2.0;
    state.alwaysExpandWidget = !!result.alwaysExpandWidget;

    state.keyChat = readShortcutKey(result.keyChat, 'c');
    state.keyTimeline = readShortcutKey(result.keyTimeline, 't');
    state.keyNotes = readShortcutKey(result.keyNotes, 'n');
    state.keyDoubt = readShortcutKey(result.keyDoubt, 'd');
    state.keyFullscreen = readShortcutKey(result.keyFullscreen, 'f');
    state.keyExit = readShortcutKey(result.keyExit, 'e');
    state.allowShortcutsWhenHidden = !!result.allowShortcutsWhenHidden;

    const resolvedSpeedKeys = resolveSafeSpeedShortcuts(result, [
      state.keyChat,
      state.keyTimeline,
      state.keyNotes,
      state.keyDoubt,
      state.keyFullscreen,
      state.keyExit,
    ]);
    state.keySpeedUp = resolvedSpeedKeys.keySpeedUp;
    state.keySlowDown = resolvedSpeedKeys.keySlowDown;
    state.keyReset = resolvedSpeedKeys.keyReset;

    const shortcutFixes: Record<string, string> = {};
    if (result.keySpeedUp !== undefined && result.keySpeedUp !== state.keySpeedUp) {
      shortcutFixes.keySpeedUp = state.keySpeedUp;
    }
    if (result.keySlowDown !== undefined && result.keySlowDown !== state.keySlowDown) {
      shortcutFixes.keySlowDown = state.keySlowDown;
    }
    if (result.keyReset !== undefined && result.keyReset !== state.keyReset) {
      shortcutFixes.keyReset = state.keyReset;
    }
    if (Object.keys(shortcutFixes).length > 0) {
      safeSetSettings(shortcutFixes);
    }

    state.autoHideControls = !!result.autoHideControls;
    state.autoHideDelay =
      result.autoHideDelay !== undefined ? parseFloat(result.autoHideDelay) : 0.8;
    state.autoHideWhenPaused = !!result.autoHideWhenPaused;

    if (result.snapPoints && Array.isArray(result.snapPoints) && result.snapPoints.length === 4) {
      state.snapPoints = sanitizeSnapPoints(result.snapPoints);
    }

    state.skipSilenceEnabled = !!result.skipSilenceEnabled;
    state.skipSilenceSilenceSpeed =
      result.skipSilenceSilenceSpeed !== undefined
        ? parseFloat(result.skipSilenceSilenceSpeed)
        : 6.0;
    state.skipSilenceThreshold =
      result.skipSilenceThreshold !== undefined ? parseInt(result.skipSilenceThreshold, 10) : -40;
    state.skipSilenceDynamicThreshold = result.skipSilenceDynamicThreshold !== false;
    state.skipSilenceMute = !!result.skipSilenceMute;
    state.skipSilenceTimeSaved = result.skipSilenceTimeSaved || 0;
    state.skipSilenceMinDuration =
      result.skipSilenceMinDuration !== undefined ? parseFloat(result.skipSilenceMinDuration) : 0.5;
    state.skipSilenceLowCpu = !!result.skipSilenceLowCpu;

    state.volumeBalancerEnabled = !!result.volumeBalancerEnabled;
    state.volumeBalancerMode = (result.volumeBalancerMode as any) || 'balanced';

    state.lectureTimeEnabled = result.lectureTimeEnabled !== false;
    state.showFinishTime = result.showFinishTime !== false;
    state.finishTimeFormat = result.finishTimeFormat === 'full' ? 'full' : 'clock';
    state.showLiveCatchUp = result.showLiveCatchUp !== false;
    state.liveCatchUpFormat = result.liveCatchUpFormat === 'lag' ? 'lag' : 'catch';
    state.autoPauseOnHide = !!result.autoPauseOnHide;
    state.themeMode = result.themeMode || 'dark';
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.toggle('pwc-light-theme', state.themeMode === 'light');
    }

    if (onLoaded) {
      onLoaded();
    }
    notifyListeners(['*']);
  });

  // Listen for storage changes from the settings popup
  if (
    typeof chrome !== 'undefined' &&
    chrome.runtime &&
    chrome.runtime.id &&
    chrome.storage &&
    chrome.storage.onChanged
  ) {
    try {
      chrome.storage.onChanged.addListener(function (changes, area) {
        try {
          if (!chrome.runtime || !chrome.runtime.id) return;
          if (area === 'local') {
            const changedKeys: string[] = [];

            if (Object.prototype.hasOwnProperty.call(changes, 'themeMode')) {
              state.themeMode = (changes.themeMode.newValue as ThemeMode) || 'dark';
              if (typeof document !== 'undefined' && document.documentElement) {
                document.documentElement.classList.toggle(
                  'pwc-light-theme',
                  state.themeMode === 'light',
                );
              }
              changedKeys.push('themeMode');
            }

            if (Object.prototype.hasOwnProperty.call(changes, 'extensionEnabled')) {
              state.extensionEnabled = changes.extensionEnabled.newValue !== false;
              changedKeys.push('extensionEnabled');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'preferredQuality')) {
              state.preferredQuality =
                (changes.preferredQuality.newValue as VideoQuality) || '720p';
              changedKeys.push('preferredQuality');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'constantVideoQuality')) {
              state.constantVideoQuality = !!changes.constantVideoQuality.newValue;
              changedKeys.push('constantVideoQuality');
            }

            const hideKeys = Object.keys(DEFAULT_HIDE_SETTINGS) as (keyof HideSettings)[];
            for (const key of hideKeys) {
              if (Object.prototype.hasOwnProperty.call(changes, key)) {
                state.hideSettings[key] = !!changes[key].newValue;
                changedKeys.push(key);
              }
            }

            if (Object.prototype.hasOwnProperty.call(changes, 'autoSkipPromoAds')) {
              state.autoSkipPromoAds = !!changes.autoSkipPromoAds.newValue;
              changedKeys.push('autoSkipPromoAds');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'blockRecordedPolls')) {
              state.blockRecordedPolls = !!changes.blockRecordedPolls.newValue;
              changedKeys.push('blockRecordedPolls');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'enableInstantHide')) {
              state.enableInstantHide = !!changes.enableInstantHide.newValue;
              changedKeys.push('enableInstantHide');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'enableHotkeys')) {
              state.enableHotkeys = !!changes.enableHotkeys.newValue;
              changedKeys.push('enableHotkeys');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'disableScroll')) {
              state.disableScroll = !!changes.disableScroll.newValue;
              changedKeys.push('disableScroll');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'volumeScrollEnabled')) {
              state.volumeScrollEnabled = !!changes.volumeScrollEnabled.newValue;
              changedKeys.push('volumeScrollEnabled');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'showVolumeBubble')) {
              state.showVolumeBubble = changes.showVolumeBubble.newValue !== false;
              changedKeys.push('showVolumeBubble');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'volumeBubbleDelay')) {
              state.volumeBubbleDelay =
                changes.volumeBubbleDelay.newValue !== undefined
                  ? parseFloat(String(changes.volumeBubbleDelay.newValue))
                  : 0.4;
              changedKeys.push('volumeBubbleDelay');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'holdSpaceSpeedUp')) {
              state.holdSpaceSpeedUp = !!changes.holdSpaceSpeedUp.newValue;
              changedKeys.push('holdSpaceSpeedUp');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'holdSpaceSpeed')) {
              state.holdSpaceSpeed =
                changes.holdSpaceSpeed.newValue !== undefined
                  ? parseFloat(String(changes.holdSpaceSpeed.newValue))
                  : 2.0;
              changedKeys.push('holdSpaceSpeed');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'keySpeedUp')) {
              state.keySpeedUp = sanitizeSpeedShortcut(changes.keySpeedUp.newValue, 'h');
              changedKeys.push('keySpeedUp');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'keySlowDown')) {
              state.keySlowDown = sanitizeSpeedShortcut(changes.keySlowDown.newValue, 'j');
              changedKeys.push('keySlowDown');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'keyReset')) {
              state.keyReset = sanitizeSpeedShortcut(changes.keyReset.newValue, 'l');
              changedKeys.push('keyReset');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'alwaysExpandWidget')) {
              state.alwaysExpandWidget = !!changes.alwaysExpandWidget.newValue;
              changedKeys.push('alwaysExpandWidget');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'lectureTimeEnabled')) {
              state.lectureTimeEnabled = changes.lectureTimeEnabled.newValue !== false;
              changedKeys.push('lectureTimeEnabled');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'showFinishTime')) {
              state.showFinishTime = changes.showFinishTime.newValue !== false;
              changedKeys.push('showFinishTime');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'finishTimeFormat')) {
              state.finishTimeFormat = changes.finishTimeFormat.newValue === 'full' ? 'full' : 'clock';
              changedKeys.push('finishTimeFormat');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'showLiveCatchUp')) {
              state.showLiveCatchUp = changes.showLiveCatchUp.newValue !== false;
              changedKeys.push('showLiveCatchUp');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'liveCatchUpFormat')) {
              state.liveCatchUpFormat = changes.liveCatchUpFormat.newValue === 'lag' ? 'lag' : 'catch';
              changedKeys.push('liveCatchUpFormat');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'skipSilenceEnabled')) {
              state.skipSilenceEnabled = !!changes.skipSilenceEnabled.newValue;
              changedKeys.push('skipSilenceEnabled');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'skipSilenceSilenceSpeed')) {
              state.skipSilenceSilenceSpeed =
                parseFloat(String(changes.skipSilenceSilenceSpeed.newValue)) || 6.0;
              changedKeys.push('skipSilenceSilenceSpeed');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'skipSilenceThreshold')) {
              state.skipSilenceThreshold =
                parseInt(String(changes.skipSilenceThreshold.newValue), 10) || -40;
              changedKeys.push('skipSilenceThreshold');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'skipSilenceDynamicThreshold')) {
              state.skipSilenceDynamicThreshold =
                changes.skipSilenceDynamicThreshold.newValue !== false;
              changedKeys.push('skipSilenceDynamicThreshold');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'skipSilenceMute')) {
              state.skipSilenceMute = !!changes.skipSilenceMute.newValue;
              changedKeys.push('skipSilenceMute');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'skipSilenceTimeSaved')) {
              state.skipSilenceTimeSaved = Number(changes.skipSilenceTimeSaved.newValue) || 0;
              changedKeys.push('skipSilenceTimeSaved');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'skipSilenceMinDuration')) {
              state.skipSilenceMinDuration =
                parseFloat(String(changes.skipSilenceMinDuration.newValue)) || 0.5;
              changedKeys.push('skipSilenceMinDuration');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'skipSilenceLowCpu')) {
              state.skipSilenceLowCpu = !!changes.skipSilenceLowCpu.newValue;
              changedKeys.push('skipSilenceLowCpu');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'volumeBalancerEnabled')) {
              state.volumeBalancerEnabled = !!changes.volumeBalancerEnabled.newValue;
              changedKeys.push('volumeBalancerEnabled');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'volumeBalancerMode')) {
              state.volumeBalancerMode = (changes.volumeBalancerMode.newValue as any) || 'balanced';
              changedKeys.push('volumeBalancerMode');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'snapPoints')) {
              state.snapPoints = sanitizeSnapPoints(changes.snapPoints.newValue);
              changedKeys.push('snapPoints');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'preferredSpeed')) {
              state.currentSpeed = parseFloat(String(changes.preferredSpeed.newValue)) || 1.0;
              changedKeys.push('preferredSpeed');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'autoPauseOnHide')) {
              state.autoPauseOnHide = !!changes.autoPauseOnHide.newValue;
              changedKeys.push('autoPauseOnHide');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'keyChat')) {
              state.keyChat = readShortcutKey(changes.keyChat.newValue, 'c');
              changedKeys.push('keyChat');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'keyTimeline')) {
              state.keyTimeline = readShortcutKey(changes.keyTimeline.newValue, 't');
              changedKeys.push('keyTimeline');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'keyNotes')) {
              state.keyNotes = readShortcutKey(changes.keyNotes.newValue, 'n');
              changedKeys.push('keyNotes');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'keyDoubt')) {
              state.keyDoubt = readShortcutKey(changes.keyDoubt.newValue, 'd');
              changedKeys.push('keyDoubt');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'keyFullscreen')) {
              state.keyFullscreen = readShortcutKey(changes.keyFullscreen.newValue, 'f');
              changedKeys.push('keyFullscreen');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'keyExit')) {
              state.keyExit = readShortcutKey(changes.keyExit.newValue, 'e');
              changedKeys.push('keyExit');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'allowShortcutsWhenHidden')) {
              state.allowShortcutsWhenHidden = !!changes.allowShortcutsWhenHidden.newValue;
              changedKeys.push('allowShortcutsWhenHidden');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'autoHideControls')) {
              state.autoHideControls = !!changes.autoHideControls.newValue;
              changedKeys.push('autoHideControls');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'autoHideDelay')) {
              state.autoHideDelay = parseFloat(String(changes.autoHideDelay.newValue)) || 0.8;
              changedKeys.push('autoHideDelay');
            }
            if (Object.prototype.hasOwnProperty.call(changes, 'autoHideWhenPaused')) {
              state.autoHideWhenPaused = !!changes.autoHideWhenPaused.newValue;
              changedKeys.push('autoHideWhenPaused');
            }

            if (changedKeys.length > 0) {
              notifyListeners(changedKeys);
            }
          }
        } catch (_e) {
          // Ignored: extension context invalidated
        }
      });
    } catch (_err) {
      // Ignored: chrome runtime unavailable
    }
  }
}
