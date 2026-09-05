import { state, safeSetSettings } from '../../state';
import { VideoQuality } from '../../types';
import { updateQualityHUD } from '../ui/quality-hud';

let currentQuality: VideoQuality = '720p';
let availableQualities: number[] = [720, 480, 360, 240];
let isListening = false;

export function getCurrentQuality(): VideoQuality {
  return currentQuality;
}

export function getAvailableQualities(): number[] {
  return availableQualities;
}

export function initQualityController(): void {
  if (isListening) return;
  isListening = true;

  // Listen for state broadcasts from engine-bridge running in MAIN world
  window.addEventListener('PWC_QUALITY_STATE', ((e: CustomEvent) => {
    if (e.detail) {
      if (e.detail.currentQuality) {
        currentQuality = e.detail.currentQuality;
      }
      if (Array.isArray(e.detail.availableQualities) && e.detail.availableQualities.length > 0) {
        availableQualities = e.detail.availableQualities;
      }
      updateQualityHUD();
    }
  }) as EventListener);

  // Request current state from bridge
  window.dispatchEvent(new CustomEvent('PWC_REQUEST_QUALITY'));

  // Ensure bridge script is injected if not already running via manifest world: MAIN
  ensureBridgeInjected();
}

// Fallback dynamic injection in case browser doesn't support world: MAIN or blocked
export function ensureBridgeInjected(): void {
  const SCRIPT_ID = 'pwc-engine-bridge-script';
  if (document.getElementById(SCRIPT_ID)) return;

  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = chrome.runtime.getURL('engine-bridge.js');
      (document.head || document.documentElement).appendChild(script);
    }
  } catch (_e) {
    // Suppress if runtime unavailable
  }
}

// Sync constant quality state to localStorage and notify bridge
export function syncConstantQuality(enabled: boolean): void {
  try {
    localStorage.setItem('pwc_constant_quality', enabled ? 'true' : 'false');
  } catch (_e) {}

  window.dispatchEvent(
    new CustomEvent('PWC_SET_CONSTANT_QUALITY_ENABLED', {
      detail: { enabled },
    })
  );

  updateQualityHUD();
}

// Apply quality to player via engine bridge
export function applyQuality(quality: VideoQuality): void {
  if (!state.extensionEnabled || !state.constantVideoQuality) return;
  const target = quality || state.preferredQuality || '720p';
  currentQuality = target;
  updateQualityHUD();

  window.dispatchEvent(
    new CustomEvent('PWC_SET_QUALITY', {
      detail: { quality: target },
    })
  );
}

// Save user preferred quality setting and apply it immediately
export function saveQuality(quality: VideoQuality): void {
  state.preferredQuality = quality;
  safeSetSettings({ preferredQuality: quality });
  if (state.constantVideoQuality) {
    applyQuality(quality);
  }
}

// Automatically apply user preferred quality when video starts / loads
export function autoApplyPreferredQuality(): void {
  if (!state.extensionEnabled || !state.constantVideoQuality) return;
  const target = state.preferredQuality || '720p';
  applyQuality(target);
}
