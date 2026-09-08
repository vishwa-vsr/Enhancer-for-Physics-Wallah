import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { cancelSpaceHold } from '../shortcuts/space-hold';
import { isFocusLockActive } from '../ui/focus-lock';

let wasPausedByExtension = false;
let isInitialized = false;

export function initAutoPause(): void {
  if (isInitialized) return;
  isInitialized = true;

  document.addEventListener('visibilitychange', () => {
    const video = getActiveVideo();

    if (document.hidden) {
      // Auto-pause on tab hide (user setting) and while a Focus Lock session
      // is running — leaving the lecture must pause playback immediately.
      if (
        (state.autoPauseOnHide || isFocusLockActive()) &&
        video &&
        !video.paused
      ) {
        try {
          video.pause();
        } catch (_e) {
          // Ignored: video already paused or interrupted
        }
        wasPausedByExtension = true;
      } else {
        wasPausedByExtension = false;
      }

      cancelSpaceHold();
    } else {
      // Focus Lock keeps playback paused on return: the Focus Lock reminder
      // modal lets the student consciously resume (or quit the session).
      if (
        state.autoPauseOnHide &&
        !isFocusLockActive() &&
        video &&
        video.paused &&
        wasPausedByExtension
      ) {
        video.play().catch(() => {});
      }
      wasPausedByExtension = false;
    }
  });
}
