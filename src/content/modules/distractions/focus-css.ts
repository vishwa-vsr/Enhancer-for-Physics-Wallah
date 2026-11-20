import { HideSettings } from '../../types';
import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import {
  findSettingsButton,
  setHidden,
  findNativeSpeedBadges,
  isProtectedPlayerStructure,
  resolvePlayerToolbarSlots,
  syncTimelineVisibility,
  findDoubtButton,
  findChatButton,
  findAskAIButton,
} from './elements';

function shouldHideDistraction(key: keyof HideSettings, currentSettings: HideSettings): boolean {
  return state.extensionEnabled && currentSettings[key] === true;
}

// Toggle mapping keys to documentElement class names
export const classMap: Record<keyof HideSettings, string> = {
  hideAskAI: 'pwc-hide-ask-ai',
  hideDoubt: 'pwc-hide-doubt',
  hideChat: 'pwc-hide-chat',
  hideNotes: 'pwc-hide-notes',
  hideNoteTimeline: 'pwc-hide-notetimeline',
  hideSpeed: 'pwc-hide-speed',
  hideQuality: 'pwc-hide-quality',
  hideSetting: 'pwc-hide-setting',
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

    const applySlotOrFallback = (
      matched: Element[],
      fallbackFinder: () => Element | null,
      slotName: string,
      shouldHide: boolean,
    ) => {
      if (matched.length > 0) {
        matched.forEach((btn) => setHidden(btn, shouldHide));
        return;
      }
      const fallback = fallbackFinder();
      if (fallback && !isProtectedPlayerStructure(fallback)) {
        if (fallback.getAttribute('data-pwc-slot') !== slotName) {
          fallback.setAttribute('data-pwc-slot', slotName);
        }
        setHidden(fallback, shouldHide);
      }
    };

    applySlotOrFallback(slots.doubt, findDoubtButton, 'doubt', activeSettings.hideDoubt);
    applySlotOrFallback(slots.chat, findChatButton, 'chat', activeSettings.hideChat);
    applySlotOrFallback(slots.askai, findAskAIButton, 'askai', activeSettings.hideAskAI);
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
    setHidden(ssContainer, !state.extensionEnabled || !state.skipSilenceEnabled);
  }

  // Ensure fallback progress bar stays deduplicated on AI-chapter lectures
  syncTimelineVisibility();
}
