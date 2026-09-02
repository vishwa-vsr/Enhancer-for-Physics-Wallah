import { HideSettings } from '../../types';
import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import {
  findSettingsButton,
  findFullscreenButton,
  getToolbarContainer,
  setHidden,
  checkElementOrChildType,
  findNativeSpeedBadges,
  findTimeline,
  findTimeTexts,
  hideTimeSeparators,
} from './elements';

// Toggle mapping keys to documentElement class names
export const classMap: Record<keyof HideSettings, string> = {
  hideAskAI: 'pwc-hide-askai',
  hideDoubt: 'pwc-hide-doubt',
  hideChat: 'pwc-hide-chat',
  hideNotes: 'pwc-hide-notes',
  hideNoteTimeline: 'pwc-hide-notetimeline',
  hideSpeed: 'pwc-hide-speed',
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
    const isEnabled = state.extensionEnabled && currentSettings[key] === true;
    if (isEnabled) {
      root.classList.add(className);
    } else {
      root.classList.remove(className);
    }
  });
}

// Hide or restore distracting elements depending on settings.
// We use a unified, robust settings-offset positional mapping to identify toolbar buttons,
// falling back to attribute classification. This is highly reliable across all browsers.
export function applyDistractorsState(): void {
  const activeSettings: Record<string, boolean> = {};
  const hideKeys = Object.keys(classMap) as (keyof HideSettings)[];
  for (const key of hideKeys) {
    activeSettings[key] = state.extensionEnabled && state.hideSettings[key];
  }

  const video = getActiveVideo();
  if (video) {
    const settingsBtn = findSettingsButton();
    if (settingsBtn) {
      setHidden(settingsBtn, activeSettings.hideSetting);
    }
    const fullscreenBtn = findFullscreenButton();
    const refBtn = settingsBtn || fullscreenBtn;

    if (refBtn) {
      const parent = getToolbarContainer(refBtn);
      if (parent) {
        const siblings = Array.from(parent.children);

        // Filter out our own injected speed control and non-element nodes
        const nativeButtons = siblings.filter((el) => {
          return el.nodeType === 1 && el.id !== 'pwc-speed-control';
        });

        // Find settings button index in the native buttons list
        const settingsIdx = nativeButtons.findIndex((el) => {
          return el === settingsBtn || el.id === 'setting-icon' || el.querySelector('#setting-icon');
        });

        if (settingsIdx !== -1) {
          nativeButtons.forEach((btn, index) => {
            const offset = settingsIdx - index;

            if (offset === 1) {
              // Notes (1 button left of Settings)
              setHidden(btn, activeSettings.hideNotes);
            } else if (offset === 2) {
              // Note Timeline (2 buttons left of Settings)
              setHidden(btn, activeSettings.hideNoteTimeline);
            } else if (offset === 3) {
              // Doubt Q&A (3 buttons left of Settings)
              setHidden(btn, activeSettings.hideDoubt);
            } else if (offset === 4) {
              // Live Chat (4 buttons left of Settings)
              setHidden(btn, activeSettings.hideChat);
            } else {
              // Fallback for other buttons (like Ask AI if inside toolbar)
              const type = checkElementOrChildType(btn);
              if (type === 'askai') {
                setHidden(btn, activeSettings.hideAskAI);
              } else if (type === 'chat') {
                setHidden(btn, activeSettings.hideChat);
              } else if (type === 'doubt') {
                setHidden(btn, activeSettings.hideDoubt);
              } else if (type === 'notes') {
                setHidden(btn, activeSettings.hideNotes);
              } else if (type === 'notetimeline') {
                setHidden(btn, activeSettings.hideNoteTimeline);
              }
            }
          });
        } else {
          // Fallback if settings button is not found
          nativeButtons.forEach((btn) => {
            const type = checkElementOrChildType(btn);
            if (type === 'chat') {
              setHidden(btn, activeSettings.hideChat);
            } else if (type === 'doubt') {
              setHidden(btn, activeSettings.hideDoubt);
            } else if (type === 'notes') {
              setHidden(btn, activeSettings.hideNotes);
            } else if (type === 'notetimeline') {
              setHidden(btn, activeSettings.hideNoteTimeline);
            } else if (type === 'askai') {
              setHidden(btn, activeSettings.hideAskAI);
            }
          });
        }
      }
    }
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

  // Handle timeline hiding
  const timeline = findTimeline();
  if (timeline) {
    setHidden(timeline, activeSettings.hideTimeLine);
  }

  // Handle time display texts hiding
  const timeTexts = findTimeTexts();
  timeTexts.forEach((el) => {
    setHidden(el, activeSettings.hideTimeText);
    hideTimeSeparators(el, activeSettings.hideTimeText);
  });
}
