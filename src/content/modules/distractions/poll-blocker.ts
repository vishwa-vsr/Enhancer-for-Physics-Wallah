import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { isLiveVideo } from '../ui/finish-time';
import { isUserTyping } from '../shortcuts/keyboard';

let userOpenedPoll = false;
let userOpenedTime = 0;
let wasPlayingBeforePoll = false;
let lastUserPauseTime = 0;
let blockerInitialized = false;
let pollObserver: MutationObserver | null = null;
const dismissedButtons = new WeakSet<HTMLButtonElement>();

/**
 * Synchronizes the zero-flicker CSS suppression class on the root HTML element
 * and notifies the main world engine bridge.
 */
export function syncPollSuppressionClass(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (!root) return;

  const video = getActiveVideo();
  const isLive = video ? isLiveVideo(video) : false;

  const shouldSuppress =
    state.extensionEnabled && state.blockRecordedPolls && !userOpenedPoll && !isLive;

  if (shouldSuppress) {
    root.classList.add('pwc-block-recorded-polls');
  } else {
    root.classList.remove('pwc-block-recorded-polls');
  }

  // Sync state to Main World Engine Bridge (Path A)
  try {
    window.dispatchEvent(
      new CustomEvent('PWC_SET_BLOCK_RECORDED_POLLS', {
        detail: { enabled: shouldSuppress },
      }),
    );
  } catch {
    // Ignore
  }
}

/**
 * Explicitly clears all drawer suppression attributes and unhides footer controls.
 * Used when a student triggers Chat, Doubts, or Timeline.
 */
export function clearPollSuppressionNow(): void {
  document.querySelectorAll('[data-pwc-poll-suppressed]').forEach((el) => {
    el.removeAttribute('data-pwc-poll-suppressed');
  });
  const footerControls = document.getElementById('player-footer-controls');
  if (footerControls) {
    footerControls.classList.remove('!hidden', 'sf-hidden');
  }
}

/**
 * Initializes click listeners, dedicated DOM observer, and global playback tracking.
 */
export function initPollBlocker(): void {
  if (blockerInitialized || typeof window === 'undefined') return;
  blockerInitialized = true;

  // Track explicit student manual clicks on the poll trigger icon vs close button
  window.addEventListener(
    'click',
    (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Student deliberately clicked the top poll button -> allow them to view and interact
      const pollTrigger = target.closest('#record-poll-icon, button[aria-label="Poll" i]');
      if (pollTrigger && e.isTrusted) {
        userOpenedPoll = true;
        userOpenedTime = Date.now();
        syncPollSuppressionClass();
        return;
      }

      // Student deliberately clicked close on a poll drawer they had opened
      const pollClose = target.closest(
        '#close-poll-wrapperIcon, button[aria-label="Close Poll" i]',
      );
      if (pollClose && e.isTrusted) {
        userOpenedPoll = false;
        syncPollSuppressionClass();
      }
    },
    { capture: true, passive: true },
  );

  // Dedicated zero-latency MutationObserver for poll drawer appearances
  if (!pollObserver && typeof MutationObserver !== 'undefined') {
    pollObserver = new MutationObserver(() => {
      if (state.blockRecordedPolls && !userOpenedPoll) {
        const hasPoll = document.querySelector(
          '#close-poll-wrapperIcon, button[aria-label="Close Poll" i]',
        );
        if (hasPoll) {
          handleRecordedPolls();
        }
      }
    });

    const startObserving = () => {
      const targetNode = document.body || document.documentElement;
      if (targetNode && pollObserver) {
        pollObserver.observe(targetNode, {
          childList: true,
          subtree: true,
        });
      }
    };

    if (document.body) {
      startObserving();
    } else {
      document.addEventListener('DOMContentLoaded', startObserving, { once: true });
    }
  }

  // Track student manual pause interactions to distinguish from automated PW pauses
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (e.isTrusted && (e.key === ' ' || e.key === 'k' || e.key === 'K')) {
        lastUserPauseTime = Date.now();
      }
    },
    { capture: true, passive: true },
  );

  window.addEventListener(
    'pointerdown',
    (e: PointerEvent) => {
      if (e.isTrusted) {
        const target = e.target as HTMLElement | null;
        if (
          target?.closest(
            '.vjs-play-control, .vjs-tech, video, .player, [aria-label*="play" i], [aria-label*="pause" i]',
          )
        ) {
          lastUserPauseTime = Date.now();
        }
      }
    },
    { capture: true, passive: true },
  );

  // Playback tracking for smart resume
  window.addEventListener(
    'play',
    () => {
      wasPlayingBeforePoll = true;
    },
    { capture: true, passive: true },
  );

  window.addEventListener(
    'timeupdate',
    (e: Event) => {
      const vid = e.target as HTMLVideoElement | null;
      if (vid && !vid.paused && !vid.ended) {
        wasPlayingBeforePoll = true;
      }
      if (state.blockRecordedPolls && !userOpenedPoll) {
        handleRecordedPolls();
      }
    },
    { capture: true, passive: true },
  );

  window.addEventListener(
    'pause',
    () => {
      // If student manually initiated the pause, record that it was not playing before a poll
      if (Date.now() - lastUserPauseTime < 300) {
        wasPlayingBeforePoll = false;
        return;
      }

      // Check immediately and retry at intervals to catch React rendering frames
      handleRecordedPolls();
      setTimeout(handleRecordedPolls, 50);
      setTimeout(handleRecordedPolls, 150);
      setTimeout(handleRecordedPolls, 300);
    },
    { capture: true, passive: true },
  );

  syncPollSuppressionClass();
}

/**
 * Inspects the DOM for recorded poll popups, silently suppresses the drawer,
 * clicks the close button once, and resumes video playback if interrupted.
 */
export function handleRecordedPolls(): void {
  // If extension or blocker feature is disabled, ensure clean state and exit
  if (!state.extensionEnabled || !state.blockRecordedPolls) {
    if (userOpenedPoll) userOpenedPoll = false;
    syncPollSuppressionClass();
    return;
  }

  // Guard: Never touch polls in live streams
  const video = getActiveVideo();
  if (video && isLiveVideo(video)) {
    syncPollSuppressionClass();
    return;
  }

  // If user opened manually, check if the drawer has now closed (and cooldown passed)
  if (userOpenedPoll) {
    const activeCloseBtn = document.querySelector<HTMLButtonElement>(
      '#close-poll-wrapperIcon, button[aria-label="Close Poll" i]',
    );
    if (!activeCloseBtn && Date.now() - userOpenedTime > 1500) {
      userOpenedPoll = false;
    }
    syncPollSuppressionClass();
    if (userOpenedPoll) {
      return;
    }
  }

  syncPollSuppressionClass();

  // Locate poll close button strictly by ID or exact aria-label (NEVER generic drawer selectors)
  const closeBtn = document.querySelector<HTMLButtonElement>(
    '#close-poll-wrapperIcon, button[aria-label="Close Poll" i]',
  );
  if (!closeBtn) return;

  // Find the outermost drawer container
  const drawer =
    closeBtn.closest<HTMLElement>('.player > div') ||
    closeBtn.closest<HTMLElement>('[class*="slide-in" i]') ||
    closeBtn.closest<HTMLElement>('aside, [role="dialog"], [class*="drawer" i]') ||
    closeBtn.closest<HTMLElement>('div:not(:has(video))') ||
    closeBtn.parentElement;

  // Confirm that the drawer heading explicitly contains "Poll" (unless identified by exact ID)
  const heading =
    drawer?.querySelector('span[data-drawer-heading="true"]') ||
    document.querySelector('span[data-drawer-heading="true"]');
  if (
    heading &&
    !(heading.textContent || '').trim().toLowerCase().includes('poll') &&
    closeBtn.id !== 'close-poll-wrapperIcon'
  ) {
    return;
  }

  // Immediately apply suppression attribute (CSS handles zero-flicker suppression without breaking transitions)
  if (drawer) {
    drawer.setAttribute('data-pwc-poll-suppressed', 'true');

    // Dispatch synthetic transition and animation events so PW unfreezes its internal state immediately
    try {
      drawer.dispatchEvent(
        new TransitionEvent('transitionend', { bubbles: true, propertyName: 'transform' }),
      );
      drawer.dispatchEvent(
        new AnimationEvent('animationend', { bubbles: true, animationName: 'slideOutToRight' }),
      );
    } catch {
      // Ignore
    }

    setTimeout(() => {
      drawer.removeAttribute('data-pwc-poll-suppressed');
    }, 300);
  }

  // Release typing focus only if the student isn't actively typing and focus is on the close button
  if (!isUserTyping()) {
    const active = document.activeElement;
    if (active && (active === closeBtn || (drawer && drawer.contains(active)))) {
      (active as HTMLElement).blur();
    }
  }

  // Dismiss poll via native close button click (fire only once per button instance)
  if (!dismissedButtons.has(closeBtn)) {
    dismissedButtons.add(closeBtn);
    if (!closeBtn.disabled) {
      try {
        closeBtn.click();
      } catch {
        // Ignored
      }
    }
  }

  // Ensure PW's bottom player controls remain unhidden and interactive
  const footerControls = document.getElementById('player-footer-controls');
  if (footerControls) {
    footerControls.classList.remove('!hidden', 'sf-hidden');
    footerControls.style.removeProperty('display');
  }

  // Neutralize PW's "All controls are disabled during Poll!" blocking overlay
  const disabledOverlay =
    document.querySelector<HTMLElement>('#player-body > div:has(.bg-customDarkGray)') ||
    document.querySelector<HTMLElement>('.bg-customDarkGray');
  if (disabledOverlay) {
    disabledOverlay.remove();
  }

  // Smart Resume: If the video was playing right before PW paused for the poll, resume playback
  if (wasPlayingBeforePoll && video && video.paused) {
    // Guard: Do not resume if user switched tabs and autoPauseOnHide is enabled
    if (document.hidden && state.autoPauseOnHide) {
      return;
    }

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
