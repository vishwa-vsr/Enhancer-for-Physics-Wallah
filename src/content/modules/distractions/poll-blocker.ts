import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { isLiveVideo } from '../ui/finish-time';
import { isUserTyping } from '../shortcuts/keyboard';
import {
  POLL_CLOSE_CANDIDATE_SELECTOR,
  findGenuinePollCloseButton,
  isGenuinePollCloseButton,
  isProtectedPlayerStructure,
  resolvePollDrawerContainer,
} from './elements';

const TIMEUPDATE_FALLBACK_INTERVAL_MS = 1500;

let userOpenedPoll = false;
let userOpenedTime = 0;
let wasPlayingBeforePoll = false;
let lastUserPauseTime = 0;
let blockerInitialized = false;
let isHandlingPoll = false;
let pollObserver: MutationObserver | null = null;
const dismissedButtons = new WeakSet<HTMLButtonElement>();
let lastAutoDismissTime = 0;
let lastSyncedPollSuppression: boolean | null = null;
let lastTimeupdateScan = 0;
let pendingPollCheck = false;
const trackedVideos = new WeakSet<HTMLVideoElement>();
const trackedTextTracks = new WeakSet<TextTrack>();

/**
 * Unfocuses the poll trigger icon if it gets focused after a poll closes,
 * allowing PW's natural global hotkeys (Space, Arrow keys) to function cleanly
 * without double-firing on the video player container.
 */
export function clearPollButtonFocus(): void {
  if (typeof document === 'undefined') return;

  // Guard: Never steal focus if student is actively typing in a doubt box, search bar, or chat
  if (isUserTyping()) return;

  const pollBtn = document.querySelector<HTMLElement>(
    '#record-poll-icon, button[aria-label="Poll" i]',
  );

  // Unfocus poll button if it is currently focused or contains focus
  if (
    document.activeElement &&
    (document.activeElement === pollBtn || pollBtn?.contains(document.activeElement))
  ) {
    pollBtn.blur();
  }
}

/**
 * Schedules multiple frames of focus clearing to beat React / HeadlessUI deferred focus restoration.
 */
export function schedulePollButtonBlur(): void {
  clearPollButtonFocus();
  if (typeof window === 'undefined') return;

  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(clearPollButtonFocus);
  }
  setTimeout(clearPollButtonFocus, 50);
  setTimeout(clearPollButtonFocus, 150);
  setTimeout(clearPollButtonFocus, 300);
}

/**
 * Synchronizes the zero-flicker CSS suppression class on the root HTML element
 * and notifies the main world engine bridge when the suppression state changes.
 */
export function syncPollSuppressionClass(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (!root) return;

  const video = getActiveVideo();
  const isLive = video ? isLiveVideo(video) : false;

  const shouldSuppress =
    state.extensionEnabled && state.blockRecordedPolls && !userOpenedPoll && !isLive;

  if (
    lastSyncedPollSuppression === shouldSuppress &&
    root.classList.contains('pwc-block-recorded-polls') === shouldSuppress
  ) {
    return;
  }
  lastSyncedPollSuppression = shouldSuppress;

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

function hasElementMutation(mutations: MutationRecord[]): boolean {
  for (let i = 0; i < mutations.length; i += 1) {
    const added = mutations[i].addedNodes;
    for (let j = 0; j < added.length; j += 1) {
      if (added[j].nodeType === 1) {
        return true;
      }
    }
  }
  return false;
}

function scheduleImmediatePollCheck(): void {
  pendingPollCheck = true;
  handleRecordedPolls();
  setTimeout(handleRecordedPolls, 50);
  setTimeout(handleRecordedPolls, 150);
}

function bindTextTrackCueListener(track: TextTrack | null | undefined): void {
  if (!track || trackedTextTracks.has(track)) return;
  trackedTextTracks.add(track);
  track.addEventListener?.('cuechange', () => {
    if (!state.extensionEnabled || !state.blockRecordedPolls || userOpenedPoll) return;
    pendingPollCheck = true;
    const cues = track.activeCues;
    if (cues && cues.length > 0) {
      for (let i = 0; i < cues.length; i += 1) {
        const text = (cues[i] as VTTCue | undefined)?.text?.toLowerCase() || '';
        if (text.includes('poll') || text.includes('quiz') || track.kind === 'metadata') {
          scheduleImmediatePollCheck();
          return;
        }
      }
    }
  });
}

function attachVideoCueListeners(video: HTMLVideoElement | null): void {
  if (!video || trackedVideos.has(video)) return;
  trackedVideos.add(video);

  const trackList = video.textTracks;
  if (!trackList) return;

  for (let i = 0; i < trackList.length; i += 1) {
    bindTextTrackCueListener(trackList[i]);
  }
  trackList.addEventListener?.('addtrack', (ev: TrackEvent) => {
    bindTextTrackCueListener(ev.track);
  });
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
      const pollClose = target.closest(POLL_CLOSE_CANDIDATE_SELECTOR);
      if (pollClose && e.isTrusted && isGenuinePollCloseButton(pollClose)) {
        userOpenedPoll = false;
        syncPollSuppressionClass();
      }
    },
    { capture: true, passive: true },
  );

  // Dedicated zero-latency MutationObserver for poll drawer appearances
  if (!pollObserver && typeof MutationObserver !== 'undefined') {
    pollObserver = new MutationObserver((mutations) => {
      if (!state.extensionEnabled || !state.blockRecordedPolls || userOpenedPoll) {
        return;
      }
      if (!hasElementMutation(mutations)) {
        return;
      }
      if (findGenuinePollCloseButton()) {
        pendingPollCheck = true;
        handleRecordedPolls();
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
    (e: Event) => {
      wasPlayingBeforePoll = true;
      const vid = e.target as HTMLVideoElement | null;
      if (vid && vid.tagName === 'VIDEO') {
        attachVideoCueListeners(vid);
      }
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
      if (!state.extensionEnabled || !state.blockRecordedPolls) {
        return;
      }
      if (vid && vid.tagName === 'VIDEO') {
        attachVideoCueListeners(vid);
      }

      const now = Date.now();
      const elapsed = now - lastTimeupdateScan;
      if (userOpenedPoll) {
        if (elapsed < TIMEUPDATE_FALLBACK_INTERVAL_MS) return;
        lastTimeupdateScan = now;
        handleRecordedPolls();
        return;
      }

      if (!pendingPollCheck && (!vid || !vid.paused) && elapsed < TIMEUPDATE_FALLBACK_INTERVAL_MS) {
        return;
      }

      pendingPollCheck = false;
      lastTimeupdateScan = now;
      handleRecordedPolls();
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
      if (!state.extensionEnabled || !state.blockRecordedPolls) {
        return;
      }

      // Check immediately and retry at intervals to catch React rendering frames
      pendingPollCheck = true;
      handleRecordedPolls();
      setTimeout(handleRecordedPolls, 50);
      setTimeout(handleRecordedPolls, 150);
      setTimeout(handleRecordedPolls, 300);
    },
    { capture: true, passive: true },
  );

  // Intercept focus returning to the poll icon right after automatic poll dismissal
  window.addEventListener(
    'focusin',
    (e: FocusEvent) => {
      // Only intervene if a poll was automatically dismissed within the last 800ms
      if (Date.now() - lastAutoDismissTime > 800) return;
      if (userOpenedPoll) return;
      if (isUserTyping()) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const pollBtn = target.closest<HTMLElement>(
        '#record-poll-icon, button[aria-label="Poll" i]',
      );
      if (pollBtn) {
        pollBtn.blur();
      }
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
  if (isHandlingPoll) return;
  isHandlingPoll = true;
  try {
    lastTimeupdateScan = Date.now();
    // If extension or blocker feature is disabled, ensure clean state and exit
    if (!state.extensionEnabled || !state.blockRecordedPolls) {
      if (userOpenedPoll) userOpenedPoll = false;
      clearPollSuppressionNow();
      syncPollSuppressionClass();
      return;
    }

    // Guard: Never touch polls in live streams
    const video = getActiveVideo();
    if (video && isLiveVideo(video)) {
      syncPollSuppressionClass();
      return;
    }

    // If user opened manually, check if a genuine poll drawer has now closed (and cooldown passed)
    if (userOpenedPoll) {
      const activeCloseBtn = findGenuinePollCloseButton();
      if (!activeCloseBtn && Date.now() - userOpenedTime > 1500) {
        userOpenedPoll = false;
      }
      syncPollSuppressionClass();
      if (userOpenedPoll) {
        return;
      }
    }

    syncPollSuppressionClass();

    // Locate a genuine poll drawer close button (strictly excludes Store/Modules, Chat, Doubts, Ask AI)
    const closeBtn = findGenuinePollCloseButton();
    if (!closeBtn) return;

    const drawer = resolvePollDrawerContainer(closeBtn);
    if (drawer && !isProtectedPlayerStructure(drawer)) {
      drawer.setAttribute('data-pwc-poll-suppressed', 'true');
    }

  // CSS rules handle instant zero-flicker suppression as long as #close-poll-wrapperIcon is present

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
      lastAutoDismissTime = Date.now();
      try {
        closeBtn.click();
      } catch {
        // Ignored
      }
      schedulePollButtonBlur();
    }
  }

  // If focus is still on the poll icon after an automatic dismissal, ensure poll button is blurred
  if (!userOpenedPoll && !isUserTyping()) {
    const active = document.activeElement;
    const pollBtn = document.querySelector<HTMLElement>(
      '#record-poll-icon, button[aria-label="Poll" i]',
    );
    if (active && pollBtn && (active === pollBtn || pollBtn.contains(active))) {
      pollBtn.blur();
    }
  }

  // Ensure PW's bottom player controls remain unhidden and interactive
  const footerControls = document.getElementById('player-footer-controls');
  if (footerControls) {
    footerControls.classList.remove('!hidden', 'sf-hidden');
    footerControls.style.removeProperty('display');
  }

  // Neutralize PW's "All controls are disabled during Poll!" blocking overlay visually via CSS
  // (We NEVER call .remove() on React-managed DOM elements to avoid React reconciliation crashes)

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
  } finally {
    isHandlingPoll = false;
  }
}