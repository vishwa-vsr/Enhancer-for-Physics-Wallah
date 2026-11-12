import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { hidePlayerBanner, PlayerBannerIcon, showPlayerBanner } from './player-banner';

const VOLUME_BANNER_KEY = 'volume-hud';

export function showVolumeHud(volume: number, isMuted: boolean): void {
  if (!state.showVolumeBubble) {
    hideVolumeHudImmediately();
    return;
  }
  const video = getActiveVideo();
  if (!video) return;

  const percent = isMuted ? 0 : Math.round(volume * 100);

  let icon: PlayerBannerIcon = 'volume-high';
  if (isMuted || percent === 0) {
    icon = 'volume-mute';
  } else if (percent < 33) {
    icon = 'volume-low';
  } else if (percent < 66) {
    icon = 'volume-med';
  }

  const delayMs = Math.max(150, Math.round((state.volumeBubbleDelay ?? 0.4) * 1000));

  showPlayerBanner({
    key: VOLUME_BANNER_KEY,
    icon,
    text: isMuted ? 'Muted' : `${percent}%`,
    progressPercent: percent,
    durationMs: delayMs,
  });
}

export function hideVolumeHudImmediately(): void {
  hidePlayerBanner(VOLUME_BANNER_KEY);
}
