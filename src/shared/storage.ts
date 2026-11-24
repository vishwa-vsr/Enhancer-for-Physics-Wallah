import { PopupSettings, DEFAULT_SETTINGS } from './types';

const isChromeStorageAvailable =
  typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

let memoryStorage: Partial<PopupSettings> = {};
const memoryListeners: Array<(changes: Partial<PopupSettings>) => void> = [];

export const EXCLUDED_BACKUP_KEYS = new Set([
  'installDate',
  'reviewPromptStatus',
  'reviewPromptNextShowTime',
  'hasSeenRefreshPrompt',
]);

export interface ExportedSettingsPayload {
  app: string;
  version: string;
  exportedAt: string;
  settings: Partial<PopupSettings>;
}

export function loadSettings(): Promise<PopupSettings> {
  return new Promise((resolve) => {
    if (isChromeStorageAvailable) {
      chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS), (result) => {
        resolve({ ...DEFAULT_SETTINGS, ...result } as PopupSettings);
      });
    } else {
      resolve({ ...DEFAULT_SETTINGS, ...memoryStorage } as PopupSettings);
    }
  });
}

export function saveSetting<K extends keyof PopupSettings>(key: K, value: PopupSettings[K]): void {
  if (isChromeStorageAvailable) {
    chrome.storage.local.set({ [key]: value });
  } else {
    memoryStorage[key] = value;
    notifyMemoryListeners({ [key]: value });
  }
}

export function saveSettings(partial: Partial<PopupSettings>): void {
  if (isChromeStorageAvailable) {
    chrome.storage.local.set(partial);
  } else {
    memoryStorage = { ...memoryStorage, ...partial };
    notifyMemoryListeners(partial);
  }
}

function notifyMemoryListeners(changes: Partial<PopupSettings>): void {
  for (const listener of memoryListeners) {
    try {
      listener(changes);
    } catch {
      // Ignore listener error
    }
  }
}

export function onSettingsChanged(callback: (changes: Partial<PopupSettings>) => void): void {
  memoryListeners.push(callback);
  if (isChromeStorageAvailable) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        const parsedChanges: Partial<PopupSettings> = {};
        for (const [key, { newValue }] of Object.entries(changes)) {
          (parsedChanges as Record<string, unknown>)[key] = newValue;
        }
        callback(parsedChanges);
      }
    });
  }
}

/**
 * Creates a clean export payload of all extension settings.
 * Excludes local runtime metadata like install dates and review prompts.
 */
export async function exportSettings(): Promise<ExportedSettingsPayload> {
  const current = await loadSettings();
  const filtered: Partial<PopupSettings> = {};

  for (const [key, val] of Object.entries(current)) {
    if (!EXCLUDED_BACKUP_KEYS.has(key) && key in DEFAULT_SETTINGS) {
      (filtered as Record<string, unknown>)[key] = val;
    }
  }

  return {
    app: 'Enhancer for Physics Wallah',
    version: '1.1.0.13',
    exportedAt: new Date().toISOString(),
    settings: filtered,
  };
}

/**
 * Validates a raw backup text string.
 * Supports both wrapped envelopes ({ app: '...', settings: { ... } }) and flat objects.
 */
export function validateSettingsString(input: string): {
  valid: boolean;
  settings?: Partial<PopupSettings>;
  error?: string;
  count?: number;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter or paste your settings code.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return {
      valid: false,
      error: 'The provided code is not valid JSON. Please check that you copied the complete code.',
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { valid: false, error: 'The backup data must be a settings object.' };
  }

  const candidate =
    (parsed as Record<string, unknown>).settings &&
    typeof (parsed as Record<string, unknown>).settings === 'object' &&
    !Array.isArray((parsed as Record<string, unknown>).settings)
      ? ((parsed as Record<string, unknown>).settings as Record<string, unknown>)
      : (parsed as Record<string, unknown>);

  const sanitized: Partial<PopupSettings> = {};
  let count = 0;

  for (const [key, val] of Object.entries(candidate)) {
    if (key in DEFAULT_SETTINGS && !EXCLUDED_BACKUP_KEYS.has(key)) {
      (sanitized as Record<string, unknown>)[key] = val;
      count++;
    }
  }

  if (count === 0) {
    return {
      valid: false,
      error: 'No recognized extension settings found in this code.',
    };
  }

  return {
    valid: true,
    settings: sanitized,
    count,
  };
}

/**
 * Applies imported settings safely, preserving user install metadata and filling in defaults for any missing keys.
 */
export async function importSettings(sanitizedSettings: Partial<PopupSettings>): Promise<void> {
  const current = await loadSettings();
  const merged: PopupSettings = {
    ...DEFAULT_SETTINGS,
    ...sanitizedSettings,
    installDate: current.installDate,
    reviewPromptStatus: current.reviewPromptStatus,
    reviewPromptNextShowTime: current.reviewPromptNextShowTime,
    hasSeenRefreshPrompt: current.hasSeenRefreshPrompt,
  };

  if (isChromeStorageAvailable) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set(merged, () => resolve());
    });
  } else {
    memoryStorage = { ...merged };
    notifyMemoryListeners(merged);
  }
}

/**
 * Resets all settings back to factory defaults while preserving install date and review state.
 */
export async function resetSettingsToDefault(): Promise<void> {
  const current = await loadSettings();
  const reset: PopupSettings = {
    ...DEFAULT_SETTINGS,
    installDate: current.installDate,
    reviewPromptStatus: current.reviewPromptStatus,
    reviewPromptNextShowTime: current.reviewPromptNextShowTime,
    hasSeenRefreshPrompt: current.hasSeenRefreshPrompt,
  };

  if (isChromeStorageAvailable) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set(reset, () => resolve());
    });
  } else {
    memoryStorage = { ...reset };
    notifyMemoryListeners(reset);
  }
}
