import { PopupSettings, DEFAULT_SETTINGS } from './types';

const isChromeStorageAvailable = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

let memoryStorage: Partial<PopupSettings> = {};

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
  }
}

export function saveSettings(partial: Partial<PopupSettings>): void {
  if (isChromeStorageAvailable) {
    chrome.storage.local.set(partial);
  } else {
    memoryStorage = { ...memoryStorage, ...partial };
  }
}

export function onSettingsChanged(callback: (changes: Partial<PopupSettings>) => void): void {
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
