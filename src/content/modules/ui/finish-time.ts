import { state } from '../../state';
import { getActiveVideo, getCachedVideo } from '../video/detector';
import { findPWToolbar, isInsidePreferredToolbar } from '../distractions/elements';

// Helper to detect if the active video is a live stream
export function isLiveVideo(video: HTMLVideoElement): boolean {
  if (video.duration === Infinity) return true;

  const player = video.closest('.video-js, [class*="video-player" i], #video-player-container');
  if (player) {
    if (
      player.classList.contains('vjs-live') ||
      player.classList.contains('vjs-liveui') ||
      player.querySelector('.vjs-live-display, .vjs-live-control') !== null
    ) {
      return true;
    }
  }

  const liveBadge = document.querySelector(
    '.player-header [class*="live" i], .video-player-app [class*="live" i], [class*="live-tag" i], [class*="live-badge" i], [class*="live-indicator" i]',
  );
  if (liveBadge && (liveBadge.textContent || '').trim().toUpperCase().includes('LIVE')) {
    return true;
  }

  return false;
}

// Calculate how many seconds behind the live edge the student currently is
export function getLiveStreamLag(video: HTMLVideoElement): number | null {
  try {
    if (video.seekable && video.seekable.length > 0) {
      const liveEnd = video.seekable.end(video.seekable.length - 1);
      const curr = video.currentTime;
      if (isFinite(liveEnd) && liveEnd > 0) {
        return Math.max(0, liveEnd - curr);
      }
    }
  } catch (_e) {
    // Ignore seekable read errors
  }

  if (isFinite(video.duration) && video.duration > 0) {
    return Math.max(0, video.duration - video.currentTime);
  }

  return null;
}

// Check if PW has a visible "Go Live" button on screen
export function hasGoLiveButton(): boolean {
  const candidates = document.querySelectorAll(
    'button, [role="button"], div.vjs-live-control, [class*="live" i]',
  );
  for (let i = 0; i < candidates.length; i++) {
    const text = (candidates[i].textContent || '').trim().toLowerCase();
    if (text === 'go live' || text.startsWith('go live')) {
      return true;
    }
  }
  return false;
}

function formatLagTime(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins <= 0) return '<1m';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Update dynamic lecture finish time badge
export function updateFinishTime(): void {
  const badges = document.querySelectorAll<HTMLElement>('#pwc-finish-time-badge');
  if (!badges || badges.length === 0) return;

  if (!state.extensionEnabled || !state.showFinishTime) {
    badges.forEach((b) => {
      b.style.display = 'none';
    });
    return;
  }

  const video = getCachedVideo() || getActiveVideo();
  if (!video) {
    badges.forEach((b) => {
      b.style.display = 'none';
    });
    return;
  }

  const isLive = isLiveVideo(video);

  if (isLive) {
    const hasGoLive = hasGoLiveButton();
    const lagSec = getLiveStreamLag(video);
    const isBehind = hasGoLive || (lagSec !== null && lagSec > 25);

    let liveText = 'Live Class';
    if (isBehind) {
      if (lagSec !== null && lagSec > 25) {
        liveText = `Behind Live (-${formatLagTime(lagSec)})`;
      } else {
        liveText = 'Behind Live';
      }
    }

    badges.forEach((badge) => {
      badge.style.display = 'inline-flex';
      badge.classList.add('pwc-finish-live');
      badge.classList.toggle('pwc-finish-behind-live', isBehind);
      const iconEl = badge.querySelector<HTMLElement>('.pwc-finish-icon');
      const dotEl = badge.querySelector<HTMLElement>('.pwc-finish-live-dot');
      const prefixEl = badge.querySelector<HTMLElement>('.pwc-finish-prefix');
      const clockEl = badge.querySelector<HTMLElement>('.pwc-finish-clock');
      const leftEl = badge.querySelector<HTMLElement>('.pwc-finish-left');

      if (iconEl) iconEl.style.display = 'none';
      if (dotEl) dotEl.style.display = 'none';
      if (prefixEl && prefixEl.textContent !== liveText) prefixEl.textContent = liveText;
      if (clockEl && clockEl.textContent !== '') clockEl.textContent = '';
      if (leftEl && leftEl.textContent !== '') leftEl.textContent = '';
    });
    return;
  }

  if (!isFinite(video.duration) || video.duration <= 0) {
    badges.forEach((b) => {
      b.style.display = 'none';
    });
    return;
  }

  const remainingSec = Math.max(0, video.duration - (video.currentTime || 0));
  if (remainingSec <= 0.5) {
    badges.forEach((b) => {
      b.style.display = 'none';
    });
    return;
  }

  const speed =
    state.extensionEnabled && state.currentSpeed > 0
      ? state.currentSpeed
      : video.playbackRate || 1.0;
  const adjustedSec = remainingSec / speed;
  const finishDate = new Date(Date.now() + adjustedSec * 1000);

  let hours = finishDate.getHours();
  const minutes = finishDate.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const clockStr = `${hours}:${minutes} ${ampm}`;

  const totalRemMinutes = Math.round(adjustedSec / 60);
  let remStr = '';
  if (totalRemMinutes < 60) {
    remStr = `${totalRemMinutes}m`;
  } else {
    const remH = Math.floor(totalRemMinutes / 60);
    const remM = totalRemMinutes % 60;
    remStr = remM > 0 ? `${remH}h ${remM}m` : `${remH}h`;
  }

  let prefix = 'Ends at ';
  let clock = clockStr;
  let left = ` • ${remStr} left`;
  let showIcon = true;

  if (state.finishTimeFormat === 'minimal') {
    prefix = '';
    clock = clockStr;
    left = '';
    showIcon = false;
  } else if (state.finishTimeFormat === 'clock') {
    prefix = 'Ends at ';
    clock = clockStr;
    left = '';
    showIcon = true;
  } else {
    prefix = 'Ends at ';
    clock = clockStr;
    left = ` • ${remStr} left`;
    showIcon = true;
  }

  badges.forEach((badge) => {
    badge.style.display = 'inline-flex';
    badge.classList.remove('pwc-finish-live');
    badge.classList.remove('pwc-finish-behind-live');
    const iconEl = badge.querySelector<HTMLElement>('.pwc-finish-icon');
    const dotEl = badge.querySelector<HTMLElement>('.pwc-finish-live-dot');
    const prefixEl = badge.querySelector<HTMLElement>('.pwc-finish-prefix');
    const clockEl = badge.querySelector<HTMLElement>('.pwc-finish-clock');
    const leftEl = badge.querySelector<HTMLElement>('.pwc-finish-left');

    if (dotEl) dotEl.style.display = 'none';
    if (iconEl) iconEl.style.display = showIcon ? 'inline-block' : 'none';
    if (prefixEl && prefixEl.textContent !== prefix) prefixEl.textContent = prefix;
    if (clockEl && clockEl.textContent !== clock) clockEl.textContent = clock;
    if (leftEl && leftEl.textContent !== left) leftEl.textContent = left;
  });
}

// Inject finish time badge into player toolbar
export function injectFinishTimeBadge(): void {
  if (!state.extensionEnabled || !state.showFinishTime) {
    const existing = document.getElementById('pwc-finish-time-badge');
    if (existing) existing.remove();
    return;
  }

  let badge = document.getElementById('pwc-finish-time-badge');
  if (badge && isInsidePreferredToolbar(badge)) {
    updateFinishTime();
    return;
  }
  if (badge) {
    badge.remove();
    badge = null;
  }

  const toolbar = findPWToolbar();
  if (!toolbar) return;

  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'pwc-finish-time-badge';
    badge.className = 'pwc-finish-time-badge';

    const dotSpan = document.createElement('span');
    dotSpan.className = 'pwc-finish-live-dot';
    badge.appendChild(dotSpan);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.classList.add('pwc-finish-icon');

    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '10');
    svg.appendChild(circle);

    const poly = document.createElementNS(svgNS, 'polyline');
    poly.setAttribute('points', '12 6 12 12 16 14');
    svg.appendChild(poly);

    badge.appendChild(svg);

    const prefixSpan = document.createElement('span');
    prefixSpan.className = 'pwc-finish-prefix';
    badge.appendChild(prefixSpan);

    const clockSpan = document.createElement('span');
    clockSpan.className = 'pwc-finish-clock';
    badge.appendChild(clockSpan);

    const leftSpan = document.createElement('span');
    leftSpan.className = 'pwc-finish-left';
    badge.appendChild(leftSpan);

    const speedCtrl = toolbar.querySelector('#pwc-speed-control');
    if (speedCtrl) {
      toolbar.insertBefore(badge, speedCtrl);
    } else if (toolbar.firstChild) {
      toolbar.insertBefore(badge, toolbar.firstChild);
    } else {
      toolbar.appendChild(badge);
    }
  }
  updateFinishTime();
}
