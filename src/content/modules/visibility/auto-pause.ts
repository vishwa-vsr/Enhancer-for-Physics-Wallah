import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { cancelSpaceHold } from '../shortcuts/space-hold';

let wasPausedByExtension = false;
let isInitialized = false;

export function initAutoPause(): void {
  if (isInitialized) return;
  isInitialized = true;

  document.addEventListener('visibilitychange', () => {
    const video = getActiveVideo();

    if (document.hidden) {
      if (state.autoPauseOnHide && video && !video.paused) {
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
      if (state.autoPauseOnHide && video && video.paused && wasPausedByExtension) {
        video.play().catch(() => {});
      }
      wasPausedByExtension = false;
    }
  });
}
