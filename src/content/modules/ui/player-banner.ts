import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { getOuterPlayerContainer } from '../distractions/elements';

export type PlayerBannerIcon =
  | 'volume-mute'
  | 'volume-low'
  | 'volume-med'
  | 'volume-high'
  | 'skip-silence'
  | 'warning'
  | 'info'
  | 'none';

export interface PlayerBannerOptions {
  /** Optional stable identifier used to update or dismiss a specific banner. */
  key?: string;
  /** Visual icon rendered on the left of the banner. */
  icon?: PlayerBannerIcon;
  /** Text message or metric label (e.g. '65%', 'Focus Lock OFF'). */
  text: string;
  /** Optional 0–100 progress bar (used by Volume Scroll HUD). */
  progressPercent?: number;
  /** Auto-dismiss delay in ms. Ignored when sticky is true. Defaults to 1800ms. */
  durationMs?: number;
  /** Keep the banner visible until dismissed via hidePlayerBanner() or replaced by another sticky banner. */
  sticky?: boolean;
  /** Show a subtle × close button on the right to let the user dismiss the banner manually. */
  dismissible?: boolean;
  /** Optional callback fired when the user clicks the × close button. */
  onDismiss?: () => void;
  /** Optional click callback. Makes the banner an accessible clickable pill button. */
  onClick?: () => void;
  /** Accessible label override for clickable banners. */
  ariaLabel?: string;
  /** Allow falling back to fixed viewport placement when no player container exists yet. */
  allowPageFallback?: boolean;
}

const BANNER_ID = 'pwc-player-banner';
const SVG_NS = 'http://www.w3.org/2000/svg';
const DEFAULT_DURATION_MS = 1800;

// Physics Wallah native speaker path geometry (Heroicons solid speaker-wave)
const PW_SPEAKER_CONE_PATH =
  'M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06Z';
const PW_SPEAKER_INNER_WAVE_PATH =
  'M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z';
const PW_SPEAKER_OUTER_WAVE_PATH =
  'M18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z';

let bannerElement: HTMLElement | null = null;
let contentWrapper: HTMLElement | null = null;
let actionButton: HTMLButtonElement | null = null;
let closeButton: HTMLButtonElement | null = null;
let iconWrapper: HTMLElement | null = null;
let barWrapper: HTMLElement | null = null;
let barFill: HTMLElement | null = null;
let textLabel: HTMLElement | null = null;

let hideTimeout: ReturnType<typeof setTimeout> | null = null;
let activeBannerKey: string | null = null;
let activeStickyBanner: PlayerBannerOptions | null = null;
let currentOnClick: (() => void) | null = null;
let currentOnDismiss: (() => void) | null = null;
let lastRenderedIcon: PlayerBannerIcon | null = null;

function createSvgElement(tag: string, attrs: Record<string, string>): SVGElement {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, val] of Object.entries(attrs)) {
    el.setAttribute(key, val);
  }
  return el;
}

function renderSpeakerSvg(level: 'mute' | 'low' | 'med' | 'high'): SVGElement {
  const svg = createSvgElement('svg', {
    viewBox: '0 0 24 24',
    width: '20',
    height: '20',
    fill: 'currentColor',
    'aria-hidden': 'true',
  });

  svg.appendChild(createSvgElement('path', { d: PW_SPEAKER_CONE_PATH }));

  if (level === 'mute') {
    svg.appendChild(
      createSvgElement('line', {
        x1: '21',
        y1: '9',
        x2: '16',
        y2: '15',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
      }),
    );
    svg.appendChild(
      createSvgElement('line', {
        x1: '16',
        y1: '9',
        x2: '21',
        y2: '15',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
      }),
    );
  } else if (level === 'low') {
    svg.appendChild(createSvgElement('path', { d: PW_SPEAKER_INNER_WAVE_PATH }));
  } else {
    svg.appendChild(createSvgElement('path', { d: PW_SPEAKER_INNER_WAVE_PATH }));
    svg.appendChild(createSvgElement('path', { d: PW_SPEAKER_OUTER_WAVE_PATH }));
  }

  return svg;
}

function renderCloseSvg(): SVGElement {
  const svg = createSvgElement('svg', {
    viewBox: '0 0 24 24',
    width: '14',
    height: '14',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2.3',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
  });

  svg.appendChild(createSvgElement('line', { x1: '18', y1: '6', x2: '6', y2: '18' }));
  svg.appendChild(createSvgElement('line', { x1: '6', y1: '6', x2: '18', y2: '18' }));

  return svg;
}

function renderSkipSilenceSvg(): SVGElement {
  const svg = createSvgElement('svg', {
    viewBox: '0 0 24 24',
    width: '18',
    height: '18',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2.1',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
  });

  svg.appendChild(createSvgElement('line', { x1: '3', y1: '10', x2: '3', y2: '14' }));
  svg.appendChild(createSvgElement('line', { x1: '7', y1: '6', x2: '7', y2: '18' }));
  svg.appendChild(createSvgElement('line', { x1: '11', y1: '3', x2: '11', y2: '21' }));
  svg.appendChild(createSvgElement('polyline', { points: '15 8 19 12 15 16' }));
  svg.appendChild(createSvgElement('line', { x1: '21', y1: '8', x2: '21', y2: '16' }));

  return svg;
}

function renderWarningSvg(): SVGElement {
  const svg = createSvgElement('svg', {
    viewBox: '0 0 24 24',
    width: '18',
    height: '18',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2.1',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
  });

  svg.appendChild(
    createSvgElement('path', {
      d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
    }),
  );
  svg.appendChild(createSvgElement('line', { x1: '12', y1: '9', x2: '12', y2: '13' }));
  svg.appendChild(
    createSvgElement('circle', {
      cx: '12',
      cy: '17',
      r: '0.6',
      fill: 'currentColor',
    }),
  );

  return svg;
}

function renderInfoSvg(): SVGElement {
  const svg = createSvgElement('svg', {
    viewBox: '0 0 24 24',
    width: '18',
    height: '18',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2.1',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
  });

  svg.appendChild(createSvgElement('circle', { cx: '12', cy: '12', r: '9' }));
  svg.appendChild(createSvgElement('line', { x1: '12', y1: '16', x2: '12', y2: '12' }));
  svg.appendChild(
    createSvgElement('circle', {
      cx: '12',
      cy: '8.5',
      r: '0.6',
      fill: 'currentColor',
    }),
  );

  return svg;
}

function renderBannerIcon(container: HTMLElement, icon: PlayerBannerIcon): void {
  if (icon === 'none') {
    container.hidden = true;
    if (lastRenderedIcon !== 'none') {
      container.textContent = '';
      lastRenderedIcon = 'none';
    }
    return;
  }

  container.hidden = false;
  container.className = 'pwc-player-banner-icon';
  if (icon === 'warning') {
    container.classList.add('pwc-banner-icon-warning');
  } else if (icon === 'skip-silence' || icon === 'info') {
    container.classList.add('pwc-banner-icon-accent');
  }

  if (lastRenderedIcon === icon && container.childElementCount > 0) {
    return;
  }

  container.textContent = '';
  lastRenderedIcon = icon;

  switch (icon) {
    case 'volume-mute':
      container.appendChild(renderSpeakerSvg('mute'));
      break;
    case 'volume-low':
      container.appendChild(renderSpeakerSvg('low'));
      break;
    case 'volume-med':
      container.appendChild(renderSpeakerSvg('med'));
      break;
    case 'volume-high':
      container.appendChild(renderSpeakerSvg('high'));
      break;
    case 'skip-silence':
      container.appendChild(renderSkipSilenceSvg());
      break;
    case 'warning':
      container.appendChild(renderWarningSvg());
      break;
    case 'info':
      container.appendChild(renderInfoSvg());
      break;
  }
}

function resolveBannerMount(allowPageFallback: boolean): {
  parent: HTMLElement;
  isFixed: boolean;
} | null {
  if (document.fullscreenElement instanceof HTMLElement) {
    if (
      document.fullscreenElement.tagName === 'VIDEO' &&
      document.fullscreenElement.parentElement
    ) {
      return { parent: document.fullscreenElement.parentElement, isFixed: false };
    }
    return { parent: document.fullscreenElement, isFixed: false };
  }

  const video = getActiveVideo();
  const playerContainer = getOuterPlayerContainer() || video?.parentElement || null;
  if (playerContainer) {
    return { parent: playerContainer, isFixed: false };
  }

  if (allowPageFallback && document.body) {
    return { parent: document.body, isFixed: true };
  }

  return null;
}

function ensureBannerElement(allowPageFallback: boolean): HTMLElement | null {
  const mount = resolveBannerMount(allowPageFallback);
  if (!mount) return null;

  const { parent, isFixed } = mount;

  if (bannerElement && bannerElement.isConnected) {
    if (bannerElement.parentElement !== parent) {
      parent.appendChild(bannerElement);
    }
    bannerElement.classList.toggle('pwc-banner-fixed', isFixed);
    return bannerElement;
  }

  const existing = document.getElementById(BANNER_ID);
  if (existing) {
    existing.remove();
  }

  const banner = document.createElement('div');
  banner.id = BANNER_ID;
  banner.className = 'pwc-player-banner';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.classList.toggle('pwc-banner-fixed', isFixed);

  const wrapper = document.createElement('div');
  wrapper.className = 'pwc-player-banner-content';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pwc-player-banner-btn';
  btn.hidden = true;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'pwc-player-banner-close';
  closeBtn.setAttribute('aria-label', 'Dismiss banner');
  closeBtn.setAttribute('title', 'Dismiss');
  closeBtn.hidden = true;
  closeBtn.appendChild(renderCloseSvg());

  // Prevent mouse clicks from stealing Spacebar focus from the video player,
  // and prevent clicks on the banner from toggling play/pause underneath.
  const stopBubble = (e: Event) => {
    e.stopPropagation();
  };
  const preventSteal = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  btn.addEventListener('pointerdown', stopBubble);
  btn.addEventListener('mousedown', preventSteal);
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.detail > 0) {
      btn.blur();
    }
    currentOnClick?.();
  });

  closeBtn.addEventListener('pointerdown', stopBubble);
  closeBtn.addEventListener('mousedown', preventSteal);
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.detail > 0) {
      closeBtn.blur();
    }
    const dismissCb = currentOnDismiss;
    hidePlayerBanner(activeBannerKey ?? undefined);
    dismissCb?.();
  });

  const icon = document.createElement('div');
  icon.className = 'pwc-player-banner-icon';

  const barWrap = document.createElement('div');
  barWrap.className = 'pwc-player-banner-bar';
  barWrap.hidden = true;
  const fill = document.createElement('div');
  fill.className = 'pwc-player-banner-bar-fill';
  barWrap.appendChild(fill);

  const text = document.createElement('span');
  text.className = 'pwc-player-banner-text';

  wrapper.appendChild(icon);
  wrapper.appendChild(barWrap);
  wrapper.appendChild(text);

  banner.appendChild(wrapper);
  banner.appendChild(btn);
  banner.appendChild(closeBtn);
  parent.appendChild(banner);

  bannerElement = banner;
  contentWrapper = wrapper;
  actionButton = btn;
  closeButton = closeBtn;
  iconWrapper = icon;
  barWrapper = barWrap;
  barFill = fill;
  textLabel = text;
  lastRenderedIcon = null;

  return banner;
}

function renderBannerContent(options: PlayerBannerOptions): HTMLElement | null {
  const banner = ensureBannerElement(Boolean(options.allowPageFallback));
  if (
    !banner ||
    !contentWrapper ||
    !actionButton ||
    !closeButton ||
    !iconWrapper ||
    !barWrapper ||
    !barFill ||
    !textLabel
  ) {
    return null;
  }

  const wasVisible = banner.classList.contains('pwc-banner-visible');
  const hasProgress = typeof options.progressPercent === 'number';
  const isClickable = typeof options.onClick === 'function';
  const isDismissible = Boolean(options.dismissible);

  currentOnClick = options.onClick ?? null;
  currentOnDismiss = options.onDismiss ?? null;

  // Move inner nodes into the native <button> when clickable, or back into the static <div> otherwise
  const targetHost = isClickable ? actionButton : contentWrapper;
  if (iconWrapper.parentElement !== targetHost) {
    targetHost.appendChild(iconWrapper);
    targetHost.appendChild(barWrapper);
    targetHost.appendChild(textLabel);
  }

  actionButton.hidden = !isClickable;
  contentWrapper.hidden = isClickable;
  closeButton.hidden = !isDismissible;
  if (isClickable) {
    actionButton.setAttribute('aria-label', options.ariaLabel || options.text);
  } else {
    actionButton.removeAttribute('aria-label');
  }

  banner.classList.toggle('pwc-banner-clickable', isClickable);
  banner.classList.toggle('pwc-banner-dismissible', isDismissible);
  banner.classList.toggle('pwc-banner-has-progress', hasProgress);

  renderBannerIcon(iconWrapper, options.icon ?? 'none');

  if (hasProgress) {
    const clamped = Math.max(0, Math.min(100, Math.round(options.progressPercent!)));
    barWrapper.hidden = false;
    barFill.style.width = `${clamped}%`;
  } else {
    barWrapper.hidden = true;
    barFill.style.width = '0%';
  }

  textLabel.textContent = options.text;

  if (!wasVisible) {
    // Trigger reflow only when transitioning from hidden -> visible so scroll updates never flicker
    void banner.offsetHeight;
    banner.classList.add('pwc-banner-visible');
  }

  return banner;
}

function clearHideTimeout(): void {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

function dismissVisibleBanner(): void {
  clearHideTimeout();
  currentOnClick = null;
  currentOnDismiss = null;
  activeBannerKey = null;
  if (bannerElement) {
    bannerElement.classList.remove('pwc-banner-visible');
    bannerElement.classList.remove('pwc-banner-clickable');
    bannerElement.classList.remove('pwc-banner-dismissible');
  }
}

/**
 * Show the shared top-center in-player banner (Volume Scroll, Focus Lock, Skip Silence, etc.).
 * Enforces single-slot visibility: temporary banners replace each other, and temporarily pause
 * any active sticky banner (restoring it once the temporary banner finishes).
 */
export function showPlayerBanner(options: PlayerBannerOptions): void {
  clearHideTimeout();

  const bannerKey = options.key ?? null;

  if (options.sticky) {
    activeStickyBanner = { ...options };
    activeBannerKey = bannerKey;
    renderBannerContent(options);
    return;
  }

  activeBannerKey = bannerKey;
  const rendered = renderBannerContent(options);
  if (!rendered) return;

  const delayMs = Math.max(150, Math.round(options.durationMs ?? DEFAULT_DURATION_MS));
  hideTimeout = setTimeout(() => {
    hideTimeout = null;
    if (activeStickyBanner) {
      activeBannerKey = activeStickyBanner.key ?? null;
      renderBannerContent(activeStickyBanner);
    } else {
      dismissVisibleBanner();
    }
  }, delayMs);
}

/**
 * Dismiss an active or saved sticky banner.
 * If `key` is provided, only dismisses banners matching that key (and restores any saved
 * sticky banner if a temporary banner was dismissed early).
 */
export function hidePlayerBanner(key?: string): void {
  if (!key) {
    activeStickyBanner = null;
    dismissVisibleBanner();
    return;
  }

  if (activeStickyBanner?.key === key) {
    activeStickyBanner = null;
  }

  if (activeBannerKey === key) {
    clearHideTimeout();
    if (activeStickyBanner && activeStickyBanner.key !== key) {
      activeBannerKey = activeStickyBanner.key ?? null;
      renderBannerContent(activeStickyBanner);
    } else {
      dismissVisibleBanner();
    }
  }
}

/**
 * Display a snappy in-player feedback pill when a keyboard shortcut triggers
 * (e.g. '1.5x', '1.0x Normal', 'Fullscreen', 'Live Chat').
 * Respects state.showShortcutAlerts and auto-dismisses after 1800ms.
 */
export function showShortcutBanner(text: string): void {
  if (!state.showShortcutAlerts) return;
  showPlayerBanner({
    key: 'shortcut-alert',
    text,
    durationMs: DEFAULT_DURATION_MS,
    icon: 'none',
  });
}
