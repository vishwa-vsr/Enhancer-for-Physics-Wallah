import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { isLiveVideo } from '../ui/finish-time';

let userOpenedPoll = false;
let userOpenedTime = 0;
let wasPlayingBeforePoll = false;
let blockerInitialized = false;
let isPollDismissing = false;

/**
 * Returns whether a recorded poll is actively being dismissed.
 */
export function isHandlingRecordedPoll(): boolean {
  return isPollDismissing;
}

/**
 * Releases the silence controls lock and allows normal control bar display.
 */
export function clearSilenceControlsLock(): void {
  if (!isPollDismissing) return;
  isPollDismissing = false;
  document.documentElement.classList.remove('pwc-poll-silence-controls');
}

/**
 * Freezes the bottom control bar as hidden during automated poll dismissal.
 */
export function applySilenceControlsLock(): void {
  // If user is currently hovering over player controls, don't force-hide them
  const isHoveringControls = !!document.querySelector(
    '.player-header:hover, [class*="player-header" i]:hover, #player-footer-controls:hover, .player-footer:hover, #footer-right-section:hover, #footer-left-section:hover, #progress-placeholder:hover, #progress-control:hover',
  );
  if (isHoveringControls) return;

  isPollDismissing = true;
  document.documentElement.classList.add('pwc-poll-silence-controls');

  // Enforce Video.js user-inactive flags on player container
  const player = document.querySelector<HTMLElement>(
    '.video-js, #video-player-container, [class*="video-player" i]',
  );
  if (player) {
    player.classList.add('vjs-user-inactive');
    player.classList.remove('vjs-user-active');
  }

  // Ensure speed widget slider does not expand
  const speedContainer = document.getElementById('pwc-speed-control');
  if (speedContainer && !state.alwaysExpandWidget) {
    speedContainer.classList.remove('pwc-expanded');
  }

  // Release any active focus on close button or player controls
  if (
    document.activeElement &&
    document.activeElement instanceof HTMLElement &&
    document.activeElement !== document.body
  ) {
    document.activeElement.blur();
  }
}

/**
 * Synchronizes the zero-flicker CSS suppression class on the root HTML element.
 */
export function syncPollSuppressionClass(): void {
  const root = document.documentElement;
  if (!root) return;

  const shouldSuppress =
    state.extensionEnabled && state.blockRecordedPolls && !userOpenedPoll;

  if (shouldSuppress) {
    root.classList.add('pwc-block-recorded-polls');
  } else {
    root.classList.remove('pwc-block-recorded-polls');
  }
}

/**
 * Initializes click listeners and global playback tracking for smart poll handling.
 */
export function initPollBlocker(): void {
  if (blockerInitialized || typeof window === 'undefined') return;
  blockerInitialized = true;

  // Track user manual clicks on the poll trigger icon vs close button
  window.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // User manually clicked the top poll button
      const pollTrigger = target.closest(
        '#record-poll-icon, button[aria-label="Poll" i], [id*="poll-icon" i]',
      );
      if (pollTrigger && e.isTrusted) {
        userOpenedPoll = true;
        userOpenedTime = Date.now();
        syncPollSuppressionClass();
      }

      // User clicked close button or drawer close action
      const closeBtn = target.closest(
        '#close-poll-wrapperIcon, button[aria-label="Close Poll" i], [data-drawer-close="true"]',
      );
      if (closeBtn && e.isTrusted) {
        userOpenedPoll = false;
        syncPollSuppressionClass();
      }
    },
    { capture: true, passive: true },
  );

  // Release silence lock instantly on genuine user interaction (mouse, touch, or keyboard)
  const onUserInteraction = (e: Event) => {
    if (e.isTrusted && isPollDismissing) {
      clearSilenceControlsLock();
    }
  };
  window.addEventListener('mousemove', onUserInteraction, { capture: true, passive: true });
  window.addEventListener('mousedown', onUserInteraction, { capture: true, passive: true });
  window.addEventListener('keydown', onUserInteraction, { capture: true, passive: true });
  window.addEventListener('touchstart', onUserInteraction, { capture: true, passive: true });
  window.addEventListener('wheel', onUserInteraction, { capture: true, passive: true });

  window.addEventListener(
    'play',
    () => {
      wasPlayingBeforePoll = true;
    },
    { capture: true, passive: true },
  );

  window.addEventListener(
    'timeupdate',
    (e) => {
      const vid = e.target as HTMLVideoElement | null;
      if (vid && !vid.paused && !vid.ended) {
        wasPlayingBeforePoll = true;
      }
    },
    { capture: true, passive: true },
  );

  window.addEventListener(
    'pause',
    () => {
      // If paused when no poll is present or appearing, the student paused it manually
      const hasPoll = document.querySelector(
        '#close-poll-wrapperIcon, button[aria-label="Close Poll" i], [data-drawer-close="true"]',
      );
      if (!hasPoll) {
        setTimeout(() => {
          const pollNow = document.querySelector(
            '#close-poll-wrapperIcon, button[aria-label="Close Poll" i], [data-drawer-close="true"]',
          );
          if (!pollNow) {
            wasPlayingBeforePoll = false;
          }
        }, 120);
      }
    },
    { capture: true, passive: true },
  );

  syncPollSuppressionClass();
}

/**
 * Inspects the DOM for recorded poll popups, silently suppresses the drawer,
 * clicks the close button, and resumes video playback if interrupted.
 */
export function handleRecordedPolls(): void {
  // If disabled or feature is OFF, ensure CSS suppression is removed and exit
  if (!state.extensionEnabled || !state.blockRecordedPolls) {
    if (userOpenedPoll) userOpenedPoll = false;
    syncPollSuppressionClass();
    return;
  }

  // If user opened manually, check if the drawer has now closed (and cooldown passed)
  if (userOpenedPoll) {
    const activeCloseBtn = document.querySelector<HTMLButtonElement>(
      '#close-poll-wrapperIcon, button[aria-label="Close Poll" i], [data-drawer-close="true"]',
    );
    if (!activeCloseBtn && Date.now() - userOpenedTime > 1000) {
      userOpenedPoll = false;
    }
    syncPollSuppressionClass();
    if (userOpenedPoll) {
      return;
    }
  }

  syncPollSuppressionClass();

  // Guard: Do not dismiss polls in live streams
  const video = getActiveVideo();
  if (video && isLiveVideo(video)) {
    return;
  }

  const closeBtn = document.querySelector<HTMLButtonElement>(
    '#close-poll-wrapperIcon, button[aria-label="Close Poll" i], [data-drawer-close="true"]',
  );
  if (!closeBtn) return;

  // Apply silence lock to keep bottom controls hidden during dismissal
  applySilenceControlsLock();

  // Immediately hide the drawer visually to eliminate any animation flicker
  const drawer =
    closeBtn.closest<HTMLElement>(
      '.slide-in-from-right, [class*="slide-in" i], div:has(#close-poll-wrapperIcon)',
    ) || closeBtn.parentElement;

  if (drawer) {
    drawer.style.setProperty('display', 'none', 'important');
    drawer.setAttribute('data-pwc-poll-drawer', 'suppressed');
  }

  // Dismiss poll via native close button click
  if (!closeBtn.disabled) {
    try {
      closeBtn.click();
    } catch {
      // Ignored
    }
  }

  // Smart Resume: If the video was playing right before PW opened the poll, resume playback
  if (wasPlayingBeforePoll && video && video.paused) {
    try {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } catch {
      // Ignored
    }
  }
}
