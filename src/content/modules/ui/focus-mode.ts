import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { getOuterPlayerContainer, preventFocusSteal } from '../distractions/elements';
import { syncAutoHide, syncAutoHideBossClass } from './autohide';
import {
  findControlsToolbar,
  isInsideControlsTray,
  placeControlInTray,
  removeControlsTrayIfEmpty,
} from './toast';

const COLLAPSED_CLASS = 'pwc-collapsed-state';
const POST_CLICK_GRACE_MS = 400;

let lastCollapsedTime = 0;
let lastPointerDownTime = 0;
let lastPointerDownX = -1;
let lastPointerDownY = -1;
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

function onPlayerPointerDown(e: PointerEvent): void {
  lastPointerDownTime = Date.now();
  lastPointerDownX = e.clientX;
  lastPointerDownY = e.clientY;
}

function unbindWakeListeners(): void {
  if (!isWakeListenersBound) return;
  isWakeListenersBound = false;
  document.removeEventListener('pointerdown', onPlayerPointerDown, true);
  document.removeEventListener('mousemove', onPlayerMouseMove);
  document.removeEventListener('touchstart', onPlayerTouchStart);
  document.removeEventListener('keydown', onCaptureEscape, true);
}

function exitCollapsedState(): void {
  unbindWakeListeners();
  collapsedContainer = null;

  document.documentElement.classList.remove(COLLAPSED_CLASS);
  document.querySelectorAll(`.${COLLAPSED_CLASS}`).forEach((el) => {
    el.classList.remove(COLLAPSED_CLASS);
  });

  syncAutoHide();
}

function onPlayerMouseMove(e: MouseEvent): void {
  if (Date.now() - lastCollapsedTime < POST_CLICK_GRACE_MS) {
    return;
  }
  // Ignore stationary/micro-jitter mousemove emitted by a click-to-pause action
  if (
    Date.now() - lastPointerDownTime < 120 &&
    Math.abs(e.clientX - lastPointerDownX) <= 1 &&
    Math.abs(e.clientY - lastPointerDownY) <= 1
  ) {
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
  document.addEventListener('pointerdown', onPlayerPointerDown, { capture: true, passive: true });
  document.addEventListener('mousemove', onPlayerMouseMove, { passive: true });
  document.addEventListener('touchstart', onPlayerTouchStart, { passive: true });
  document.addEventListener('keydown', onCaptureEscape, true);
}

function ensureLifecycleCleanupBound(): void {
  if (isLifecycleBound || typeof window === 'undefined') return;
  isLifecycleBound = true;
  window.addEventListener('pagehide', exitCollapsedState, { passive: true });
}

function enterCollapsedState(): void {
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
    enterCollapsedState();
  });

  return btn;
}

// Inject and manage the arrow hide button inside #pwc-controls-tray
export function injectInstantHideButton(): void {
  const exactBtn = document.getElementById('pwc-instant-hide-btn') as HTMLElement | null;

  // If disabled, remove the button and clean up collapsed state + listeners
  if (!state.extensionEnabled || !state.enableInstantHide) {
    if (exactBtn) {
      exactBtn.remove();
    }
    removeControlsTrayIfEmpty();
    exitCollapsedState();
    return;
  }

  ensureLifecycleCleanupBound();

  const video = getActiveVideo();
  const toolbar = findControlsToolbar();
  if (!video && !toolbar) return;
  if (!toolbar) return;

  if (exactBtn && isInsideControlsTray(exactBtn)) {
    placeControlInTray(exactBtn);
    return;
  }

  const btn = exactBtn || createInstantHideButton();
  placeControlInTray(btn);
}
