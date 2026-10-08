import { state } from '../../state';
import { stepSpeed, saveSpeed } from '../video/controller';
import { getSSCurrentState } from '../audio/skip-silence';
import { isPointerHolding, isUserHoldingSpace } from './space-hold';
import { getOuterPlayerContainer, triggerPlayerSlot } from '../distractions/elements';
import { applyDistractorsState } from '../distractions/focus-css';
import { getActiveVideo } from '../video/detector';
import { isReservedPlayerKey } from '../../../shared/shortcuts';
import { isFocusLockActive, handleFocusLockExitShortcut } from '../ui/focus-lock';

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

// Helper function to match keys case-insensitively, supporting shifts while protecting native player keys
export function matchKey(event: KeyboardEvent, targetKey: string): boolean {
  if (!targetKey) return false;

  // Never hijack standard browser/system combinations (Ctrl+C, Ctrl+F, Ctrl+T, Cmd+C, Alt, etc.)
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return false;
  }

  // Never hijack built-in video player keys (Arrow keys, Spacebar, Enter, Escape, Tab)
  if (isReservedPlayerKey(event.key) || isReservedPlayerKey(targetKey)) {
    return false;
  }

  if (targetKey === '>') {
    return event.key === '>' || (event.shiftKey && event.key === '.');
  }
  if (targetKey === '<') {
    return event.key === '<' || (event.shiftKey && event.key === ',');
  }

  return event.key.toLowerCase() === targetKey.toLowerCase();
}

export function exitFullscreen(): void {
  if (document.fullscreenElement && document.exitFullscreen) {
    try {
      void document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }
}

function applyFallbackFullscreen(wasFullscreen: boolean): void {
  if (!!document.fullscreenElement !== wasFullscreen) {
    return;
  }
  if (wasFullscreen) {
    exitFullscreen();
  } else {
    const container = getOuterPlayerContainer() || getActiveVideo();
    if (container && container.requestFullscreen) {
      try {
        void container.requestFullscreen();
      } catch {
        /* ignore */
      }
    }
  }
}

function toggleFullscreen(): void {
  const wasFullscreen = !!document.fullscreenElement;
  if (triggerPlayerSlot('fullscreen')) {
    window.setTimeout(() => {
      applyFallbackFullscreen(wasFullscreen);
    }, 60);
    return;
  }

  applyFallbackFullscreen(wasFullscreen);
}

function executeQuickExit(): void {
  // 1. Exit HTML5 fullscreen if currently active
  exitFullscreen();

  // 2. Dispatch event to engine-bridge in the MAIN world to silence beforeunload and handle exit navigation
  try {
    window.dispatchEvent(new CustomEvent('PWC_QUICK_EXIT'));
  } catch {
    /* ignore */
  }
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
    if (
      state.enableHotkeys &&
      !isPointerHolding() &&
      !isUserHoldingSpace() &&
      !(state.skipSilenceEnabled && getSSCurrentState() === 'silence')
    ) {
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
    // Rule: If an item is HIDDEN by focus mode, its action is blocked unless allowShortcutsWhenHidden is enabled.

    // Fullscreen (F)
    if (state.keyFullscreen && matchKey(e, state.keyFullscreen)) {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

    // Quick Exit (E)
    if (state.keyExit && matchKey(e, state.keyExit)) {
      e.preventDefault();
      if (isFocusLockActive()) {
        handleFocusLockExitShortcut(executeQuickExit);
      } else {
        executeQuickExit();
      }
      return;
    }

    const triggerPanel = (slot: 'chat' | 'notetimeline' | 'notes' | 'doubt') => {
      if (document.documentElement.classList.contains('pwc-collapsed-state')) {
        document.documentElement.classList.remove('pwc-collapsed-state');
      }
      triggerPlayerSlot(slot);
      window.requestAnimationFrame(() => {
        applyDistractorsState();
      });
    };

    // Live Chat (C)
    if (state.keyChat && matchKey(e, state.keyChat)) {
      e.preventDefault();
      if (!state.hideSettings.hideChat || state.allowShortcutsWhenHidden) {
        triggerPanel('chat');
      }
      return;
    }

    // Note Timeline (T)
    if (state.keyTimeline && matchKey(e, state.keyTimeline)) {
      e.preventDefault();
      if (!state.hideSettings.hideNoteTimeline || state.allowShortcutsWhenHidden) {
        triggerPanel('notetimeline');
      }
      return;
    }

    // Study Notes (N / A)
    if (state.keyNotes && matchKey(e, state.keyNotes)) {
      e.preventDefault();
      if (!state.hideSettings.hideNotes || state.allowShortcutsWhenHidden) {
        triggerPanel('notes');
      }
      return;
    }

    // Doubt Q&A (D)
    if (state.keyDoubt && matchKey(e, state.keyDoubt)) {
      e.preventDefault();
      if (!state.hideSettings.hideDoubt || state.allowShortcutsWhenHidden) {
        triggerPanel('doubt');
      }
      return;
    }
  });
}
