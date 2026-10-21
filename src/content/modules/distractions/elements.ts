import { getActiveVideo } from '../video/detector';

let cachedSettingsBtn: Element | null = null;
let cachedTimeline: Element | null = null;
let cachedTimeTexts: Element[] | null = null;
let cachedNativeSpeedBadges: Element[] | null = null;
let cachedToolbar: Element | null = null;
let cachedNextLectureBtn: Element | null = null;
let cachedAttemptDPPBtn: Element | null = null;
let cachedNextDppWrapper: Element | null = null;

export function resetDistractionCaches(): void {
  cachedSettingsBtn = null;
  cachedTimeline = null;
  cachedTimeTexts = null;
  cachedNativeSpeedBadges = null;
  cachedToolbar = null;
  cachedNextLectureBtn = null;
  cachedAttemptDPPBtn = null;
  cachedNextDppWrapper = null;
}

// Helper to check if an element is a major player layout container that must never be mistaken for a single toolbar button
export function isProtectedPlayerStructure(el: Element | null): boolean {
  if (!el || el === document.body || el === document.documentElement) return true;
  const tag = el.tagName.toLowerCase();
  if (tag === 'video') return true;

  const id = (el.id || '').toLowerCase();
  const className = (el.getAttribute('class') || '').toLowerCase();

  if (id.startsWith('pwc-') || className.includes('pwc-')) return true;

  if (
    id === 'video-player-container' ||
    id === 'interactive-layer-wrapper' ||
    id === 'footer-right-section' ||
    id === 'footer-left-section' ||
    id === 'progress-placeholder' ||
    id === 'progress-control' ||
    id.startsWith('vjs_video_')
  ) {
    return true;
  }

  if (
    className.includes('video-js') ||
    className.includes('vjs-control-bar') ||
    className.includes('vjs-progress-control') ||
    className.includes('video-player-app') ||
    className.includes('player-header') ||
    className.includes('player-footer') ||
    className.includes('controls-container') ||
    className.includes('control-bar')
  ) {
    return true;
  }

  if (
    typeof el.querySelector === 'function' &&
    el.querySelector(
      'video, #interactive-layer-wrapper, #footer-right-section, #footer-left-section, #progress-control, .vjs-control-bar',
    )
  ) {
    return true;
  }

  return false;
}

// Resolve the outermost player container that wraps both the video (.video-js) and PW's custom interactive overlay (#interactive-layer-wrapper)
export function getOuterPlayerContainer(): HTMLElement | null {
  const byId = document.getElementById('video-player-container');
  if (byId) return byId;

  const video = getActiveVideo();
  const interactiveLayer =
    document.getElementById('interactive-layer-wrapper') ||
    document.getElementById('footer-right-section') ||
    document.getElementById('progress-control') ||
    document.querySelector<HTMLElement>('.player-header');

  if (video && interactiveLayer) {
    let curr: HTMLElement | null = video.parentElement;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      if (curr.contains(interactiveLayer)) {
        return curr;
      }
      curr = curr.parentElement;
    }
  }

  if (interactiveLayer && interactiveLayer.parentElement) {
    return interactiveLayer.parentElement;
  }

  if (!video) return null;
  const vjsRoot = video.closest<HTMLElement>('.video-js, [id^="vjs_video_"]');
  return (
    video.closest<HTMLElement>('.video-player-app') ||
    video.closest<HTMLElement>('[class*="video-player" i]') ||
    video.closest<HTMLElement>('[class*="player-container" i]') ||
    (vjsRoot && vjsRoot.parentElement ? vjsRoot.parentElement : null) ||
    video.parentElement
  );
}

// Helper to check if an injected widget is currently connected inside PW's preferred toolbar (#footer-right-section when present)
export function isInsidePreferredToolbar(el: Element | null): boolean {
  if (!el || !el.isConnected) return false;
  const fRight = document.getElementById('footer-right-section');
  return !fRight || fRight.contains(el);
}

const previousDisplayMap = new WeakMap<Element, { value: string; priority: string }>();

// Helper to hide or show an element with !important without stripping PW's own native display:none
export function setHidden(
  el: Element | HTMLElement | SVGElement,
  shouldHide: boolean,
  allowTimelineControl = false,
): void {
  if (!el) return;
  const id = (el.id || '').toLowerCase();
  const isOwnWidget = id.startsWith('pwc-');
  // Never allow hiding the core player wrapper, interactive layer, or entire footer bars
  if (shouldHide && !isOwnWidget && isProtectedPlayerStructure(el)) {
    const isTimelineBar =
      allowTimelineControl &&
      (id === 'progress-control' ||
        (el.getAttribute('class') || '').toLowerCase().includes('vjs-progress-control'));
    if (!isTimelineBar) {
      return;
    }
  }
  if (el instanceof HTMLElement || el instanceof SVGElement) {
    if (shouldHide) {
      if (!el.hasAttribute('data-pwc-hidden')) {
        previousDisplayMap.set(el, {
          value: el.style.getPropertyValue('display'),
          priority: el.style.getPropertyPriority('display'),
        });
        el.setAttribute('data-pwc-hidden', 'true');
      }
      el.style.setProperty('display', 'none', 'important');
    } else if (el.hasAttribute('data-pwc-hidden')) {
      el.removeAttribute('data-pwc-hidden');
      const prev = previousDisplayMap.get(el);
      previousDisplayMap.delete(el);
      if (prev && prev.value) {
        el.style.setProperty('display', prev.value, prev.priority);
      } else {
        el.style.removeProperty('display');
      }
    }
  }
}

// Checks if an element is part of the custom whiteboard / drawing toolbar
export function isDrawingToolbarElement(el: Element): boolean {
  let current: Element | null = el;
  while (current && current !== document.body) {
    const className = (current.getAttribute('class') || '').toLowerCase();
    const id = (current.id || '').toLowerCase();

    if (
      className.includes('dashboard') ||
      id.includes('dashboard') ||
      className.includes('page-manager')
    ) {
      return false;
    }
    if (/canvas|draw|paint|board|palette/i.test(className + ' ' + id)) {
      return true;
    }
    const parentNode: Node | null = current.parentNode;
    if (parentNode instanceof Element) {
      current = parentNode;
    } else if (parentNode instanceof ShadowRoot) {
      current = parentNode.host;
    } else {
      current = null;
    }
  }
  return false;
}

// Helper to check if a leaf element is a native speed badge (e.g. "1.1x" next to the timer)
export function isNativeSpeedBadge(el: Element): boolean {
  if (el.children.length !== 0) return false;
  const text = (el.textContent || '').trim();
  if (!/^\d+(\.\d+)?x$/i.test(text)) return false;
  const className = el.getAttribute('class') || '';
  const id = el.id || '';
  const isSelf = id.includes('pwc-') || className.includes('pwc-');
  return !isSelf && !isDrawingToolbarElement(el);
}

// Helper to traverse up and find the actual clickable control button container
export function getControlButton(el: Element | null): Element | null {
  if (!el || isProtectedPlayerStructure(el)) return null;
  let current: Element | null = el;
  while (current && current !== document.body && !isProtectedPlayerStructure(current)) {
    const tagName = current.tagName.toLowerCase();
    const role = current.getAttribute('role');
    const className = (current.getAttribute('class') || '').toLowerCase();

    if (
      tagName === 'button' ||
      role === 'button' ||
      className.includes('btn') ||
      className.includes('button')
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return isProtectedPlayerStructure(el) ? null : el;
}

// Find settings button recursively, piercing Shadow DOMs and ignoring drawing boards
export function findSettingsButton(): Element | null {
  const exact = document.getElementById('setting-icon');
  if (exact && exact.isConnected) {
    cachedSettingsBtn = exact;
    return exact;
  }

  if (
    cachedSettingsBtn &&
    cachedSettingsBtn.isConnected &&
    !isProtectedPlayerStructure(cachedSettingsBtn)
  ) {
    return cachedSettingsBtn;
  }

  const video = getActiveVideo();
  if (!video) return null;

  const playerContainer = getOuterPlayerContainer();
  if (!playerContainer) return null;

  const el = playerContainer.querySelector(
    '#setting-icon, [id*="setting-icon" i]:not([id^="pwc-"]), ' +
      '[title*="setting" i]:not([id^="pwc-"]):not([class*="pwc-"]), ' +
      '[aria-label*="setting" i]:not([id^="pwc-"]):not([class*="pwc-"]), ' +
      '[class*="setting-icon" i]:not([class*="pwc-"]), [class*="gear-icon" i]:not([class*="pwc-"])',
  );
  if (el) {
    const btn = getControlButton(el);
    if (btn && !isDrawingToolbarElement(btn) && !isProtectedPlayerStructure(btn)) {
      if (btn.id === 'setting-icon') {
        cachedSettingsBtn = btn;
      }
      return btn;
    }
  }

  const found = scanShadowForSettings(playerContainer);
  return found;
}

export function scanShadowForSettings(root: Document | Element | ShadowRoot): Element | null {
  const allElements = root.querySelectorAll('*');
  for (let i = 0; i < allElements.length; i++) {
    const item = allElements[i];
    if (item.shadowRoot) {
      const el = item.shadowRoot.querySelector(
        '#setting-icon, [id*="setting-icon" i], [title*="setting" i], [class*="setting-icon" i], [class*="gear" i]',
      );
      if (el && !isDrawingToolbarElement(el)) {
        const btn = getControlButton(el);
        if (btn && !isProtectedPlayerStructure(btn)) return btn;
      }
      const found = scanShadowForSettings(item.shadowRoot);
      if (found) return found;
    }
  }
  return null;
}

// Find fullscreen button recursively, piercing Shadow DOMs and ignoring drawing boards
export function findFullscreenButton(): Element | null {
  const video = getActiveVideo();
  if (!video) return null;

  // 1. Primary: locate the button immediately to the right of #setting-icon inside #footer-right-section
  const settingsBtn = findSettingsButton();
  if (settingsBtn) {
    const fRight = document.getElementById('footer-right-section');
    if (fRight && fRight.contains(settingsBtn)) {
      const nativeButtons = Array.from(fRight.children).filter((el) => {
        if (el.nodeType !== 1) return false;
        const id = el.id || '';
        const cls = el.getAttribute('class') || '';
        return !id.startsWith('pwc-') && !cls.includes('pwc-');
      });
      const settingsIdx = nativeButtons.findIndex(
        (el) =>
          el === settingsBtn || el.id === 'setting-icon' || !!el.querySelector('#setting-icon'),
      );
      if (settingsIdx !== -1 && settingsIdx + 1 < nativeButtons.length) {
        const fsCandidate = nativeButtons[settingsIdx + 1];
        const clickable =
          fsCandidate.querySelector('button, [role="button"]') ||
          fsCandidate.querySelector('svg') ||
          fsCandidate;
        return clickable;
      }
    }

    const settingsWrapper =
      settingsBtn.closest('.flex-col') ||
      (settingsBtn.parentNode &&
      settingsBtn.parentNode !== fRight &&
      settingsBtn.parentNode.parentNode === fRight
        ? (settingsBtn.parentNode as Element)
        : null);
    if (settingsWrapper && (settingsWrapper as Element).nextElementSibling) {
      const nextSib = (settingsWrapper as Element).nextElementSibling!;
      const clickable =
        nextSib.querySelector('button, [role="button"]') || nextSib.querySelector('svg') || nextSib;
      if (!isProtectedPlayerStructure(clickable)) {
        return clickable;
      }
    }
  }

  const playerContainer = getOuterPlayerContainer();
  if (!playerContainer) return null;

  // 2. Match PW's exact fullscreen SVG path signatures (enter / exit fullscreen)
  const fsSvgPath = playerContainer.querySelector(
    'path[d^="M21.3369 1.75"], path[d^="M0.663085 8.66675"]',
  );
  if (fsSvgPath && !fsSvgPath.closest('.vjs-control-bar')) {
    const svg = fsSvgPath.closest('svg');
    const clickable = (svg && (svg.closest('button, [role="button"]') || svg.parentElement)) || svg;
    if (clickable && !isProtectedPlayerStructure(clickable)) {
      return clickable;
    }
  }

  // Always exclude Video.js's internal .vjs-fullscreen-control so we never fullscreen .video-js alone without PW's overlay
  const selector =
    '[id*="fullscreen" i]:not(.vjs-fullscreen-control), [title*="fullscreen" i]:not(.vjs-fullscreen-control), ' +
    '[id*="full-screen" i]:not(.vjs-fullscreen-control), [title*="full-screen" i]:not(.vjs-fullscreen-control), ' +
    '[class*="fullscreen" i]:not(.vjs-fullscreen-control), [class*="full-screen" i]:not(.vjs-fullscreen-control)';

  const el = playerContainer.querySelector(selector);
  if (el && !el.closest('.vjs-control-bar')) {
    const btn = getControlButton(el);
    if (
      btn &&
      !btn.classList.contains('vjs-fullscreen-control') &&
      !btn.closest('.vjs-control-bar') &&
      !isDrawingToolbarElement(btn) &&
      !isProtectedPlayerStructure(btn)
    ) {
      return btn;
    }
  }

  return scanShadowForFullscreen(playerContainer);
}

export function scanShadowForFullscreen(root: Document | Element | ShadowRoot): Element | null {
  const allElements = root.querySelectorAll('*');
  for (let i = 0; i < allElements.length; i++) {
    const item = allElements[i];
    if (item.shadowRoot) {
      const el = item.shadowRoot.querySelector(
        '[class*="fullscreen" i]:not(.vjs-fullscreen-control), [id*="fullscreen" i]:not(.vjs-fullscreen-control), [title*="fullscreen" i]:not(.vjs-fullscreen-control), ' +
          '[class*="full-screen" i]:not(.vjs-fullscreen-control), [id*="full-screen" i]:not(.vjs-fullscreen-control), [title*="full-screen" i]:not(.vjs-fullscreen-control)',
      );
      if (el && !isDrawingToolbarElement(el)) {
        const btn = getControlButton(el);
        if (btn && !isProtectedPlayerStructure(btn)) return btn;
      }
      const found = scanShadowForFullscreen(item.shadowRoot);
      if (found) return found;
    }
  }
  return null;
}

// Helper to traverse up from a control button and find the actual main toolbar container
export function getToolbarContainer(el: Element | null): Element | null {
  if (!el) return null;
  const fRight = document.getElementById('footer-right-section');
  if (fRight && fRight.contains(el)) {
    return fRight;
  }

  let current: Element | null = el;
  while (current && current !== document.body) {
    const parentNode: Element | null = current.parentElement;
    if (parentNode) {
      // Never climb up to a protected player container (other than #footer-right-section)
      if (isProtectedPlayerStructure(parentNode) && parentNode.id !== 'footer-right-section') {
        break;
      }
      if (parentNode.children.length >= 3) {
        return parentNode;
      }
    }
    current = parentNode;
  }
  return el.parentElement;
}

// Find native speed pills (like "1.1x") located next to the time display
export function findNativeSpeedBadges(): Element[] {
  if (
    cachedNativeSpeedBadges !== null &&
    (cachedNativeSpeedBadges.length === 0 || cachedNativeSpeedBadges.every((el) => el.isConnected))
  ) {
    return cachedNativeSpeedBadges;
  }
  const video = getActiveVideo();
  if (!video) return [];

  const playerContainer = getOuterPlayerContainer();
  if (!playerContainer) return [];

  let list: Element[] = [];
  const elements = playerContainer.querySelectorAll('*');
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (isNativeSpeedBadge(el)) {
      list.push(el);
    }
    if (el.shadowRoot) {
      list = list.concat(scanShadowForNativeSpeed(el.shadowRoot));
    }
  }
  cachedNativeSpeedBadges = list;
  return list;
}

export function scanShadowForNativeSpeed(root: Document | Element | ShadowRoot): Element[] {
  let list: Element[] = [];
  const elements = root.querySelectorAll('*');
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (isNativeSpeedBadge(el)) {
      list.push(el);
    }
    if (el.shadowRoot) {
      list = list.concat(scanShadowForNativeSpeed(el.shadowRoot));
    }
  }
  return list;
}

export type DistractorSlotType = 'notes' | 'notetimeline' | 'doubt' | 'chat' | 'askai';

// Check PW's exact SVG path signatures for unlabeled toolbar icons
function getDistractorTypeBySvgPath(el: Element): DistractorSlotType | null {
  const checkPathD = (d: string): DistractorSlotType | null => {
    if (!d) return null;
    if (d.includes('M26.982 21.097')) return 'chat';
    if (d.includes('M32.363 15.664') || d.includes('27.486 19.848')) return 'doubt';
    if (d.startsWith('M5.1001') || d.includes('17.4846 17.1081')) return 'notetimeline';
    if (d.includes('M17.8092 3.38739')) return 'notes';
    return null;
  };

  if (el.tagName.toLowerCase() === 'path') {
    return checkPathD(el.getAttribute('d') || '');
  }

  const paths = el.querySelectorAll('path[d]');
  for (let i = 0; i < paths.length; i++) {
    const matched = checkPathD(paths[i].getAttribute('d') || '');
    if (matched) return matched;
  }
  return null;
}

// Identify the category of any matched distractor element using structural attributes or SVG path signatures
export function getDistractorType(el: Element): DistractorSlotType | null {
  const className = (el.getAttribute('class') || '').toLowerCase();
  const id = (el.id || '').toLowerCase();
  const title = (el.getAttribute('title') || '').toLowerCase();
  const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();

  // Safety check: Never match the dashboard or main page manager layouts
  if (
    className.includes('dashboard') ||
    id.includes('dashboard') ||
    className.includes('page-manager')
  ) {
    return null;
  }

  // 0. Check exact PW SVG path signatures first (handles unlabeled icons in recorded/AI lectures)
  const svgMatch = getDistractorTypeBySvgPath(el);
  if (svgMatch) return svgMatch;

  // Structural attributes are safe to match broadly
  const attrs = `${className} ${id} ${title} ${ariaLabel}`;

  // Only use textContent for leaf elements (no children) to avoid matching nested junk
  const isLeaf = el.children.length === 0;
  const leafText = isLeaf ? (el.textContent || '').trim().toLowerCase() : '';

  // 1. Ask AI feature
  if (
    attrs.includes('ask ai') ||
    attrs.includes('askai') ||
    attrs.includes('ask-ai') ||
    /\bai\b/.test(attrs)
  ) {
    return 'askai';
  }
  if (leafText === 'ask ai') return 'askai';

  // 2. Notes / Study materials — PW Live uses title="Add note" on its notes button
  if (
    /\bnote(s)?\b/.test(attrs) ||
    attrs.includes('study') ||
    attrs.includes('pdf') ||
    attrs.includes('attachment')
  ) {
    return 'notes';
  }
  if (isLeaf && (leafText === 'notes' || leafText === 'study notes' || leafText === 'add note'))
    return 'notes';

  // 4. Doubt / Q&A controls
  if (attrs.includes('doubt') || attrs.includes('qna') || attrs.includes('question')) {
    return 'doubt';
  }
  if (isLeaf && (leafText === 'doubt' || leafText === 'q&a')) return 'doubt';

  // 5. Chat / Comments
  if (attrs.includes('chat') || attrs.includes('comment')) {
    return 'chat';
  }
  if (isLeaf && leafText === 'chat') return 'chat';

  // 6. Note Timeline controls (avoid matching video progress timeline seekbar)
  if (
    !className.includes('progress') &&
    !className.includes('play-progress') &&
    !id.includes('video-progress')
  ) {
    if (
      className.includes('timeline') ||
      id.includes('timeline') ||
      title.includes('timeline') ||
      ariaLabel.includes('timeline')
    ) {
      return 'notetimeline';
    }
  }

  return null;
}

// Helper to check the element and its shallow children for classification (2 levels deep)
export function checkElementOrChildType(el: Element): DistractorSlotType | null {
  const type = getDistractorType(el);
  if (type) return type;

  // Check direct children (level 1)
  for (let i = 0; i < el.children.length; i++) {
    const child = el.children[i];
    const t = getDistractorType(child);
    if (t) return t;
    // Check grandchildren (level 2)
    for (let j = 0; j < child.children.length; j++) {
      const grandchild = child.children[j];
      const t2 = getDistractorType(grandchild);
      if (t2) return t2;
    }
  }
  return null;
}

// Bulletproof PW Control Bar Finder: locates bottom control bar regardless of layout changes
export function findPWToolbar(): Element | null {
  const fRight = document.getElementById('footer-right-section');
  if (fRight && fRight.isConnected) {
    cachedToolbar = fRight;
    return fRight;
  }

  if (
    cachedToolbar &&
    cachedToolbar.isConnected &&
    (!isProtectedPlayerStructure(cachedToolbar) || cachedToolbar.id === 'footer-right-section')
  ) {
    return cachedToolbar;
  }

  const video = getActiveVideo();
  if (!video) return null;

  const root = (video.getRootNode && (video.getRootNode() as Document | ShadowRoot)) || document;
  const playerContainer = getOuterPlayerContainer() || (root instanceof Element ? root : null);

  if (!playerContainer || !playerContainer.querySelectorAll) return null;

  // Scan all containers holding 3 or more control buttons/icons near the bottom of the player
  const candidates = Array.from(playerContainer.querySelectorAll('div, section, footer, nav'));
  const toolbars = candidates.filter((div) => {
    if (isProtectedPlayerStructure(div) && div.id !== 'footer-right-section') return false;
    if (div.closest('.vjs-control-bar')) return false;
    const btns = div.querySelectorAll('button, svg, [role="button"], [class*="icon" i]');
    return btns.length >= 3 && (div as HTMLElement).offsetWidth > 80;
  });

  if (toolbars.length > 0) {
    toolbars.sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length);
    return toolbars[0];
  }

  const settingsBtn = findSettingsButton();
  const fullscreenBtn = findFullscreenButton();
  const refBtn = settingsBtn || fullscreenBtn;
  if (refBtn) {
    const container = getToolbarContainer(refBtn);
    if (
      container &&
      (!isProtectedPlayerStructure(container) || container.id === 'footer-right-section')
    ) {
      return container;
    }
  }

  return null;
}

// Helper to find the video timeline progress bar
export function findTimeline(): Element | null {
  const exactProgress = document.getElementById('progress-control');
  if (exactProgress && exactProgress.isConnected) {
    cachedTimeline = exactProgress;
    return exactProgress;
  }

  if (cachedTimeline && cachedTimeline.isConnected) {
    return cachedTimeline;
  }
  const video = getActiveVideo();
  if (!video) return null;
  const playerContainer = getOuterPlayerContainer();
  if (!playerContainer) return null;
  const el = playerContainer.querySelector(
    '#progress-control, .vjs-progress-control, .vjs-progress-holder, ' +
      '[class*="progress-control" i], [class*="progress-bar" i], ' +
      '[class*="seekbar" i], [class*="seek-bar" i]',
  );
  if (el) {
    const className = el.getAttribute('class') || '';
    if (className.includes('pwc-')) return null;
    cachedTimeline = el;
    return el;
  }
  return null;
}

// Synchronize video timeline visibility and prevent duplicate progress bars on AI-chapter lectures
export function syncTimelineVisibility(shouldHide: boolean): void {
  const placeholder = document.getElementById('progress-placeholder');
  const exactProgress = document.getElementById('progress-control');

  // Identify any custom AI chapter progress bar rendered inside #progress-placeholder alongside #progress-control
  const customChapterBars: Element[] = [];
  if (placeholder) {
    Array.from(placeholder.children).forEach((child) => {
      if (child === exactProgress || child.id === 'progress-control') return;
      if (
        child.querySelector('#current-time-placeholder, #total-time-placeholder, .vjs-current-time')
      ) {
        return;
      }
      customChapterBars.push(child);
    });
  }

  if (shouldHide) {
    if (exactProgress) {
      setHidden(exactProgress, true, true);
    } else {
      const fallback = findTimeline();
      if (fallback) setHidden(fallback, true, true);
    }
    customChapterBars.forEach((bar) => setHidden(bar, true, true));
    return;
  }

  // Restore any bars that our extension previously hid via "Hide Timeline Line"
  if (exactProgress) {
    setHidden(exactProgress, false, true);
  } else {
    const fallback = findTimeline();
    if (fallback) setHidden(fallback, false, true);
  }
  customChapterBars.forEach((bar) => setHidden(bar, false, true));

  // If PW's segmented AI chapter bar is visibly rendered full-width inside #progress-placeholder,
  // ensure the fallback #progress-control bar (at bottom: -15px) stays hidden so two bars never stack.
  if (exactProgress && placeholder && customChapterBars.length > 0) {
    const minBarWidth = Math.max(100, placeholder.offsetWidth * 0.75);
    const hasVisibleChapterBar = customChapterBars.some((bar) => {
      const htmlBar = bar as HTMLElement;
      return (
        htmlBar.offsetWidth >= minBarWidth && htmlBar.offsetHeight > 0 && htmlBar.offsetHeight <= 32
      );
    });
    if (hasVisibleChapterBar) {
      exactProgress.setAttribute('data-pwc-dup-timeline', 'true');
      exactProgress.style.setProperty('display', 'none', 'important');
    } else if (exactProgress.hasAttribute('data-pwc-dup-timeline')) {
      exactProgress.removeAttribute('data-pwc-dup-timeline');
      exactProgress.style.removeProperty('display');
    }
  }
}

// Helper to find video time and duration texts
export function findTimeTexts(): Element[] {
  if (
    cachedTimeTexts &&
    cachedTimeTexts.length > 0 &&
    cachedTimeTexts.every((el) => el.isConnected)
  ) {
    return cachedTimeTexts;
  }
  const video = getActiveVideo();
  if (!video) return [];
  const playerContainer = getOuterPlayerContainer();
  if (!playerContainer) return [];

  const elements = playerContainer.querySelectorAll(
    '.vjs-current-time, .vjs-duration, .vjs-time-divider, .vjs-remaining-time, .vjs-time-control, ' +
      '[class*="time-display" i], [class*="time-text" i], ' +
      '[class*="current-time" i], [class*="duration" i], [class*="video-time" i], ' +
      '.current-time, .duration, .time-display, .time-text',
  );

  const list = Array.from(elements).filter((el) => {
    // 1. Exclude our own extension's speedometer UI elements
    const className = el.getAttribute('class') || '';
    const id = el.id || '';
    if (className.includes('pwc-') || id.includes('pwc-')) {
      return false;
    }

    // 2. Exclude elements that contain interactive buttons or SVGs
    if (
      el.querySelector('button') ||
      el.querySelector('svg') ||
      el.querySelector('[role="button"]')
    ) {
      return false;
    }

    // 3. Exclude major layout/wrapper sections (we only want the leaf labels)
    if (el.querySelectorAll('div').length > 5) {
      return false;
    }

    // 4. Ensure it contains actual time numbers (e.g. "0:00", "2:31", "/ 2:06:36")
    const text = (el.textContent || '').trim();
    const isVjsTime =
      className.includes('vjs-current-time') ||
      className.includes('vjs-duration') ||
      className.includes('vjs-time-divider') ||
      className.includes('vjs-remaining-time') ||
      className.includes('vjs-time-control');

    if (isVjsTime) {
      return true;
    }

    const hasTimePattern = /^\s*[\d\s:\-/|]+\s*$/.test(text) && /\d+:\d+/.test(text);
    const isDivider = text === '/' || text === '|' || text === '-';

    return hasTimePattern || isDivider;
  });

  cachedTimeTexts = list;
  return list;
}

const originalSeparatorTextMap = new WeakMap<Node, string>();

// Helper to hide separators (like "/" text nodes or span dividers) next to time elements
export function hideTimeSeparators(timeElement: Element, shouldHide: boolean): void {
  if (!timeElement) return;
  const parent = timeElement.parentElement;
  if (!parent) return;

  const childNodes = Array.from(parent.childNodes);
  childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      // Text Node
      const text = (node.textContent || '').trim();
      if (text === '/' || text === '|' || text === '-' || originalSeparatorTextMap.has(node)) {
        if (shouldHide) {
          if (!originalSeparatorTextMap.has(node) && node.textContent !== null) {
            originalSeparatorTextMap.set(node, node.textContent);
          }
          node.textContent = '';
        } else {
          const orig = originalSeparatorTextMap.get(node);
          if (orig !== undefined) {
            node.textContent = orig;
          }
        }
      }
    } else if (node.nodeType === 1) {
      // Element Node
      const elNode = node as Element;
      const text = (elNode.textContent || '').trim();
      const className = elNode.getAttribute('class') || '';
      const id = elNode.id || '';
      const isSelf = className.includes('pwc-') || id.includes('pwc-');

      if (!isSelf && (text === '/' || text === '|' || text === '-')) {
        setHidden(elNode, shouldHide);
      }
    }
  });
}

// ===== Unified Player Toolbar Slot Resolver & Action Trigger (Issue #14 / Candidate #2) =====

export type ToolbarSlotMap = Record<DistractorSlotType, Element[]>;

// Smart match (Label first, Settings-offset Position backup):
// Used by both focus-css.ts (hiding) and keyboard.ts (shortcuts) so they never diverge.
export function resolvePlayerToolbarSlots(): ToolbarSlotMap {
  const slots: ToolbarSlotMap = {
    notes: [],
    notetimeline: [],
    doubt: [],
    chat: [],
    askai: [],
  };

  const settingsBtn = findSettingsButton();
  const fullscreenBtn = findFullscreenButton();
  const refBtn = settingsBtn || fullscreenBtn;
  if (!refBtn) return slots;

  const parent = getToolbarContainer(refBtn);
  if (!parent || (isProtectedPlayerStructure(parent) && parent.id !== 'footer-right-section')) {
    return slots;
  }

  const nativeButtons = Array.from(parent.children).filter((el) => {
    if (el.nodeType !== 1) return false;
    const id = el.id || '';
    const cls = el.getAttribute('class') || '';
    return !id.startsWith('pwc-') && !cls.includes('pwc-') && !isProtectedPlayerStructure(el);
  });

  const classifiedButtons = new Set<Element>();
  const claimedSlotTypes = new Set<DistractorSlotType>();

  // Pass 1: Label / attribute match first (handles missing buttons in recorded lectures accurately)
  for (const btn of nativeButtons) {
    if (btn === settingsBtn || btn.id === 'setting-icon' || !!btn.querySelector('#setting-icon')) {
      classifiedButtons.add(btn);
      continue;
    }
    const type = checkElementOrChildType(btn);
    if (type) {
      slots[type].push(btn);
      classifiedButtons.add(btn);
      claimedSlotTypes.add(type);
    }
  }

  // Pass 2: Settings-offset position backup for any unlabeled buttons
  const settingsIdx = nativeButtons.findIndex(
    (el) => el === settingsBtn || el.id === 'setting-icon' || !!el.querySelector('#setting-icon'),
  );

  if (settingsIdx !== -1) {
    const offsetToSlot: Record<number, DistractorSlotType> = {
      1: 'notes',
      2: 'notetimeline',
      3: 'doubt',
      4: 'chat',
    };

    nativeButtons.forEach((btn, index) => {
      if (classifiedButtons.has(btn)) return;
      const offset = settingsIdx - index;
      const slotType = offsetToSlot[offset];
      if (slotType && !claimedSlotTypes.has(slotType)) {
        slots[slotType].push(btn);
        classifiedButtons.add(btn);
        claimedSlotTypes.add(slotType);
      }
    });
  }

  return slots;
}

export function findNotesButton(): Element | null {
  const slots = resolvePlayerToolbarSlots();
  return (
    slots.notes[0] ||
    document.querySelector(
      '[title*="note" i]:not([class*="pwc-"]), [aria-label*="note" i]:not([class*="pwc-"])',
    )
  );
}

export function findTimelineButton(): Element | null {
  const slots = resolvePlayerToolbarSlots();
  return (
    slots.notetimeline[0] ||
    document.querySelector(
      '[title*="timeline" i]:not([class*="pwc-"]), [aria-label*="timeline" i]:not([class*="pwc-"])',
    )
  );
}

export function findDoubtButton(): Element | null {
  const slots = resolvePlayerToolbarSlots();
  return (
    slots.doubt[0] ||
    document.querySelector(
      '[title*="doubt" i]:not([class*="pwc-"]), [aria-label*="doubt" i]:not([class*="pwc-"]), [title*="qna" i]:not([class*="pwc-"])',
    )
  );
}

export function findChatButton(): Element | null {
  const slots = resolvePlayerToolbarSlots();
  return (
    slots.chat[0] ||
    document.querySelector(
      '[title*="chat" i]:not([class*="pwc-"]), [aria-label*="chat" i]:not([class*="pwc-"]), [title*="comment" i]:not([class*="pwc-"])',
    )
  );
}

// Wake PW's interactive overlay DOM if the user presses a shortcut before ever hovering/clicking the player
export function wakePlayerControlsDom(): void {
  if (document.getElementById('footer-right-section')) return;
  const targets = [
    getOuterPlayerContainer(),
    document.getElementById('interactive-layer-wrapper'),
    getActiveVideo(),
  ];
  for (const t of targets) {
    if (!t) continue;
    try {
      t.dispatchEvent(
        new MouseEvent('mouseenter', { bubbles: true, cancelable: true, view: window }),
      );
      t.dispatchEvent(
        new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }),
      );
    } catch {
      /* ignore */
    }
  }
}

// Click a toolbar element, synchronously unhiding and re-hiding it if hidden by Focus Toggles
export function triggerToolbarElement(el: Element | null): boolean {
  if (!el) return false;

  const root = document.documentElement;
  const hadHideNotesClass = root.classList.contains('pwc-hide-notes');

  const restoreList: Array<{ node: HTMLElement | SVGElement; val: string; priority: string }> = [];
  let curr: Element | null = el;
  while (
    curr &&
    curr !== document.body &&
    curr.id !== 'footer-right-section' &&
    curr.id !== 'interactive-layer-wrapper' &&
    curr.id !== 'video-player-container'
  ) {
    if (curr instanceof HTMLElement || curr instanceof SVGElement) {
      const inlineDisplay = curr.style.getPropertyValue('display');
      if (inlineDisplay === 'none') {
        restoreList.push({
          node: curr,
          val: inlineDisplay,
          priority: curr.style.getPropertyPriority('display'),
        });
        curr.style.removeProperty('display');
      }
    }
    curr = curr.parentElement;
  }

  if (hadHideNotesClass) {
    root.classList.remove('pwc-hide-notes');
  }

  try {
    const innerBtn =
      typeof el.querySelector === 'function'
        ? el.querySelector<HTMLElement>('button, [role="button"]')
        : null;
    const clickTarget = innerBtn || el;

    if (clickTarget instanceof HTMLElement) {
      clickTarget.click();
      return true;
    } else if (clickTarget instanceof SVGElement) {
      clickTarget.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
      );
      return true;
    }
  } catch {
    /* ignore */
  } finally {
    for (const item of restoreList) {
      item.node.style.setProperty('display', item.val, item.priority);
    }
    if (hadHideNotesClass) {
      root.classList.add('pwc-hide-notes');
    }
  }
  return false;
}

export function triggerPlayerSlot(
  slot: 'notes' | 'notetimeline' | 'doubt' | 'chat' | 'fullscreen',
): boolean {
  wakePlayerControlsDom();
  const target =
    slot === 'fullscreen'
      ? findFullscreenButton()
      : slot === 'notes'
        ? findNotesButton()
        : slot === 'notetimeline'
          ? findTimelineButton()
          : slot === 'doubt'
            ? findDoubtButton()
            : findChatButton();
  return triggerToolbarElement(target);
}

// Locate the floating "Next Lecture" card button
export function findNextLectureButton(): HTMLElement | null {
  if (cachedNextLectureBtn && cachedNextLectureBtn.isConnected) {
    return cachedNextLectureBtn as HTMLElement;
  }
  const player = getOuterPlayerContainer() || document.body;
  if (!player) return null;

  const candidates = player.querySelectorAll('button, [role="button"], a');
  for (let i = 0; i < candidates.length; i++) {
    const el = candidates[i];
    const text = (el.textContent || '').trim().toLowerCase();
    if (text.includes('next lecture') || (text.includes('next') && text.includes('lecture'))) {
      const btn = (el.closest('button, [role="button"], a') || el) as HTMLElement;
      if (!isProtectedPlayerStructure(btn)) {
        cachedNextLectureBtn = btn;
        return btn;
      }
    }
  }
  return null;
}

// Locate the floating "Attempt DPP" card button
export function findAttemptDPPButton(): HTMLElement | null {
  if (cachedAttemptDPPBtn && cachedAttemptDPPBtn.isConnected) {
    return cachedAttemptDPPBtn as HTMLElement;
  }
  const player = getOuterPlayerContainer() || document.body;
  if (!player) return null;

  const candidates = player.querySelectorAll('button, [role="button"], a');
  for (let i = 0; i < candidates.length; i++) {
    const el = candidates[i];
    const text = (el.textContent || '').trim().toLowerCase();
    if (
      text.includes('attempt dpp') ||
      (text.includes('dpp') && (text.includes('attempt') || text.includes('solve')))
    ) {
      const btn = (el.closest('button, [role="button"], a') || el) as HTMLElement;
      if (!isProtectedPlayerStructure(btn)) {
        cachedAttemptDPPBtn = btn;
        return btn;
      }
    }
  }
  return null;
}

// Locate the floating container wrapping both Next Lecture and Attempt DPP
export function findNextDppWrapper(
  nextBtn?: Element | null,
  dppBtn?: Element | null,
): HTMLElement | null {
  if (cachedNextDppWrapper && cachedNextDppWrapper.isConnected) {
    return cachedNextDppWrapper as HTMLElement;
  }
  const next = nextBtn || findNextLectureButton();
  const dpp = dppBtn || findAttemptDPPButton();

  let found: HTMLElement | null = null;
  if (next && dpp) {
    let parent = next.parentElement;
    while (parent && parent !== document.body && parent !== document.documentElement) {
      if (parent.contains(dpp)) {
        if (!isProtectedPlayerStructure(parent)) {
          found = parent as HTMLElement;
        }
        break;
      }
      parent = parent.parentElement;
    }
  } else if (next && next.parentElement && !isProtectedPlayerStructure(next.parentElement)) {
    const cls = (next.parentElement.getAttribute('class') || '').toLowerCase();
    if (cls.includes('absolute') && (cls.includes('bottom') || cls.includes('right'))) {
      found = next.parentElement as HTMLElement;
    }
  } else if (dpp && dpp.parentElement && !isProtectedPlayerStructure(dpp.parentElement)) {
    const cls = (dpp.parentElement.getAttribute('class') || '').toLowerCase();
    if (cls.includes('absolute') && (cls.includes('bottom') || cls.includes('right'))) {
      found = dpp.parentElement as HTMLElement;
    }
  }

  if (found) {
    cachedNextDppWrapper = found;
  }
  return found;
}

// Prevent an injected toolbar button from stealing keyboard focus away from the video player
export function preventFocusSteal(el: HTMLElement): void {
  el.tabIndex = -1;
  el.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });
}
