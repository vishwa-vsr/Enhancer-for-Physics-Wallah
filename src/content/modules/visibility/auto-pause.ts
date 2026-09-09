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
      // Auto-pause on tab hide (user setting). If Focus Lock is running,
      // its own dedicated guard handles pausing and showing the reminder.
      if (
        state.autoPauseOnHide &&
        !isFocusLockActive() &&
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
      // Resume playback on return only for regular auto-pause
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
