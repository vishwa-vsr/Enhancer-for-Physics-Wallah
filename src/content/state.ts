import {
  CONTENT_STORAGE_KEYS,
  DEFAULT_HIDE_SETTINGS,
  DEFAULT_SETTINGS,
  HIDE_SETTING_KEYS,
} from '../shared/types';
import { ContentState, HideSettings, StateChangeListener, ThemeMode, VideoQuality } from './types';
import { resolveSafeSpeedShortcuts, sanitizeSpeedShortcut } from '../shared/shortcuts';
import { clamp, sanitizeSnapPoints } from '../shared/utils';

export { DEFAULT_HIDE_SETTINGS, sanitizeSnapPoints };

const HIDE_KEY_SET = new Set<string>(HIDE_SETTING_KEYS);

function buildDefaultContentState(): ContentState {
  const base: Record<string, unknown> = {};
  for (const key of CONTENT_STORAGE_KEYS) {
    if (key === 'preferredSpeed' || HIDE_KEY_SET.has(key)) continue;
    const val = DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS];
    base[key] = Array.isArray(val) ? [...val] : val;
  }
  return {
    ...(base as Omit<ContentState, 'currentSpeed' | 'hideSettings'>),
    currentSpeed: DEFAULT_SETTINGS.preferredSpeed,
    hideSettings: { ...DEFAULT_HIDE_SETTINGS },
  };
}

export const DEFAULT_CONTENT_STATE: ContentState = buildDefaultContentState();

export const state: ContentState = buildDefaultContentState();

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

function hasChromeStorage(): boolean {
  return (
    typeof chrome !== 'undefined' &&
    !!chrome.runtime &&
    !!chrome.runtime.id &&
    !!chrome.storage &&
    !!chrome.storage.local
  );
}

// Helper to safely access chrome storage without throwing context invalidated exceptions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeGetSettings(callback: (result: Record<string, any>) => void): void {
  if (!hasChromeStorage()) return;
  try {
    chrome.storage.local.get(CONTENT_STORAGE_KEYS, function (result) {
      try {
        if (chrome.runtime && chrome.runtime.id) {
          callback(result);
        }
      } catch (_e) {
        // Ignored: extension context invalidated
      }
    });
  } catch (_err) {
    // Ignored: chrome runtime unavailable
  }
}

// Helper to safely write chrome storage without throwing context invalidated exceptions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeSetSettings(data: Record<string, any>): void {
  if (!hasChromeStorage()) return;
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

const DEFAULT_SPEED_SHORTCUTS: Record<'keySpeedUp' | 'keySlowDown' | 'keyReset', string> = {
  keySpeedUp: 'h',
  keySlowDown: 'j',
  keyReset: 'l',
};

function parseFloatWithFallback(raw: unknown, fallback: number, allowZero = false): number {
  if (raw === undefined) return fallback;
  const n = parseFloat(String(raw));
  if (isNaN(n)) return fallback;
  return !allowZero && n === 0 ? fallback : n;
}

// Declarative normalizers for non-boolean content state keys (shared by initState and onChanged)
const CUSTOM_KEY_APPLIERS: Record<string, (raw: unknown) => void> = {
  preferredSpeed: (raw) => {
    state.currentSpeed = parseFloat(String(raw)) || 1.0;
  },
  preferredQuality: (raw) => {
    state.preferredQuality = (raw as VideoQuality) || '720p';
  },
  snapPoints: (raw) => {
    state.snapPoints = sanitizeSnapPoints(raw);
  },
  volumeScrollMouseStep: (raw) => {
    state.volumeScrollMouseStep =
      raw !== undefined ? clamp(Math.round(Number(raw) || 5), 1, 30) : 5;
  },
  volumeScrollTrackpadStep: (raw) => {
    state.volumeScrollTrackpadStep =
      raw !== undefined ? clamp(Math.round(Number(raw) || 2), 1, 10) : 2;
  },
  volumeBubbleDelay: (raw) => {
    state.volumeBubbleDelay = parseFloatWithFallback(raw, 0.4, true);
  },
  holdSpaceSpeed: (raw) => {
    state.holdSpaceSpeed = parseFloatWithFallback(raw, 2.0, true);
  },
  autoHideDelay: (raw) => {
    state.autoHideDelay = parseFloatWithFallback(raw, 0.8);
  },
  finishTimeFormat: (raw) => {
    state.finishTimeFormat = raw === 'full' ? 'full' : 'clock';
  },
  skipSilenceSilenceSpeed: (raw) => {
    state.skipSilenceSilenceSpeed = parseFloatWithFallback(raw, 6.0);
  },
  skipSilenceThreshold: (raw) => {
    const n = raw !== undefined ? parseInt(String(raw), 10) : NaN;
    state.skipSilenceThreshold = isNaN(n) || n === 0 ? -40 : n;
  },
  skipSilenceTimeSaved: (raw) => {
    state.skipSilenceTimeSaved = Number(raw) || 0;
  },
  skipSilenceMinDuration: (raw) => {
    state.skipSilenceMinDuration = parseFloatWithFallback(raw, 0.5);
  },
  themeMode: (raw) => {
    state.themeMode = (raw as ThemeMode) || 'dark';
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.toggle('pwc-light-theme', state.themeMode === 'light');
    }
  },
};

function applySingleSetting(key: string, raw: unknown): boolean {
  if (HIDE_KEY_SET.has(key)) {
    state.hideSettings[key as keyof HideSettings] = !!raw;
    return true;
  }

  const custom = CUSTOM_KEY_APPLIERS[key];
  if (custom) {
    custom(raw);
    return true;
  }

  if (key in DEFAULT_SPEED_SHORTCUTS) {
    const k = key as keyof typeof DEFAULT_SPEED_SHORTCUTS;
    state[k] = sanitizeSpeedShortcut(raw, DEFAULT_SPEED_SHORTCUTS[k]);
    return true;
  }

  if (key in DEFAULT_CONTENT_STATE) {
    const defVal = DEFAULT_CONTENT_STATE[key as keyof ContentState];
    if (typeof defVal === 'boolean') {
      (state as unknown as Record<string, unknown>)[key] = defVal ? raw !== false : !!raw;
      return true;
    }
    if (typeof defVal === 'string') {
      (state as unknown as Record<string, unknown>)[key] = raw !== undefined ? String(raw) : defVal;
      return true;
    }
  }

  return false;
}

let isInitialized = false;

// Initialize state from storage and listen to onChanged
export function initState(onLoaded?: () => void): void {
  if (isInitialized) return;
  isInitialized = true;

  safeGetSettings(function (result) {
    for (const key of CONTENT_STORAGE_KEYS) {
      if (key in DEFAULT_SPEED_SHORTCUTS) continue;
      if (HIDE_KEY_SET.has(key)) {
        if (Object.prototype.hasOwnProperty.call(result, key)) {
          state.hideSettings[key as keyof HideSettings] = !!result[key];
        }
        continue;
      }
      if (key === 'preferredSpeed') {
        if (result.preferredSpeed) {
          state.currentSpeed = parseFloat(result.preferredSpeed);
        }
        continue;
      }
      if (key === 'snapPoints') {
        if (
          result.snapPoints &&
          Array.isArray(result.snapPoints) &&
          result.snapPoints.length === 4
        ) {
          state.snapPoints = sanitizeSnapPoints(result.snapPoints);
        }
        continue;
      }
      applySingleSetting(key, result[key]);
    }

    const resolvedSpeedKeys = resolveSafeSpeedShortcuts(result, [
      state.keyChat,
      state.keyTimeline,
      state.keyNotes,
      state.keyDoubt,
      state.keyFullscreen,
      state.keyExit,
    ]);
    const shortcutFixes: Record<string, string> = {};
    for (const k of ['keySpeedUp', 'keySlowDown', 'keyReset'] as const) {
      state[k] = resolvedSpeedKeys[k];
      if (result[k] !== undefined && result[k] !== state[k]) {
        shortcutFixes[k] = state[k];
      }
    }
    if (Object.keys(shortcutFixes).length > 0) {
      safeSetSettings(shortcutFixes);
    }

    // Always ensure initial theme class matches stored/default themeMode
    CUSTOM_KEY_APPLIERS.themeMode(state.themeMode);

    if (onLoaded) {
      onLoaded();
    }
    notifyListeners(['*']);
  });

  // Listen for storage changes from the settings popup
  if (hasChromeStorage() && chrome.storage.onChanged) {
    try {
      chrome.storage.onChanged.addListener(function (changes, area) {
        try {
          if (!chrome.runtime || !chrome.runtime.id) return;
          if (area !== 'local') return;

          const changedKeys: string[] = [];
          for (const key of Object.keys(changes)) {
            if (applySingleSetting(key, changes[key].newValue)) {
              changedKeys.push(key);
            }
          }
          if (changedKeys.length > 0) {
            notifyListeners(changedKeys);
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
