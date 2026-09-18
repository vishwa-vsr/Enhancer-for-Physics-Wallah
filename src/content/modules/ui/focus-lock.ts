import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { cancelSpaceHold } from '../shortcuts/space-hold';
import { isUserTyping } from '../shortcuts/keyboard';
import { showInfoToast } from './toast';

/**
 * Focus Lock Mode — strict full screen study session.
 *
 * One click puts the player into full screen and pauses playback with
 * a reminder modal if the student tries to exit fullscreen or leave the lecture tab.
 */

const FOCUS_LOCK_BTN_ID = 'pwc-focus-lock-btn';
const MODAL_ID = 'pwc-focus-lock-modal';
const INTERSTITIAL_ID = 'pwc-focus-lock-interstitial';

let focusLockActive = false;
let pausedByGuard = false;
let intentionalFullscreenExit = false;
let isInitialized = false;

export function isFocusLockActive(): boolean {
  return focusLockActive;
}

// Resolve the outermost player container (fullscreen target), consistent with
// the container resolution used across the extension's modules.
function getPlayerContainer(): HTMLElement | null {
  const video = getActiveVideo();
  if (!video) return null;
  return (
    (document.getElementById('video-player-container') as HTMLElement | null) ||
    (video.closest('.video-player-app') as HTMLElement | null) ||
    (video.closest('[class*="video-player" i]') as HTMLElement | null) ||
    (video.parentElement as HTMLElement | null)
  );
}

function pauseActiveVideo(): void {
  const video = getActiveVideo();
  if (video && !video.paused) {
    try {
      video.pause();
    } catch (_e) {
      // Ignored: video already paused or interrupted
    }
  }
  cancelSpaceHold();
}

// Best-effort fullscreen request. When no user gesture is available (e.g.
// activation triggered from the extension popup), browsers reject the request;
// a click-to-fullscreen interstitial is shown as a graceful fallback.
function requestPlayerFullscreen(): void {
  if (document.fullscreenElement) return;
  const container = getPlayerContainer();
  if (!container) {
    showInterstitial();
    return;
  }
  try {
    const request = container.requestFullscreen({ navigationUI: 'hide' });
    if (request && typeof request.then === 'function') {
      request
        .then(() => removeInterstitial())
        .catch(() => showInterstitial());
    }
  } catch (_e) {
    showInterstitial();
  }
}

// ===== Activation / Deactivation =====

export function activateFocusLock(): boolean {
  if (focusLockActive) return true;
  if (!state.extensionEnabled) return false;
  if (!getActiveVideo()) {
    showInfoToast('Open a lecture video to use Focus Lock');
    return false;
  }

  focusLockActive = true;
  pausedByGuard = false;
  intentionalFullscreenExit = false;

  // 1. Mark the document so CSS hooks can react to the locked session.
  document.documentElement.classList.add('pwc-focus-lock-active');

  // 2. Clean fullscreen presentation.
  requestPlayerFullscreen();

  updateFocusLockButton();
  showInfoToast('Focus Lock ON — pauses if you leave full screen');
  return true;
}

export function deactivateFocusLock(): void {
  if (!focusLockActive) return;
  focusLockActive = false;
  pausedByGuard = false;

  document.documentElement.classList.remove('pwc-focus-lock-active');
  removeModal();
  removeInterstitial();

  if (document.fullscreenElement) {
    intentionalFullscreenExit = true;
    try {
      void document.exitFullscreen();
    } catch (_e) {
      // Ignored: fullscreen already exited
    }
  }

  updateFocusLockButton();
  showInfoToast('Focus Lock OFF');
}

export function toggleFocusLock(): boolean {
  if (focusLockActive) {
    deactivateFocusLock();
    return false;
  }
  return activateFocusLock();
}

// ===== Anti-Distraction Guards =====

// Exiting fullscreen (Escape key or the native button) during a locked
// session immediately pauses playback and shows the reminder modal.
function handleFullscreenChange(): void {
  if (!focusLockActive) return;

  if (document.fullscreenElement) {
    // Successfully entered fullscreen — clean up the click-to-fullscreen prompt.
    removeInterstitial();
    return;
  }

  removeInterstitial();
  if (intentionalFullscreenExit) {
    intentionalFullscreenExit = false;
    return;
  }

  pauseActiveVideo();
  pausedByGuard = true;
  showModal();
}

// Leaving the lecture tab pauses the video instantly; returning shows the
// reminder modal so the student consciously chooses to continue or quit.
function handleVisibilityChange(): void {
  if (!focusLockActive) return;

  if (document.hidden) {
    pauseActiveVideo();
    pausedByGuard = true;
  } else if (pausedByGuard && !isModalVisible()) {
    showModal();
  }
}

// Best-effort early interception: browsers usually consume the Escape key to
// leave fullscreen (the fullscreenchange guard covers that path), but when the
// event reaches the page we can react instantly.
function handleKeyDown(event: KeyboardEvent): void {
  if (!focusLockActive) return;
  if (event.key !== 'Escape') return;
  if (isUserTyping()) return;

  pauseActiveVideo();
  pausedByGuard = true;
  showModal();
}

// ===== Stay Focused Modal =====

function isModalVisible(): boolean {
  return !!document.getElementById(MODAL_ID);
}

// The modal must live inside the fullscreen element when one is active,
// otherwise it would be invisible (only the fullscreen subtree is rendered).
function getOverlayRoot(): HTMLElement {
  return (document.fullscreenElement as HTMLElement | null) || document.body;
}

function showModal(): void {
  if (isModalVisible()) return;

  const overlay = document.createElement('div');
  overlay.id = MODAL_ID;
  overlay.className = 'pwc-focus-lock-overlay';

  const card = document.createElement('div');
  card.className = 'pwc-focus-lock-card';

  const title = document.createElement('h3');
  title.className = 'pwc-focus-lock-title';
  title.textContent = 'Stay Focused!';
  card.appendChild(title);

  const text = document.createElement('p');
  text.className = 'pwc-focus-lock-text';
  text.textContent =
    'Your study session is still running. Do you want to return to fullscreen, or quit?';
  card.appendChild(text);

  const actions = document.createElement('div');
  actions.className = 'pwc-focus-lock-actions';

  const returnBtn = document.createElement('button');
  returnBtn.type = 'button';
  returnBtn.className = 'pwc-focus-lock-accept';
  returnBtn.textContent = 'Return';
  returnBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    removeModal();
    pausedByGuard = false;
    if (!document.fullscreenElement) {
      requestPlayerFullscreen();
    }
    // The student chose to continue the session — resume playback.
    const video = getActiveVideo();
    if (video && video.paused) {
      video.play().catch(() => {});
    }
  });
  actions.appendChild(returnBtn);

  const quitBtn = document.createElement('button');
  quitBtn.type = 'button';
  quitBtn.className = 'pwc-focus-lock-quit';
  quitBtn.textContent = 'Quit';
  quitBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    deactivateFocusLock();
  });
  actions.appendChild(quitBtn);

  card.appendChild(actions);
  overlay.appendChild(card);
  getOverlayRoot().appendChild(overlay);
}

function removeModal(): void {
  document.getElementById(MODAL_ID)?.remove();
}

// ===== Click-to-Fullscreen Interstitial (no-gesture fallback) =====

function showInterstitial(): void {
  if (document.getElementById(INTERSTITIAL_ID)) return;

  const pill = document.createElement('button');
  pill.type = 'button';
  pill.id = INTERSTITIAL_ID;
  pill.className = 'pwc-focus-lock-interstitial';
  pill.textContent = 'Focus Lock is ON — click to enter fullscreen';
  pill.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    requestPlayerFullscreen();
  });

  getOverlayRoot().appendChild(pill);
}

function removeInterstitial(): void {
  document.getElementById(INTERSTITIAL_ID)?.remove();
}

// ===== Player Toolbar Button =====

function updateFocusLockButton(): void {
  const btn = document.getElementById(FOCUS_LOCK_BTN_ID);
  if (!btn) return;
  btn.classList.toggle('active', focusLockActive);
  btn.setAttribute(
    'title',
    focusLockActive ? 'Exit Focus Lock' : 'Focus Lock (Full screen study session)'
  );
}

export function injectFocusLockButton(): void {
  document.getElementById(FOCUS_LOCK_BTN_ID)?.remove();
}

// ===== Initialization & Popup Bridge =====

export function initFocusLock(): void {
  if (isInitialized) return;
  isInitialized = true;

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  document.addEventListener('keydown', handleKeyDown, true);

  // Messaging bridge so the extension popup can control Focus Lock on the
  // exact lecture tab (no extra permissions required). With all_frames
  // enabled, only the frame that actually hosts the lecture video answers.
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    try {
      chrome.runtime.onMessage.addListener((msg: unknown, _sender, sendResponse) => {
        try {
          if (!chrome.runtime || !chrome.runtime.id) return;
          const message = msg as { type?: string; action?: string } | null;
          if (!message || message.type !== 'PWC_FOCUS_LOCK') return;

          const action = message.action;
          if (action === 'get') {
            if (focusLockActive || getActiveVideo()) {
              sendResponse({ ok: true, active: focusLockActive });
            }
          } else if (action === 'toggle') {
            if (focusLockActive) {
              deactivateFocusLock();
              sendResponse({ ok: true, active: false });
            } else if (getActiveVideo()) {
              const ok = activateFocusLock();
              sendResponse({ ok, active: focusLockActive });
            }
            // No video in this frame: stay silent so a frame hosting the
            // lecture player can answer instead.
          }
        } catch (_e) {
          // Ignored: extension context invalidated
        }
      });
    } catch (_err) {
      // Ignored: chrome runtime unavailable
    }
  }
}
