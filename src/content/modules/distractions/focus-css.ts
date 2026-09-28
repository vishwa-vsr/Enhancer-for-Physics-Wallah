import { HideSettings } from '../../types';
import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import {
  findSettingsButton,
  setHidden,
  findNativeSpeedBadges,
  findTimeTexts,
  hideTimeSeparators,
  isProtectedPlayerStructure,
  resolvePlayerToolbarSlots,
  syncTimelineVisibility,
} from './elements';

function shouldHideDistraction(key: keyof HideSettings, currentSettings: HideSettings): boolean {
  return state.extensionEnabled && currentSettings[key] === true;
}

// Toggle mapping keys to documentElement class names
export const classMap: Record<keyof HideSettings, string> = {
  hideAskAI: 'pwc-hide-askai',
  hideDoubt: 'pwc-hide-doubt',
  hideChat: 'pwc-hide-chat',
  hideNotes: 'pwc-hide-notes',
  hideNoteTimeline: 'pwc-hide-notetimeline',
  hideSpeed: 'pwc-hide-speed',
  hideQuality: 'pwc-hide-quality',
  hideSkipSilence: 'pwc-hide-skipsilence',
  hideSetting: 'pwc-hide-setting',
  hideTimeLine: 'pwc-hide-timeline',
  hideTimeText: 'pwc-hide-timetext',
};

// Apply layout class tags to documentElement for zero-flicker hiding
export function applySettingsHTML(settings?: HideSettings): void {
  const root = document.documentElement;
  const currentSettings = settings || state.hideSettings;

  (Object.keys(classMap) as (keyof HideSettings)[]).forEach((key) => {
    const className = classMap[key];
    const shouldHide = shouldHideDistraction(key, currentSettings);
    if (shouldHide) {
      root.classList.add(className);
    } else {
      root.classList.remove(className);
    }
  });

  if (state.extensionEnabled && state.allowShortcutsWhenHidden) {
    root.classList.add('pwc-allow-hidden-shortcuts');
  } else {
    root.classList.remove('pwc-allow-hidden-shortcuts');
  }
}

// Hide or restore distracting elements depending on settings using the unified toolbar slot map.
export function applyDistractorsState(): void {
  const activeSettings: Record<string, boolean> = {};
  const hideKeys = Object.keys(classMap) as (keyof HideSettings)[];
  for (const key of hideKeys) {
    activeSettings[key] = shouldHideDistraction(key, state.hideSettings);
  }

  const video = getActiveVideo();
  if (video) {
    const settingsBtn = findSettingsButton();
    if (settingsBtn && !isProtectedPlayerStructure(settingsBtn)) {
      setHidden(settingsBtn, activeSettings.hideSetting);
    }

    const slots = resolvePlayerToolbarSlots();
    slots.notes.forEach((btn) => setHidden(btn, activeSettings.hideNotes));
    slots.notetimeline.forEach((btn) => setHidden(btn, activeSettings.hideNoteTimeline));
    slots.doubt.forEach((btn) => setHidden(btn, activeSettings.hideDoubt));
    slots.chat.forEach((btn) => setHidden(btn, activeSettings.hideChat));
    slots.askai.forEach((btn) => setHidden(btn, activeSettings.hideAskAI));
  }

  // Handle native Speed Badges next to the timer (dynamic — CSS can't target)
  const container = document.getElementById('pwc-speed-control');
  const nativeBadges = findNativeSpeedBadges();

  if (!state.extensionEnabled) {
    if (container) {
      setHidden(container, true);
    }
    for (const el of nativeBadges) {
      setHidden(el, false);
    }
  } else {
    if (activeSettings.hideSpeed) {
      if (container) {
        setHidden(container, true);
      }
      for (const el of nativeBadges) {
        setHidden(el, true);
      }
    } else {
      if (container) {
        setHidden(container, false);
      }
      for (const el of nativeBadges) {
        setHidden(el, false);
      }
    }
  }

  // Handle quality widget hiding
  const qualityContainer = document.getElementById('pwc-quality-control');
  if (qualityContainer) {
    setHidden(
      qualityContainer,
      !state.extensionEnabled || !state.constantVideoQuality || activeSettings.hideQuality,
    );
  }

  // Handle Skip Silence icon hiding
  const ssContainer = document.getElementById('pwc-ss-container');
  if (ssContainer) {
    setHidden(ssContainer, !state.extensionEnabled || activeSettings.hideSkipSilence);
  }

  // Handle timeline hiding and prevent duplicate progress bars on AI-chapter lectures
  syncTimelineVisibility(activeSettings.hideTimeLine);

  // Handle time display texts hiding
  const timeTexts = findTimeTexts();
  timeTexts.forEach((el) => {
    setHidden(el, activeSettings.hideTimeText);
    hideTimeSeparators(el, activeSettings.hideTimeText);
  });
}
