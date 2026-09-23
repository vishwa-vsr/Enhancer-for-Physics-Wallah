import { state } from '../../state';
import { getActiveVideo } from '../video/detector';

let idleTimer: number | null = null;
let isInitialized = false;

function getPlayerContainer(): HTMLElement | null {
  const video = getActiveVideo();
  if (!video) return null;
  return (
    document.getElementById('video-player-container') ||
    video.closest<HTMLElement>('.video-player-app') ||
    (video.parentElement as HTMLElement | null)
  );
}

function isMenuOrPopupOpen(): boolean {
  // Check headlessui open menus (settings gear, dropdowns)
  const openHeadless = document.querySelector(
    '[data-headlessui-state*="open"], [aria-expanded="true"]',
  );
  if (openHeadless) return true;

  // Check our custom quality menu
  const qualityMenu = document.querySelector('.pwc-quality-container.pwc-menu-open');
  if (qualityMenu) return true;

  // Check Video.js locked/open menus
  const vjsMenu = document.querySelector('.vjs-menu.vjs-lock-showing');
  if (vjsMenu && (vjsMenu as HTMLElement).offsetWidth > 0) return true;

  return false;
}

function wakeUp(): void {
  const container = getPlayerContainer();
  if (container) {
    container.classList.remove('pwc-autohide-inactive');
  }
}

function sleep(): void {
  if (!state.extensionEnabled || !state.autoHideControls) {
    wakeUp();
    return;
  }

  const video = getActiveVideo();
  if (!video) return;

  // If paused and the user chose NOT to auto-hide during pause, keep awake
  if (video.paused && !state.autoHideWhenPaused) {
    wakeUp();
    return;
  }

  // If user is currently browsing an open settings/quality menu, keep awake
  if (isMenuOrPopupOpen()) {
    scheduleNextCheck();
    return;
  }

  // Fade out player controls and hide cursor (without collapsing outer page layout)
  const container = getPlayerContainer();
  if (container) {
    container.classList.add('pwc-autohide-inactive');
  }
}

function scheduleNextCheck(): void {
  if (idleTimer !== null) {
    window.clearTimeout(idleTimer);
    idleTimer = null;
  }

  if (!state.extensionEnabled || !state.autoHideControls) {
    wakeUp();
    return;
  }

  const delayMs = Math.max(200, (state.autoHideDelay || 0.8) * 1000);
  idleTimer = window.setTimeout(sleep, delayMs);
}

function onUserActivity(): void {
  wakeUp();
  scheduleNextCheck();
}

export function syncAutoHide(): void {
  if (!state.extensionEnabled || !state.autoHideControls) {
    if (idleTimer !== null) {
      window.clearTimeout(idleTimer);
      idleTimer = null;
    }
    wakeUp();
  } else {
    scheduleNextCheck();
  }
}

export function initAutoHide(): void {
  if (isInitialized) return;
  isInitialized = true;

  const options = { passive: true };
  window.addEventListener('mousemove', onUserActivity, options);
  window.addEventListener('mousedown', onUserActivity, options);
  window.addEventListener('keydown', onUserActivity, options);
  window.addEventListener('touchstart', onUserActivity, options);
  window.addEventListener('wheel', onUserActivity, options);

  // Monitor play/pause on active video to update hide behavior
  document.addEventListener(
    'play',
    () => {
      scheduleNextCheck();
    },
    true,
  );

  document.addEventListener(
    'pause',
    () => {
      if (!state.autoHideWhenPaused) {
        wakeUp();
      } else {
        scheduleNextCheck();
      }
    },
    true,
  );

  syncAutoHide();
}
