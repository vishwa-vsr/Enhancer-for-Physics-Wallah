import { state } from '../../state';
import { stepSpeed, saveSpeed } from '../video/controller';
import { getSSCurrentState } from '../audio/skip-silence';
import { isPointerHolding, isUserHoldingSpace } from './space-hold';
import {
  findNotesButton,
  findTimelineButton,
  findDoubtButton,
  findChatButton,
  findFullscreenButton,
  getOuterPlayerContainer,
} from '../distractions/elements';
import { applyDistractorsState } from '../distractions/focus-css';
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

  // Never hijack standard browser/system combinations (Ctrl+C, Ctrl+F, Ctrl+T, Cmd+C, Alt, etc.)
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return false;
  }

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

// Wake PW's interactive overlay DOM if the user presses a shortcut before ever hovering/clicking the player
function wakePlayerControlsDom(): void {
  if (document.getElementById('footer-right-section')) return;
  const targets = [
    getOuterPlayerContainer(),
    document.getElementById('interactive-layer-wrapper'),
    getActiveVideo(),
  ];
  for (const t of targets) {
    if (!t) continue;
    try {
      t.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true, view: window }));
      t.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }));
      t.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, view: window }));
    } catch {
      /* ignore */
    }
  }
}

function clickElement(el: Element | null): boolean {
  if (!el) return false;

  const root = document.documentElement;
  const hadHideNotesClass = root.classList.contains('pwc-hide-notes');

  const restoreList: Array<{ node: HTMLElement | SVGElement; val: string; priority: string }> = [];
  let curr: Element | null = el;
  while (
    curr &&
    curr !== document.body &&
    curr.id !== 'footer-right-section' &&
    curr.id !== 'interactive-layer-wrapper' &&
    curr.id !== 'video-player-container'
  ) {
    if (curr instanceof HTMLElement || curr instanceof SVGElement) {
      const inlineDisplay = curr.style.getPropertyValue('display');
      if (inlineDisplay === 'none') {
        restoreList.push({
          node: curr,
          val: inlineDisplay,
          priority: curr.style.getPropertyPriority('display'),
        });
        curr.style.removeProperty('display');
      }
    }
    curr = curr.parentElement;
  }

  if (hadHideNotesClass) {
    root.classList.remove('pwc-hide-notes');
  }

  try {
    const innerBtn =
      typeof el.querySelector === 'function'
        ? el.querySelector<HTMLElement>('button, [role="button"]')
        : null;
    const clickTarget = innerBtn || el;

    if (clickTarget instanceof HTMLElement) {
      clickTarget.click();
      return true;
    } else if (clickTarget instanceof SVGElement) {
      clickTarget.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
      );
      return true;
    }
  } catch {
    /* ignore */
  } finally {
    for (const item of restoreList) {
      item.node.style.setProperty('display', item.val, item.priority);
    }
    if (hadHideNotesClass) {
      root.classList.add('pwc-hide-notes');
    }
  }
  return false;
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
  wakePlayerControlsDom();
  const wasFullscreen = !!document.fullscreenElement;
  const fsBtn = findFullscreenButton();

  if (fsBtn && clickElement(fsBtn)) {
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
      executeQuickExit();
      return;
    }

    const triggerPanelButton = (finder: () => Element | null) => {
      if (document.documentElement.classList.contains('pwc-collapsed-state')) {
        document.documentElement.classList.remove('pwc-collapsed-state');
      }
      wakePlayerControlsDom();
      clickElement(finder());
      window.requestAnimationFrame(() => {
        applyDistractorsState();
      });
    };

    // Live Chat (C)
    if (state.keyChat && matchKey(e, state.keyChat)) {
      e.preventDefault();
      if (!state.hideSettings.hideChat || state.allowShortcutsWhenHidden) {
        triggerPanelButton(findChatButton);
      }
      return;
    }

    // Note Timeline (T)
    if (state.keyTimeline && matchKey(e, state.keyTimeline)) {
      e.preventDefault();
      if (!state.hideSettings.hideNoteTimeline || state.allowShortcutsWhenHidden) {
        triggerPanelButton(findTimelineButton);
      }
      return;
    }

    // Study Notes (N / A)
    if (state.keyNotes && matchKey(e, state.keyNotes)) {
      e.preventDefault();
      if (!state.hideSettings.hideNotes || state.allowShortcutsWhenHidden) {
        triggerPanelButton(findNotesButton);
      }
      return;
    }

    // Doubt Q&A (D)
    if (state.keyDoubt && matchKey(e, state.keyDoubt)) {
      e.preventDefault();
      if (!state.hideSettings.hideDoubt || state.allowShortcutsWhenHidden) {
        triggerPanelButton(findDoubtButton);
      }
      return;
    }
  });
}
