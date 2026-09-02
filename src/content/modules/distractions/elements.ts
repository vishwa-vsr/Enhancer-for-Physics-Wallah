import { getActiveVideo } from '../video/detector';

let cachedSettingsBtn: Element | null = null;
let cachedFullscreenBtn: Element | null = null;
let cachedTimeline: Element | null = null;
let cachedTimeTexts: Element[] | null = null;
let cachedNativeSpeedBadges: Element[] | null = null;

export function resetDistractionCaches(): void {
  cachedSettingsBtn = null;
  cachedFullscreenBtn = null;
  cachedTimeline = null;
  cachedTimeTexts = null;
  cachedNativeSpeedBadges = null;
}

// Helper to hide or show an element with !important
export function setHidden(el: Element | HTMLElement | SVGElement, shouldHide: boolean): void {
  if (el instanceof HTMLElement || el instanceof SVGElement) {
    if (shouldHide) {
      el.style.setProperty('display', 'none', 'important');
    } else {
      el.style.removeProperty('display');
    }
  }
}

// Checks if an element is part of the custom whiteboard / drawing toolbar
export function isDrawingToolbarElement(el: Element): boolean {
  let current: Element | null = el;
  while (current && current !== document.body) {
    const className = (current.getAttribute('class') || '').toLowerCase();
    const id = (current.id || '').toLowerCase();

    if (className.includes('dashboard') || id.includes('dashboard') || className.includes('page-manager')) {
      return false;
    }
    if (/canvas|draw|paint|board|palette/i.test(className + ' ' + id)) {
      return true;
    }
    current = (current.parentNode as Element) || ((current as any).host as Element);
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
  if (!el) return null;
  let current: Element | null = el;
  while (current && current !== document.body) {
    const tagName = current.tagName.toLowerCase();
    const role = current.getAttribute('role');
    const className = current.getAttribute('class') || '';

    if (
      tagName === 'button' ||
      role === 'button' ||
      className.includes('btn') ||
      className.includes('button') ||
      className.includes('control')
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return el;
}

// Find settings button recursively, piercing Shadow DOMs and ignoring drawing boards
export function findSettingsButton(): Element | null {
  if (cachedSettingsBtn && (cachedSettingsBtn as any).isConnected) {
    return cachedSettingsBtn;
  }
  const video = getActiveVideo();
  if (!video) return null;

  const exact = document.getElementById('setting-icon');
  if (exact) {
    cachedSettingsBtn = exact;
    return exact;
  }

  const playerContainer =
    document.getElementById('video-player-container') ||
    video.closest('.video-player-app') ||
    video.parentElement;
  if (!playerContainer) return null;

  const el = playerContainer.querySelector(
    '[class*="setting" i], [id*="setting" i], [title*="setting" i], ' +
      '[class*="gear" i], [class*="config" i], [class*="quality" i]'
  );
  if (el) {
    const btn = getControlButton(el);
    if (btn && !isDrawingToolbarElement(btn)) {
      cachedSettingsBtn = btn;
      return btn;
    }
  }

  const found = scanShadowForSettings(playerContainer);
  if (found) {
    cachedSettingsBtn = found;
  }
  return found;
}

export function scanShadowForSettings(root: Document | Element | ShadowRoot): Element | null {
  const allElements = root.querySelectorAll('*');
  for (let i = 0; i < allElements.length; i++) {
    const item = allElements[i];
    if (item.shadowRoot) {
      const el = item.shadowRoot.querySelector(
        '[class*="setting" i], [id*="setting" i], [title*="setting" i], ' +
          '[class*="gear" i], [class*="config" i], [class*="quality" i]'
      );
      if (el && !isDrawingToolbarElement(el)) return getControlButton(el);
      const found = scanShadowForSettings(item.shadowRoot);
      if (found) return found;
    }
  }
  return null;
}

// Find fullscreen button recursively, piercing Shadow DOMs and ignoring drawing boards
export function findFullscreenButton(): Element | null {
  if (cachedFullscreenBtn && (cachedFullscreenBtn as any).isConnected) {
    return cachedFullscreenBtn;
  }
  const video = getActiveVideo();
  if (!video) return null;

  const settingsBtn = findSettingsButton();
  if (settingsBtn) {
    const settingsWrapper = settingsBtn.closest('.flex-col') || (settingsBtn.parentNode && settingsBtn.parentNode.parentNode);
    if (settingsWrapper && (settingsWrapper as Element).nextElementSibling) {
      const fsSvg = (settingsWrapper as Element).nextElementSibling?.querySelector('svg');
      if (fsSvg) {
        cachedFullscreenBtn = fsSvg;
        return fsSvg;
      }
    }
  }

  const playerContainer =
    document.getElementById('video-player-container') ||
    video.closest('.video-player-app') ||
    video.parentElement;
  if (!playerContainer) return null;

  const el = playerContainer.querySelector(
    '[class*="fullscreen" i], [id*="fullscreen" i], [title*="fullscreen" i], ' +
      '[class*="full-screen" i], [id*="full-screen" i], [title*="full-screen" i]'
  );
  if (el) {
    const btn = getControlButton(el);
    if (btn && !isDrawingToolbarElement(btn)) {
      cachedFullscreenBtn = btn;
      return btn;
    }
  }

  const found = scanShadowForFullscreen(playerContainer);
  if (found) {
    cachedFullscreenBtn = found;
  }
  return found;
}

export function scanShadowForFullscreen(root: Document | Element | ShadowRoot): Element | null {
  const allElements = root.querySelectorAll('*');
  for (let i = 0; i < allElements.length; i++) {
    const item = allElements[i];
    if (item.shadowRoot) {
      const el = item.shadowRoot.querySelector(
        '[class*="fullscreen" i], [id*="fullscreen" i], [title*="fullscreen" i], ' +
          '[class*="full-screen" i], [id*="full-screen" i], [title*="full-screen" i]'
      );
      if (el && !isDrawingToolbarElement(el)) return getControlButton(el);
      const found = scanShadowForFullscreen(item.shadowRoot);
      if (found) return found;
    }
  }
  return null;
}

// Helper to traverse up from a control button and find the actual main toolbar container
export function getToolbarContainer(el: Element | null): Element | null {
  if (!el) return null;
  let current: Element | null = el;
  while (current && current !== document.body) {
    const parentNode: Element | null = current.parentElement;
    if (parentNode) {
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
    cachedNativeSpeedBadges &&
    cachedNativeSpeedBadges.length > 0 &&
    cachedNativeSpeedBadges.every((el) => (el as any).isConnected)
  ) {
    return cachedNativeSpeedBadges;
  }
  const video = getActiveVideo();
  if (!video) return [];

  const playerContainer =
    document.getElementById('video-player-container') ||
    video.closest('.video-player-app') ||
    video.parentElement;
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

// Identify the category of any matched distractor element using structural attributes
export function getDistractorType(el: Element): string | null {
  const className = (el.getAttribute('class') || '').toLowerCase();
  const id = (el.id || '').toLowerCase();
  const title = (el.getAttribute('title') || '').toLowerCase();
  const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();

  // Safety check: Never match the dashboard or main page manager layouts
  if (className.includes('dashboard') || id.includes('dashboard') || className.includes('page-manager')) {
    return null;
  }

  // Structural attributes are safe to match broadly
  const attrs = `${className} ${id} ${title} ${ariaLabel}`;

  // Only use textContent for leaf elements (no children) to avoid matching nested junk
  const isLeaf = el.children.length === 0;
  const leafText = isLeaf ? (el.textContent || '').trim().toLowerCase() : '';

  // 1. Ask AI feature
  if (attrs.includes('ask ai') || attrs.includes('askai') || attrs.includes('ask-ai') || /\bai\b/.test(attrs)) {
    return 'askai';
  }
  if (leafText === 'ask ai') return 'askai';

  // 2. Notes / Study materials — PW Live uses title="Add note" on its notes button
  if (/\bnote(s)?\b/.test(attrs) || attrs.includes('study') || attrs.includes('pdf') || attrs.includes('attachment')) {
    return 'notes';
  }
  if (isLeaf && (leafText === 'notes' || leafText === 'study notes' || leafText === 'add note')) return 'notes';

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
  if (!className.includes('progress') && !className.includes('play-progress') && !id.includes('video-progress')) {
    if (className.includes('timeline') || id.includes('timeline') || title.includes('timeline') || ariaLabel.includes('timeline')) {
      return 'notetimeline';
    }
  }

  return null;
}

// Helper to check the element and its shallow children for classification (2 levels deep)
export function checkElementOrChildType(el: Element): string | null {
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
  if (fRight) return fRight;

  const video = getActiveVideo();
  if (!video) return null;

  const root = (video.getRootNode && (video.getRootNode() as Document | ShadowRoot)) || document;
  const playerContainer =
    document.getElementById('video-player-container') ||
    video.closest('.video-player-app') ||
    video.closest('[class*="video-player" i]') ||
    video.closest('[class*="player" i]') ||
    video.parentElement ||
    (root instanceof Element ? root : null);

  if (!playerContainer || !playerContainer.querySelectorAll) return null;

  // Scan all containers holding 3 or more control buttons/icons near the bottom of the player
  const candidates = Array.from(playerContainer.querySelectorAll('div, section, footer, nav'));
  const toolbars = candidates.filter((div) => {
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
    return getToolbarContainer(refBtn);
  }

  return null;
}

// Helper to find the video timeline progress bar
export function findTimeline(): Element | null {
  if (cachedTimeline && (cachedTimeline as any).isConnected) {
    return cachedTimeline;
  }
  const video = getActiveVideo();
  if (!video) return null;
  const playerContainer =
    document.getElementById('video-player-container') ||
    video.closest('.video-player-app') ||
    video.parentElement;
  if (!playerContainer) return null;
  const el = playerContainer.querySelector(
    '.vjs-progress-control, .vjs-progress-holder, ' +
      '[class*="progress-control" i], [class*="progress-bar" i], ' +
      '[class*="seekbar" i], [class*="seek-bar" i]'
  );
  if (el) {
    const className = el.getAttribute('class') || '';
    if (className.includes('pwc-')) return null;
    cachedTimeline = el;
    return el;
  }
  return null;
}

// Helper to find video time and duration texts
export function findTimeTexts(): Element[] {
  if (
    cachedTimeTexts &&
    cachedTimeTexts.length > 0 &&
    cachedTimeTexts.every((el) => (el as any).isConnected)
  ) {
    return cachedTimeTexts;
  }
  const video = getActiveVideo();
  if (!video) return [];
  const playerContainer =
    document.getElementById('video-player-container') ||
    video.closest('.video-player-app') ||
    video.parentElement;
  if (!playerContainer) return [];

  const elements = playerContainer.querySelectorAll(
    '.vjs-current-time, .vjs-duration, .vjs-time-divider, .vjs-remaining-time, .vjs-time-control, ' +
      '[class*="time-display" i], [class*="time-text" i], ' +
      '[class*="current-time" i], [class*="duration" i], [class*="video-time" i], ' +
      '.current-time, .duration, .time-display, .time-text'
  );

  const list = Array.from(elements).filter((el) => {
    // 1. Exclude our own extension's speedometer UI elements
    const className = el.getAttribute('class') || '';
    const id = el.id || '';
    if (className.includes('pwc-') || id.includes('pwc-')) {
      return false;
    }

    // 2. Exclude elements that contain interactive buttons or SVGs
    if (el.querySelector('button') || el.querySelector('svg') || el.querySelector('[role="button"]')) {
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
      if (text === '/' || text === '|' || text === '-') {
        if (shouldHide) {
          if ((node as any).originalText === undefined) {
            (node as any).originalText = node.textContent;
          }
          node.textContent = '';
        } else {
          if ((node as any).originalText !== undefined) {
            node.textContent = (node as any).originalText;
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
