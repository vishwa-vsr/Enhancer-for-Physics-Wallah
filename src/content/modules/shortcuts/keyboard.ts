import { state } from '../../state';
import { stepSpeed, saveSpeed } from '../video/controller';
import { getSSCurrentState } from '../audio/skip-silence';
import { isPointerHolding, isUserHoldingSpace } from './space-hold';
import { getOuterPlayerContainer, triggerPlayerSlot } from '../distractions/elements';
import { applyDistractorsState } from '../distractions/focus-css';
import { getActiveVideo } from '../video/detector';
import { isReservedPlayerKey } from '../../../shared/shortcuts';
import { isFocusLockActive, handleFocusLockExitShortcut } from '../ui/focus-lock';
import { showShortcutBanner } from '../ui/player-banner';

function isEditableElement(el: EventTarget | null): boolean {
  if (!(el instanceof Element)) return false;
  const tagName = el.tagName.toLowerCase();
  if (
    tagName === 'textarea' ||
    (el as HTMLElement).isContentEditable ||
    el.getAttribute('role') === 'textbox' ||
    Boolean(el.closest('[role="textbox"]'))
  ) {
    return true;
  }
  if (tagName === 'input') {
    const type = ((el as HTMLInputElement).type || 'text').toLowerCase();
    const textTypes = ['text', 'search', 'email', 'number', 'password', 'tel', 'url'];
    return textTypes.includes(type);
  }
  return false;
}

// Helper to check if user is typing in a text entry field
export function isUserTyping(target?: EventTarget | null): boolean {
  if (isEditableElement(target ?? null)) return true;

  let active: Element | null = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return isEditableElement(active);
}

function formatSpeed(speed: number): string {
  return speed.toFixed(2).replace(/0$/, '');
}

function consumeHandledShortcut(e: KeyboardEvent): void {
  e.preventDefault();
  e.stopImmediatePropagation();
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
let pendingFullscreenTrigger = false;
let pendingFullscreenTimeout: ReturnType<typeof setTimeout> | null = null;

function setPendingFullscreenShortcut(): void {
  pendingFullscreenTrigger = true;
  if (pendingFullscreenTimeout) {
    clearTimeout(pendingFullscreenTimeout);
  }
  pendingFullscreenTimeout = window.setTimeout(() => {
    pendingFullscreenTrigger = false;
    pendingFullscreenTimeout = null;
  }, 1500);
}

// Listen to keyboard shortcuts (capture phase to take priority over PW's capture-phase keydown handler)
export function initKeyboardShortcuts(): void {
  if (isInitialized) return;
  isInitialized = true;

  document.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (!state.extensionEnabled || e.isComposing) return;

      // Safety check: Ignore if typing in text fields
      if (isUserTyping(e.target)) return;

      // Track Escape key when pressed inside fullscreen
      if (
        e.key === 'Escape' &&
        document.fullscreenElement &&
        state.enableFocusShortcuts &&
        state.enableKeyFullscreen
      ) {
        setPendingFullscreenShortcut();
      }

      // 1. Video Speed Hotkeys (controlled by state.enableHotkeys master switch)
      if (
        state.enableHotkeys &&
        !isPointerHolding() &&
        !isUserHoldingSpace() &&
        !(state.skipSilenceEnabled && state.skipSilenceActive && getSSCurrentState() === 'silence')
      ) {
        if (matchKey(e, state.keySpeedUp)) {
          consumeHandledShortcut(e);
          const next = stepSpeed(1);
          saveSpeed(next);
          showShortcutBanner(`${formatSpeed(next)}x`);
          return;
        } else if (matchKey(e, state.keySlowDown)) {
          consumeHandledShortcut(e);
          const next = stepSpeed(-1);
          saveSpeed(next);
          showShortcutBanner(`${formatSpeed(next)}x`);
          return;
        } else if (matchKey(e, state.keyReset)) {
          consumeHandledShortcut(e);
          saveSpeed(1.0);
          showShortcutBanner('1.0x Normal');
          return;
        }
      }

      // 2. Focus & Player Shortcuts (Issue #14)
      // Rule: If focus shortcuts are disabled globally, ignore all focus keys
      if (!state.enableFocusShortcuts) return;

      // Rule: If an item is HIDDEN by focus mode, its action is blocked unless allowShortcutsWhenHidden is enabled.

      // Fullscreen (F)
      if (state.enableKeyFullscreen && state.keyFullscreen && matchKey(e, state.keyFullscreen)) {
        consumeHandledShortcut(e);
        setPendingFullscreenShortcut();
        toggleFullscreen();
        return;
      }

      // Quick Exit (E)
      if (state.enableKeyExit && state.keyExit && matchKey(e, state.keyExit)) {
        consumeHandledShortcut(e);
        pendingFullscreenTrigger = false;
        if (pendingFullscreenTimeout) {
          clearTimeout(pendingFullscreenTimeout);
          pendingFullscreenTimeout = null;
        }
        showShortcutBanner('Quick Exit');
        if (isFocusLockActive()) {
          handleFocusLockExitShortcut(executeQuickExit);
        } else {
          executeQuickExit();
        }
        return;
      }

      const triggerPanel = (slot: 'chat' | 'notetimeline' | 'notes' | 'doubt'): boolean => {
        if (document.documentElement.classList.contains('pwc-collapsed-state')) {
          document.documentElement.classList.remove('pwc-collapsed-state');
        }
        const clicked = triggerPlayerSlot(slot);
        window.requestAnimationFrame(() => {
          applyDistractorsState();
        });
        return clicked;
      };

      // Live Chat (C)
      if (
        state.enableKeyChat &&
        state.keyChat &&
        matchKey(e, state.keyChat) &&
        (!state.hideSettings.hideChat || state.allowShortcutsWhenHidden)
      ) {
        consumeHandledShortcut(e);
        if (triggerPanel('chat')) {
          showShortcutBanner('Live Chat');
        }
        return;
      }

      // Note Timeline (T)
      if (
        state.enableKeyTimeline &&
        state.keyTimeline &&
        matchKey(e, state.keyTimeline) &&
        (!state.hideSettings.hideNoteTimeline || state.allowShortcutsWhenHidden)
      ) {
        consumeHandledShortcut(e);
        if (triggerPanel('notetimeline')) {
          showShortcutBanner('Note Timeline');
        }
        return;
      }

      // Study Notes (N / A)
      if (
        state.enableKeyNotes &&
        state.keyNotes &&
        matchKey(e, state.keyNotes) &&
        (!state.hideSettings.hideNotes || state.allowShortcutsWhenHidden)
      ) {
        consumeHandledShortcut(e);
        if (triggerPanel('notes')) {
          showShortcutBanner('Study Notes');
        }
        return;
      }

      // Doubt Q&A (D)
      if (
        state.enableKeyDoubt &&
        state.keyDoubt &&
        matchKey(e, state.keyDoubt) &&
        (!state.hideSettings.hideDoubt || state.allowShortcutsWhenHidden)
      ) {
        consumeHandledShortcut(e);
        if (triggerPanel('doubt')) {
          showShortcutBanner('Doubt Q&A');
        }
        return;
      }
    },
    true,
  );

  // Sync fullscreen shortcut feedback with the browser's fullscreen transition
  document.addEventListener('fullscreenchange', () => {
    if (pendingFullscreenTrigger) {
      pendingFullscreenTrigger = false;
      if (pendingFullscreenTimeout) {
        clearTimeout(pendingFullscreenTimeout);
        pendingFullscreenTimeout = null;
      }
      const isNowFullscreen = !!document.fullscreenElement;
      window.requestAnimationFrame(() => {
        showShortcutBanner(isNowFullscreen ? 'Fullscreen' : 'Exit Fullscreen');
      });
    }
  });
}
