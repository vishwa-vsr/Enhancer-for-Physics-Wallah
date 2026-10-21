import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { getOuterPlayerContainer } from '../distractions/elements';

let overlayElement: HTMLElement | null = null;
let iconWrapper: HTMLElement | null = null;
let barFill: HTMLElement | null = null;
let textLabel: HTMLElement | null = null;
let fadeTimeout: ReturnType<typeof setTimeout> | null = null;

const SVG_NS = 'http://www.w3.org/2000/svg';

// Physics Wallah native speaker path geometry (Heroicons solid speaker-wave)
const PW_SPEAKER_CONE_PATH =
  'M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06Z';

const PW_SPEAKER_INNER_WAVE_PATH =
  'M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z';

const PW_SPEAKER_OUTER_WAVE_PATH =
  'M18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z';

function createSvgElement(tag: string, attrs: Record<string, string>): SVGElement {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, val] of Object.entries(attrs)) {
    el.setAttribute(key, val);
  }
  return el;
}

function renderSpeakerIcon(container: HTMLElement, level: 'mute' | 'low' | 'med' | 'high'): void {
  container.textContent = '';
  const svg = createSvgElement('svg', {
    viewBox: '0 0 24 24',
    width: '20',
    height: '20',
    fill: 'currentColor',
    'aria-hidden': 'true',
  });

  // Solid speaker cone matching PW exactly
  const cone = createSvgElement('path', {
    d: PW_SPEAKER_CONE_PATH,
  });
  svg.appendChild(cone);

  if (level === 'mute') {
    // Crisp diagonal cross lines for mute
    const x1 = createSvgElement('line', {
      x1: '21',
      y1: '9',
      x2: '16',
      y2: '15',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
    });
    const x2 = createSvgElement('line', {
      x1: '16',
      y1: '9',
      x2: '21',
      y2: '15',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
    });
    svg.appendChild(x1);
    svg.appendChild(x2);
  } else if (level === 'low') {
    // Single wave
    const wave = createSvgElement('path', {
      d: PW_SPEAKER_INNER_WAVE_PATH,
    });
    svg.appendChild(wave);
  } else {
    // Medium and high: inner + outer wave
    const wave1 = createSvgElement('path', {
      d: PW_SPEAKER_INNER_WAVE_PATH,
    });
    const wave2 = createSvgElement('path', {
      d: PW_SPEAKER_OUTER_WAVE_PATH,
    });
    svg.appendChild(wave1);
    svg.appendChild(wave2);
  }

  container.appendChild(svg);
}

function ensureVolumeOverlay(parent: HTMLElement): HTMLElement {
  if (overlayElement && overlayElement.isConnected && overlayElement.parentElement === parent) {
    return overlayElement;
  }

  // Remove existing orphaned element if any
  const existing = parent.querySelector('#pwc-volume-overlay');
  if (existing) {
    existing.remove();
  }

  const overlay = document.createElement('div');
  overlay.id = 'pwc-volume-overlay';
  overlay.className = 'pwc-volume-overlay';

  const iconDiv = document.createElement('div');
  iconDiv.className = 'pwc-volume-icon-wrapper';
  overlay.appendChild(iconDiv);

  const barWrapper = document.createElement('div');
  barWrapper.className = 'pwc-volume-bar-wrapper';
  const fill = document.createElement('div');
  fill.className = 'pwc-volume-bar-fill';
  barWrapper.appendChild(fill);
  overlay.appendChild(barWrapper);

  const text = document.createElement('span');
  text.className = 'pwc-volume-text';
  overlay.appendChild(text);

  parent.appendChild(overlay);

  overlayElement = overlay;
  iconWrapper = iconDiv;
  barFill = fill;
  textLabel = text;

  return overlay;
}

export function showVolumeHud(volume: number, isMuted: boolean): void {
  if (!state.showVolumeBubble) {
    hideVolumeHudImmediately();
    return;
  }
  const video = getActiveVideo();
  if (!video) return;

  const parent = getOuterPlayerContainer() || video.parentElement;
  if (!parent) return;

  const overlay = ensureVolumeOverlay(parent);
  if (!iconWrapper || !barFill || !textLabel) return;

  const percent = isMuted ? 0 : Math.round(volume * 100);

  let level: 'mute' | 'low' | 'med' | 'high' = 'high';
  if (isMuted || percent === 0) {
    level = 'mute';
  } else if (percent < 33) {
    level = 'low';
  } else if (percent < 66) {
    level = 'med';
  }

  renderSpeakerIcon(iconWrapper, level);
  barFill.style.width = `${percent}%`;
  textLabel.textContent = isMuted ? 'Muted' : `${percent}%`;

  if (fadeTimeout) {
    clearTimeout(fadeTimeout);
  }

  overlay.classList.add('pwc-volume-visible');

  const delayMs = Math.max(150, Math.round((state.volumeBubbleDelay ?? 0.4) * 1000));
  fadeTimeout = setTimeout(() => {
    if (overlayElement) {
      overlayElement.classList.remove('pwc-volume-visible');
    }
  }, delayMs);
}

export function hideVolumeHudImmediately(): void {
  if (fadeTimeout) {
    clearTimeout(fadeTimeout);
    fadeTimeout = null;
  }
  if (overlayElement) {
    overlayElement.classList.remove('pwc-volume-visible');
  }
}
