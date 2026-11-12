import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { getOuterPlayerContainer, preventFocusSteal } from '../distractions/elements';
import { syncAutoHide, syncAutoHideBossClass } from './autohide';
import { findControlsToolbar } from './toast';

const COLLAPSED_CLASS = 'pwc-collapsed-state';
const POST_CLICK_GRACE_MS = 400;
const JITTER_TOLERANCE_PX = 3;
const JITTER_TOLERANCE_SQ = JITTER_TOLERANCE_PX * JITTER_TOLERANCE_PX;

let lastCollapsedTime = 0;
let pointerAnchorX = 0;
let pointerAnchorY = 0;
let hasPointerAnchor = false;
let collapsedContainer: HTMLElement | null = null;
let isWakeListenersBound = false;
let isLifecycleBound = false;

function isEventInsidePlayerContainer(e: Event, player: HTMLElement): boolean {
  const target = e.target;
  if (target instanceof Node && player.contains(target)) {
    return true;
  }
  if (typeof e.composedPath === 'function') {
    return e.composedPath().includes(player);
  }
  return false;
}

function setPointerAnchor(x: number, y: number): void {
  pointerAnchorX = x;
  pointerAnchorY = y;
  hasPointerAnchor = true;
}

function onPlayerAnchorDown(e: MouseEvent): void {
  if (e.isTrusted || e.clientX !== 0 || e.clientY !== 0) {
    setPointerAnchor(e.clientX, e.clientY);
  }
}

function unbindWakeListeners(): void {
  if (!isWakeListenersBound) return;
  isWakeListenersBound = false;
  document.removeEventListener('pointerdown', onPlayerAnchorDown, true);
  document.removeEventListener('mousedown', onPlayerAnchorDown, true);
  document.removeEventListener('mousemove', onPlayerMouseMove);
  document.removeEventListener('touchstart', onPlayerTouchStart);
  document.removeEventListener('keydown', onCaptureEscape, true);
}

function exitCollapsedState(): void {
  unbindWakeListeners();
  collapsedContainer = null;
  hasPointerAnchor = false;
  pointerAnchorX = 0;
  pointerAnchorY = 0;

  document.documentElement.classList.remove(COLLAPSED_CLASS);
  document.querySelectorAll(`.${COLLAPSED_CLASS}`).forEach((el) => {
    el.classList.remove(COLLAPSED_CLASS);
  });

  syncAutoHide();
}

function onPlayerMouseMove(e: MouseEvent): void {
  if (Date.now() - lastCollapsedTime < POST_CLICK_GRACE_MS) {
    if (e.isTrusted || e.clientX !== 0 || e.clientY !== 0) {
      setPointerAnchor(e.clientX, e.clientY);
    }
    return;
  }

  // Ignore stationary/micro-jitter (<= 3px) around the click/idle anchor regardless of click duration
  if (hasPointerAnchor) {
    const dx = e.clientX - pointerAnchorX;
    const dy = e.clientY - pointerAnchorY;
    if (dx * dx + dy * dy <= JITTER_TOLERANCE_SQ) {
      return;
    }
  } else if (e.isTrusted) {
    setPointerAnchor(e.clientX, e.clientY);
    return;
  }

  const activePlayer =
    collapsedContainer && collapsedContainer.isConnected
      ? collapsedContainer
      : getOuterPlayerContainer();
  if (!activePlayer) {
    exitCollapsedState();
    return;
  }
  if (!isEventInsidePlayerContainer(e, activePlayer)) {
    return;
  }
  exitCollapsedState();
}

function onPlayerTouchStart(): void {
  exitCollapsedState();
}

function onCaptureEscape(e: KeyboardEvent): void {
  if (e.key !== 'Escape') return;
  const hasCollapsed =
    Boolean(collapsedContainer?.classList.contains(COLLAPSED_CLASS)) ||
    Boolean(document.querySelector(`.${COLLAPSED_CLASS}`));
  if (!hasCollapsed) {
    unbindWakeListeners();
    return;
  }
  exitCollapsedState();
}

function bindWakeListeners(): void {
  if (isWakeListenersBound) return;
  isWakeListenersBound = true;
  document.addEventListener('pointerdown', onPlayerAnchorDown, { capture: true, passive: true });
  document.addEventListener('mousedown', onPlayerAnchorDown, { capture: true, passive: true });
  document.addEventListener('mousemove', onPlayerMouseMove, { passive: true });
  document.addEventListener('touchstart', onPlayerTouchStart, { passive: true });
  document.addEventListener('keydown', onCaptureEscape, true);
}

function ensureLifecycleCleanupBound(): void {
  if (isLifecycleBound || typeof window === 'undefined') return;
  isLifecycleBound = true;
  window.addEventListener('pagehide', exitCollapsedState, { passive: true });
}

function enterCollapsedState(anchorX = 0, anchorY = 0): void {
  const player = getOuterPlayerContainer();
  if (!player || player === document.body || player === document.documentElement) return;

  document.documentElement.classList.remove(COLLAPSED_CLASS);
  document.querySelectorAll(`.${COLLAPSED_CLASS}`).forEach((el) => {
    if (el !== player) {
      el.classList.remove(COLLAPSED_CLASS);
    }
  });

  player.classList.add(COLLAPSED_CLASS);
  collapsedContainer = player;
  lastCollapsedTime = Date.now();
  if (anchorX !== 0 || anchorY !== 0) {
    setPointerAnchor(anchorX, anchorY);
  } else {
    hasPointerAnchor = false;
  }
  syncAutoHideBossClass();
  ensureLifecycleCleanupBound();
  bindWakeListeners();
}

function createInstantHideButton(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.id = 'pwc-instant-hide-btn';
  btn.className = 'pwc-instant-hide-btn';
  btn.type = 'button';
  preventFocusSteal(btn);
  btn.setAttribute('title', 'Instant Focus Mode (Hide controls & cursor)');
  btn.setAttribute('aria-label', 'Instant Focus Mode');

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.3');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  const polyline = document.createElementNS(svgNS, 'polyline');
  polyline.setAttribute('points', '6 9 12 15 18 9');
  svg.appendChild(polyline);
  btn.appendChild(svg);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    btn.blur();
    enterCollapsedState(e.clientX, e.clientY);
  });

  return btn;
}

function resolveInstantHidePlacement(): { parent: Element; anchor: Element | null } | null {
  const outer = getOuterPlayerContainer();
  const footerLeft =
    outer?.querySelector('#footer-left-section') || document.getElementById('footer-left-section');
  if (footerLeft?.parentElement) {
    return { parent: footerLeft.parentElement, anchor: footerLeft };
  }

  const footerRight =
    outer?.querySelector('#footer-right-section') || document.getElementById('footer-right-section');
  if (footerRight?.parentElement) {
    const parent = footerRight.parentElement;
    return {
      parent,
      anchor: parent.firstElementChild?.id === 'pwc-instant-hide-btn' ? parent.firstElementChild.nextElementSibling : parent.firstElementChild,
    };
  }

  const video = getActiveVideo();
  const vjsBar =
    outer?.querySelector('.vjs-control-bar') ||
    video?.closest('.video-js')?.querySelector('.vjs-control-bar') ||
    document.querySelector('.vjs-control-bar');
  if (vjsBar) {
    const playBtn = vjsBar.querySelector('.vjs-play-control');
    const first = vjsBar.firstElementChild;
    return {
      parent: vjsBar,
      anchor: playBtn || (first?.id === 'pwc-instant-hide-btn' ? first.nextElementSibling : first),
    };
  }

  const toolbar = findControlsToolbar();
  if (toolbar) {
    const first = toolbar.firstElementChild;
    return {
      parent: toolbar,
      anchor: first?.id === 'pwc-instant-hide-btn' ? first.nextElementSibling : first,
    };
  }

  return null;
}

export function isInstantHideButtonHealthy(): boolean {
  const btn = document.getElementById('pwc-instant-hide-btn');
  if (!btn || !btn.isConnected) return false;
  const placement = resolveInstantHidePlacement();
  if (!placement || btn.parentElement !== placement.parent) return false;
  if (placement.anchor) {
    return btn.nextElementSibling === placement.anchor;
  }
  return true;
}

// Inject and manage the arrow hide button on the left side right before Play/Pause
export function injectInstantHideButton(): void {
  const exactBtn = document.getElementById('pwc-instant-hide-btn') as HTMLElement | null;

  // If disabled, remove the button and clean up collapsed state + listeners
  if (!state.extensionEnabled || !state.enableInstantHide) {
    if (exactBtn) {
      exactBtn.remove();
    }
    exitCollapsedState();
    return;
  }

  ensureLifecycleCleanupBound();

  const video = getActiveVideo();
  const placement = resolveInstantHidePlacement();
  if ((!video && !placement) || !placement) return;

  const { parent, anchor } = placement;
  const btn = exactBtn || createInstantHideButton();

  if (btn.parentElement === parent && (!anchor || btn.nextElementSibling === anchor)) {
    return;
  }

  if (anchor && anchor.parentElement === parent) {
    parent.insertBefore(btn, anchor);
  } else if (parent.firstChild) {
    parent.insertBefore(btn, parent.firstChild);
  } else {
    parent.appendChild(btn);
  }
}
