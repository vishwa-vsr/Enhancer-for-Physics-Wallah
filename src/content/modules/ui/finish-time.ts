import { state } from '../../state';
import { getActiveVideo, getCachedVideo } from '../video/detector';
import { findPWToolbar } from '../distractions/elements';

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
  if (!video || !isFinite(video.duration) || video.duration <= 0) {
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
    const iconEl = badge.querySelector<HTMLElement>('.pwc-finish-icon');
    const prefixEl = badge.querySelector<HTMLElement>('.pwc-finish-prefix');
    const clockEl = badge.querySelector<HTMLElement>('.pwc-finish-clock');
    const leftEl = badge.querySelector<HTMLElement>('.pwc-finish-left');

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

  const toolbar = findPWToolbar();
  if (!toolbar) return;

  let badge = document.getElementById('pwc-finish-time-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'pwc-finish-time-badge';
    badge.className = 'pwc-finish-time-badge';

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
    if (speedCtrl && speedCtrl.nextSibling) {
      toolbar.insertBefore(badge, speedCtrl.nextSibling);
    } else if (toolbar.firstChild) {
      toolbar.insertBefore(badge, toolbar.firstChild);
    } else {
      toolbar.appendChild(badge);
    }
  }
  updateFinishTime();
}
