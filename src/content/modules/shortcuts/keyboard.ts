import { state } from '../../state';
import { stepSpeed, saveSpeed } from '../video/controller';
import { getSSCurrentState } from '../audio/skip-silence';

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

let isInitialized = false;

// Listen to keyboard shortcuts (bubble phase)
export function initKeyboardShortcuts(): void {
  if (isInitialized) return;
  isInitialized = true;

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!state.extensionEnabled || !state.enableHotkeys) return;
    if (state.skipSilenceEnabled && getSSCurrentState() === 'silence') return;

    // Safety check: Ignore if typing in text fields
    if (isUserTyping()) return;

    if (matchKey(e, state.keySpeedUp)) {
      e.preventDefault();
      saveSpeed(stepSpeed(1));
    } else if (matchKey(e, state.keySlowDown)) {
      e.preventDefault();
      saveSpeed(stepSpeed(-1));
    } else if (matchKey(e, state.keyReset)) {
      e.preventDefault();
      saveSpeed(1.0);
    }
  });
}
