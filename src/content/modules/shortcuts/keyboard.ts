import { state } from '../../state';
import { stepSpeed, saveSpeed } from '../video/controller';
import { getSSCurrentState } from '../audio/skip-silence';
import {
  findNotesButton,
  findTimelineButton,
  findDoubtButton,
  findChatButton,
  findFullscreenButton,
} from '../distractions/elements';
import { getActiveVideo } from '../video/detector';

// Helper to check if user is typing in a text entry field
export function isUserTyping(): boolean {
  const active = document.activeElement;
  if (!active) return false;
  const tagName = active.tagName.toLowerCase();
  if (
    tagName === 'textarea' ||
    (active as HTMLElement).isContentEditable ||
    active.getAttribute('role') === 'textbox'
  ) {
    return true;
  }
  if (tagName === 'input') {
    const type = ((active as HTMLInputElement).type || 'text').toLowerCase();
    const textTypes = ['text', 'search', 'email', 'number', 'password', 'tel', 'url'];
    return textTypes.includes(type);
  }
  return false;
}

// Helper function to match keys case-insensitively, supporting spacebar and shifts
export function matchKey(event: KeyboardEvent, targetKey: string): boolean {
  if (!targetKey) return false;

  if (targetKey === '>') {
    return event.key === '>' || (event.shiftKey && event.key === '.');
  }
  if (targetKey === '<') {
    return event.key === '<' || (event.shiftKey && event.key === ',');
  }
  if (targetKey === 'Space') {
    return event.key === ' ' || event.key === 'Space';
  }

  return event.key.toLowerCase() === targetKey.toLowerCase();
}

function clickElement(el: Element | null): boolean {
  if (!el) return false;
  let clicked = false;
  if (el instanceof HTMLElement || el instanceof SVGElement) {
    try {
      (el as any).click();
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      clicked = true;
    } catch (_) {}
  }
  const parent = el.parentElement;
  if (parent instanceof HTMLElement) {
    try {
      parent.click();
      parent.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      clicked = true;
    } catch (_) {}
  }
  return clicked;
}

function toggleFullscreen(): void {
  const fsBtn = findFullscreenButton();
  if (fsBtn && clickElement(fsBtn)) {
    return;
  }

  // Fallback to HTML5 fullscreen API
  if (document.fullscreenElement) {
    if (document.exitFullscreen) document.exitFullscreen();
  } else {
    const video = getActiveVideo();
    const container =
      document.getElementById('video-player-container') ||
      (video && video.closest('.video-player-app')) ||
      (video && video.parentElement) ||
      video;
    if (container && container.requestFullscreen) {
      container.requestFullscreen();
    }
  }
}

function executeQuickExit(): void {
  // 1. Exit HTML5 fullscreen if currently active
  if (document.fullscreenElement && document.exitFullscreen) {
    try {
      document.exitFullscreen();
    } catch (_) {}
  }

  // 2. Dispatch event to engine-bridge in the MAIN world to silence beforeunload and handle exit navigation
  try {
    window.dispatchEvent(new CustomEvent('PWC_QUICK_EXIT'));
  } catch (_) {}
}

let isInitialized = false;

// Listen to keyboard shortcuts (bubble phase)
export function initKeyboardShortcuts(): void {
  if (isInitialized) return;
  isInitialized = true;

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!state.extensionEnabled) return;

    // Safety check: Ignore if typing in text fields
    if (isUserTyping()) return;

    // 1. Video Speed Hotkeys (controlled by state.enableHotkeys master switch)
    if (state.enableHotkeys && !(state.skipSilenceEnabled && getSSCurrentState() === 'silence')) {
      if (matchKey(e, state.keySpeedUp)) {
        e.preventDefault();
        saveSpeed(stepSpeed(1));
        return;
      } else if (matchKey(e, state.keySlowDown)) {
        e.preventDefault();
        saveSpeed(stepSpeed(-1));
        return;
      } else if (matchKey(e, state.keyReset)) {
        e.preventDefault();
        saveSpeed(1.0);
        return;
      }
    }

    // 2. Focus & Player Shortcuts (Issue #14)
    // Rule: If an item is HIDDEN by focus mode, its shortcut is BLOCKED.

    // Fullscreen (F)
    if (state.keyFullscreen && matchKey(e, state.keyFullscreen)) {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

    // Quick Exit (E)
    if (state.keyExit && matchKey(e, state.keyExit)) {
      e.preventDefault();
      executeQuickExit();
      return;
    }

    // Live Chat (C)
    if (state.keyChat && matchKey(e, state.keyChat)) {
      if (!state.hideSettings.hideChat) {
        e.preventDefault();
        clickElement(findChatButton());
      }
      return;
    }

    // Note Timeline (T)
    if (state.keyTimeline && matchKey(e, state.keyTimeline)) {
      if (!state.hideSettings.hideNoteTimeline) {
        e.preventDefault();
        clickElement(findTimelineButton());
      }
      return;
    }

    // Study Notes (N / A)
    if (state.keyNotes && matchKey(e, state.keyNotes)) {
      if (!state.hideSettings.hideNotes) {
        e.preventDefault();
        clickElement(findNotesButton());
      }
      return;
    }

    // Doubt Q&A (D)
    if (state.keyDoubt && matchKey(e, state.keyDoubt)) {
      if (!state.hideSettings.hideDoubt) {
        e.preventDefault();
        clickElement(findDoubtButton());
      }
      return;
    }
  });
}

