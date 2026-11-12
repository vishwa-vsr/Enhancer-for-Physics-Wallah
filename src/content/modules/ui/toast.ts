import { getActiveVideo } from '../video/detector';
import { findPWToolbar, getOuterPlayerContainer } from '../distractions/elements';

export const CONTROLS_TRAY_ID = 'pwc-controls-tray';

// Canonical left-to-right display order inside #pwc-controls-tray
export const TRAY_CONTROL_ORDER = [
  'pwc-finish-time-badge',
  'pwc-ss-container',
  'pwc-quality-control',
  'pwc-speed-control',
  'pwc-instant-hide-btn',
] as const;

let toastTimeout: ReturnType<typeof setTimeout> | null = null;
let trayResizeObserver: ResizeObserver | null = null;
let observedWidthElement: Element | null = null;

function updateTrayCompactClasses(tray: HTMLElement, width: number): void {
  if (width <= 0) return;
  tray.classList.toggle('pwc-tray-compact', width <= 960);
  tray.classList.toggle('pwc-tray-tight', width <= 720);
}

function disconnectTrayResizeObserver(): void {
  if (trayResizeObserver) {
    trayResizeObserver.disconnect();
    trayResizeObserver = null;
  }
  observedWidthElement = null;
}

function syncTrayResizeObserver(tray: HTMLElement): void {
  if (typeof ResizeObserver === 'undefined') return;
  const host =
    tray.closest('#player-footer-controls, .player-footer, .vjs-control-bar') ||
    getOuterPlayerContainer() ||
    tray.parentElement;
  if (!host) return;

  if (observedWidthElement === host && trayResizeObserver) {
    updateTrayCompactClasses(tray, (host as HTMLElement).clientWidth);
    return;
  }

  disconnectTrayResizeObserver();
  observedWidthElement = host;
  updateTrayCompactClasses(tray, (host as HTMLElement).clientWidth);

  trayResizeObserver = new ResizeObserver((entries) => {
    const activeTray = document.getElementById(CONTROLS_TRAY_ID);
    if (!activeTray || !activeTray.isConnected) {
      disconnectTrayResizeObserver();
      return;
    }
    const width = entries[0]?.contentRect?.width ?? (host as HTMLElement).clientWidth;
    updateTrayCompactClasses(activeTray, width);
  });
  trayResizeObserver.observe(host);
}

// Resolve the toolbar container for #pwc-controls-tray (#footer-right-section primary, .vjs-control-bar fallback)
export function findControlsToolbar(): Element | null {
  const outer = getOuterPlayerContainer();
  if (outer) {
    const scopedRight = outer.querySelector('#footer-right-section');
    if (scopedRight && scopedRight.isConnected) {
      return scopedRight;
    }
  }

  const fRight = document.getElementById('footer-right-section');
  if (fRight && fRight.isConnected) {
    return fRight;
  }

  const pwToolbar = findPWToolbar();
  if (pwToolbar && pwToolbar.isConnected) {
    return pwToolbar;
  }

  if (outer) {
    const scopedVjs = outer.querySelector('.vjs-control-bar');
    if (scopedVjs && scopedVjs.isConnected) {
      return scopedVjs;
    }
  }

  const video = getActiveVideo();
  const vjsRoot = video?.closest('.video-js');
  const videoVjs = vjsRoot?.querySelector('.vjs-control-bar');
  if (videoVjs && videoVjs.isConnected) {
    return videoVjs;
  }

  const docVjs = document.querySelector('.vjs-control-bar');
  return docVjs && docVjs.isConnected ? docVjs : null;
}

// Check whether an extension control lives directly inside an active, properly parented #pwc-controls-tray
export function isInsideControlsTray(el: Element | null): boolean {
  if (!el || !el.isConnected) return false;
  const tray = el.parentElement;
  if (!tray || tray.id !== CONTROLS_TRAY_ID || !tray.isConnected) return false;

  const expectedToolbar = findControlsToolbar();
  if (expectedToolbar && tray.parentElement !== expectedToolbar) {
    return false;
  }
  return true;
}

// Check that all known controls inside #pwc-controls-tray appear in canonical order
export function areTrayControlsOrdered(tray: Element | null): boolean {
  if (!tray) return false;
  let lastOrderIdx = -1;
  for (let i = 0; i < tray.children.length; i++) {
    const childId = tray.children[i].id;
    const idx = TRAY_CONTROL_ORDER.indexOf(childId as (typeof TRAY_CONTROL_ORDER)[number]);
    if (idx === -1) continue;
    if (idx <= lastOrderIdx) return false;
    lastOrderIdx = idx;
  }
  return true;
}

// Find or create the single grouped #pwc-controls-tray inside the active player toolbar
export function ensureControlsTray(toolbar: Element): HTMLElement {
  let tray = document.getElementById(CONTROLS_TRAY_ID) as HTMLElement | null;
  if (!tray) {
    tray = document.createElement('div');
    tray.id = CONTROLS_TRAY_ID;
    tray.className = 'pwc-controls-tray';
  }

  if (tray.parentElement !== toolbar) {
    if (toolbar.classList.contains('vjs-control-bar')) {
      const rightAnchor = toolbar.querySelector('.vjs-setting-button, .vjs-fullscreen-control');
      if (rightAnchor) {
        toolbar.insertBefore(tray, rightAnchor);
      } else {
        toolbar.appendChild(tray);
      }
    } else if (toolbar.firstChild) {
      toolbar.insertBefore(tray, toolbar.firstChild);
    } else {
      toolbar.appendChild(tray);
    }
  }

  syncTrayResizeObserver(tray);
  return tray;
}

// Insert a control into #pwc-controls-tray in deterministic order without unneeded DOM churn
export function placeControlInTray(control: HTMLElement): boolean {
  const toolbar = findControlsToolbar();
  if (!toolbar) return false;

  const tray = ensureControlsTray(toolbar);
  const targetIdx = TRAY_CONTROL_ORDER.indexOf(control.id as (typeof TRAY_CONTROL_ORDER)[number]);

  let nextAnchor: Element | null = null;
  for (let i = 0; i < tray.children.length; i++) {
    const child = tray.children[i];
    if (child === control) continue;
    const childIdx = TRAY_CONTROL_ORDER.indexOf(child.id as (typeof TRAY_CONTROL_ORDER)[number]);
    if (targetIdx !== -1 && (childIdx === -1 || childIdx > targetIdx)) {
      nextAnchor = child;
      break;
    }
  }

  if (control.parentElement === tray && control.nextElementSibling === nextAnchor) {
    return true;
  }

  if (nextAnchor) {
    tray.insertBefore(control, nextAnchor);
  } else {
    tray.appendChild(control);
  }
  return true;
}

export function removeControlsTrayIfEmpty(): void {
  const tray = document.getElementById(CONTROLS_TRAY_ID);
  if (tray && tray.children.length === 0) {
    tray.remove();
    disconnectTrayResizeObserver();
  }
}

export function clearControlsTray(): void {
  const tray = document.getElementById(CONTROLS_TRAY_ID);
  if (tray) {
    tray.remove();
  }
  disconnectTrayResizeObserver();
}

// Display a visual warning/info toast overlay inside the player using safe DOM APIs
export function showInfoToast(text: string): void {
  const video = getActiveVideo();
  const playerContainer = getOuterPlayerContainer() || video?.parentElement || null;
  if (!playerContainer) return;

  let toast = document.getElementById('pwc-speed-toast') as HTMLElement | null;
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'pwc-speed-toast';
    toast.className = 'pwc-speed-toast';
    playerContainer.appendChild(toast);
  } else if (toast.parentElement !== playerContainer) {
    playerContainer.appendChild(toast);
  }

  toast.textContent = '';

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', '#eaaa2e');
  svg.setAttribute('stroke-width', '2.2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute(
    'd',
    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
  );
  svg.appendChild(path);

  const line = document.createElementNS(svgNS, 'line');
  line.setAttribute('x1', '12');
  line.setAttribute('y1', '9');
  line.setAttribute('x2', '12');
  line.setAttribute('y2', '13');
  svg.appendChild(line);

  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '17');
  circle.setAttribute('r', '0.5');
  circle.setAttribute('fill', 'currentColor');
  svg.appendChild(circle);

  toast.appendChild(svg);

  const span = document.createElement('span');
  span.textContent = text;
  toast.appendChild(span);

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toast.classList.remove('pwc-toast-visible');
  // Trigger DOM reflow to restart transition
  void toast.offsetHeight;
  toast.classList.add('pwc-toast-visible');

  toastTimeout = setTimeout(() => {
    if (toast) {
      toast.classList.remove('pwc-toast-visible');
    }
  }, 1800);
}
