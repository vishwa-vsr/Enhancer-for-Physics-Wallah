import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { getOuterPlayerContainer, triggerPlayerSlot } from '../distractions/elements';

const MODAL_ID = 'pwc-slide-viewer-modal';
const ACTION_BADGE_CLASS = 'pwc-slide-actions';

export interface SlideItem {
  index: number;
  element: HTMLElement;
  slideId: string;
  label: string;
  slideNumber: number;
  imageUrl: string;
}

let activeModal: HTMLElement | null = null;
let currentSlideIndex = 0;
let cachedSlides: SlideItem[] = [];
let keydownListener: ((e: KeyboardEvent) => void) | null = null;
let videoListenerCleanup: (() => void) | null = null;
let timelineObserver: MutationObserver | null = null;
let watchedTimelineWrapper: HTMLElement | null = null;
let scrollListenerCleanup: (() => void) | null = null;

// Whiteboard Study Tool state (Zoom, Pan, Rotate)
let currentZoom = 1.0;
let currentRotation = 0;
let panX = 0;
let panY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let hasMoved = false;
let clickTimeout: ReturnType<typeof setTimeout> | null = null;
let activeMouseMoveListener: ((e: MouseEvent) => void) | null = null;
let activeMouseUpListener: (() => void) | null = null;

function cleanupDragListeners(): void {
  if (activeMouseMoveListener) {
    window.removeEventListener('mousemove', activeMouseMoveListener);
    activeMouseMoveListener = null;
  }
  if (activeMouseUpListener) {
    window.removeEventListener('mouseup', activeMouseUpListener);
    activeMouseUpListener = null;
  }
  if (clickTimeout) {
    clearTimeout(clickTimeout);
    clickTimeout = null;
  }
}

export function disconnectTimelineWatcher(): void {
  if (timelineObserver) {
    timelineObserver.disconnect();
    timelineObserver = null;
  }
  if (scrollListenerCleanup) {
    scrollListenerCleanup();
    scrollListenerCleanup = null;
  }
  watchedTimelineWrapper = null;
}

function setupTimelineWatcher(): void {
  const wrapper = document.getElementById('timeline-wrapper');
  if (!wrapper || !wrapper.isConnected) {
    disconnectTimelineWatcher();
    return;
  }

  if (watchedTimelineWrapper === wrapper) {
    return;
  }

  disconnectTimelineWatcher();
  watchedTimelineWrapper = wrapper;

  // 1. Passive scroll listener for lazy-loaded slide cards during scrolling
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  const onScroll = () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
      scrollTimeout = null;
      syncTimelineSlideActions();
    }, 60);
  };
  wrapper.addEventListener('scroll', onScroll, { passive: true });
  scrollListenerCleanup = () => {
    wrapper.removeEventListener('scroll', onScroll);
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
      scrollTimeout = null;
    }
  };

  // 2. Direct MutationObserver on timeline-wrapper for immediate injection as cards mount
  timelineObserver = new MutationObserver((mutations) => {
    let hasNewSlide = false;
    for (let i = 0; i < mutations.length; i++) {
      const m = mutations[i];
      if (m.addedNodes.length > 0) {
        for (let j = 0; j < m.addedNodes.length; j++) {
          const node = m.addedNodes[j] as HTMLElement;
          if (
            node.nodeType === 1 &&
            !node.classList?.contains(ACTION_BADGE_CLASS) &&
            !node.querySelector?.(`.${ACTION_BADGE_CLASS}`)
          ) {
            hasNewSlide = true;
            break;
          }
        }
      }
      if (hasNewSlide) break;
    }
    if (hasNewSlide) {
      syncTimelineSlideActions();
    }
  });

  timelineObserver.observe(wrapper, {
    childList: true,
    subtree: true,
  });
}

// Clean and sanitize lecture title for cross-platform safe file names
export function getSanitizedLectureTitle(): string {
  let raw = '';
  const titleEl = document.querySelector(
    'h1, .video-title, [data-testid="lecture-title"], .player-header h4, .player-header span',
  );
  if (titleEl && titleEl.textContent?.trim()) {
    raw = titleEl.textContent.trim();
  } else if (document.title && !document.title.toLowerCase().includes('pw video player')) {
    raw = document.title.replace(/\|.*$/, '').replace(/- Physics Wallah.*$/i, '').trim();
  }

  if (!raw || raw.toLowerCase().includes('video player')) {
    raw = 'PW';
  }

  // Strip forbidden filename characters on Windows/Linux/Mac: \ / : * ? " < > |
  const clean = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .trim();

  return clean.slice(0, 45) || 'PW';
}

// Extract background-image URL or data-URI from a slide card
export function extractSlideImageUrl(card: HTMLElement): string | null {
  const bg = card.style.backgroundImage || window.getComputedStyle(card).backgroundImage;
  if (!bg || bg === 'none') return null;
  const match = bg.match(/url\((['"]?)(.*?)\1\)/i);
  return match && match[2] ? match[2] : null;
}

// Extract slide number from card label (e.g. "Slide No. 4" -> 4)
function extractSlideNumber(card: HTMLElement, fallbackIndex: number): number {
  const text = card.textContent || '';
  const match = text.match(/slide\s*(?:no\.?)?\s*(\d+)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num)) return num;
  }
  return fallbackIndex + 1;
}

// 1-Click download helper supporting both data URIs and external CDN URLs
export function downloadSlideImage(imageUrl: string, filename: string): void {
  if (!imageUrl) {
    // eslint-disable-next-line no-console
    console.warn('[PW Control] No image URL found to download.');
    return;
  }

  if (imageUrl.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  fetch(imageUrl)
    .then((res) => res.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('[PW Control] Fetch download failed, falling back to direct anchor:', err);
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
}

// Collect all slide cards currently loaded in the timeline
export function queryAllSlideCards(): SlideItem[] {
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>(
      '#timeline-wrapper [id^="timeline-"]:not(#timeline-wrapper), #timeline-wrapper [data-slide-id]',
    ),
  ).filter((el) => {
    return el.id !== 'timeline-wrapper' && !el.classList.contains('pwc-slide-actions');
  });

  return cards.map((el, idx) => {
    const slideNumber = extractSlideNumber(el, idx);
    const imageUrl = extractSlideImageUrl(el) || '';
    return {
      index: idx,
      element: el,
      slideId: el.getAttribute('data-slide-id') || el.id || `slide-${idx}`,
      label: `Slide No. ${slideNumber}`,
      slideNumber,
      imageUrl,
    };
  });
}

// Locate currently active slide card based on PW white badge or active class
export function findActiveSlideIndex(cards: SlideItem[]): number {
  if (cards.length === 0) return 0;
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i].element;
    const cardClass = card.className || '';
    if (cardClass.includes('bg-[#9387FF]')) {
      return i;
    }
    const nativeBadge =
      card.querySelector('[class*="bottom-0"][class*="left-0"]') || card.querySelector('div');
    if (nativeBadge) {
      const cls = nativeBadge.className || '';
      const style = nativeBadge.getAttribute('style') || '';
      if (
        cls.includes('bg-[#ffffff]') ||
        cls.includes('bg-white') ||
        style.includes('255, 255, 255')
      ) {
        return i;
      }
    }
  }
  return 0;
}

// SVG Icons
const SVG_DOWNLOAD = `
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
  <polyline points="7 10 12 15 17 10"></polyline>
  <line x1="12" y1="15" x2="12" y2="3"></line>
</svg>`;

const SVG_ENLARGE = `
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="15 3 21 3 21 9"></polyline>
  <polyline points="9 21 3 21 3 15"></polyline>
  <line x1="21" y1="3" x2="14" y2="10"></line>
  <line x1="3" y1="21" x2="10" y2="14"></line>
</svg>`;

const SVG_PLAY = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  <polygon points="5 3 19 12 5 21 5 3"></polygon>
</svg>`;

const SVG_PAUSE = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  <rect x="6" y="4" width="4" height="16"></rect>
  <rect x="14" y="4" width="4" height="16"></rect>
</svg>`;

const SVG_PREV = `
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="15 18 9 12 15 6"></polyline>
</svg>`;

const SVG_NEXT = `
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="9 18 15 12 9 6"></polyline>
</svg>`;

const SVG_CLOSE = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;

const SVG_ROTATE = `
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="23 4 23 10 17 10"></polyline>
  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
</svg>`;

const SVG_ZOOM_IN = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="12" y1="5" x2="12" y2="19"></line>
  <line x1="5" y1="12" x2="19" y2="12"></line>
</svg>`;

const SVG_ZOOM_OUT = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="5" y1="12" x2="19" y2="12"></line>
</svg>`;

const SVG_SYNC_VIDEO = `
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="6 4 17 12 6 20 6 4" fill="currentColor"></polygon>
  <line x1="18" y1="4" x2="18" y2="20" stroke-width="2.5"></line>
</svg>`;

// Inject [ ⤢ ] enlarge-only badge onto every slide card in the timeline sidebar
export function syncTimelineSlideActions(): void {
  if (!state.extensionEnabled || !state.enableSlideViewer) {
    removeAllSlideActions();
    closeSlideViewer();
    disconnectTimelineWatcher();
    return;
  }

  setupTimelineWatcher();

  const cards = queryAllSlideCards();
  if (cards.length === 0) return;

  cards.forEach((item) => {
    const card = item.element;
    const existingBadge = card.querySelector(`.${ACTION_BADGE_CLASS}`) as HTMLElement | null;
    const nativeBadge =
      card.querySelector('[class*="bottom-0"][class*="left-0"]') || card.querySelector('div');
    const isNativeWhite =
      nativeBadge &&
      (nativeBadge.classList.contains('bg-[#ffffff]') ||
        nativeBadge.classList.contains('bg-white') ||
        (nativeBadge.getAttribute('style') || '').includes('255, 255, 255'));

    if (existingBadge) {
      existingBadge.classList.toggle('pwc-badge-active', !!isNativeWhite);
      existingBadge.classList.toggle('pwc-badge-inactive', !isNativeWhite);
      return;
    }

    // Badge styled matching native bottom-left badge, positioned at bottom-right
    const badge = document.createElement('div');
    badge.className = `${ACTION_BADGE_CLASS} pwc-slide-actions-badge`;
    badge.classList.toggle('pwc-badge-active', !!isNativeWhite);
    badge.classList.toggle('pwc-badge-inactive', !isNativeWhite);
    badge.setAttribute('data-pwc-injected', 'true');

    // Single Enlarge Button (per Issue #15 user request)
    const enlargeBtn = document.createElement('button');
    enlargeBtn.type = 'button';
    enlargeBtn.className = 'pwc-slide-card-action-btn pwc-slide-card-enlarge';
    const shortcutKey = (state.keySlideViewer || 't').toUpperCase();
    enlargeBtn.title = `Current slide in fullscreen (Shift+${shortcutKey})`;
    enlargeBtn.setAttribute('aria-label', `Enlarge Slide ${item.slideNumber}`);
    enlargeBtn.innerHTML = SVG_ENLARGE;

    enlargeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      openSlideViewer(item.index);
    });

    badge.appendChild(enlargeBtn);

    // Stop click events on badge from seeking the video
    badge.addEventListener('click', (e) => e.stopPropagation());
    badge.addEventListener('mousedown', (e) => e.stopPropagation());

    card.appendChild(badge);
  });
}

export function removeAllSlideActions(): void {
  const badges = document.querySelectorAll(`.${ACTION_BADGE_CLASS}`);
  badges.forEach((b) => b.remove());
  disconnectTimelineWatcher();
}

// Reset Zoom, Rotation and Pan
function resetAllTransform(): void {
  currentZoom = 1.0;
  currentRotation = 0;
  panX = 0;
  panY = 0;
  isDragging = false;
  hasMoved = false;
  applyImageTransform();
}

function resetZoomAndPan(): void {
  currentZoom = 1.0;
  panX = 0;
  panY = 0;
  isDragging = false;
  hasMoved = false;
  applyImageTransform();
}

function applyImageTransform(): void {
  if (!activeModal) return;
  const img = activeModal.querySelector<HTMLImageElement>('.pwc-slide-img');
  const wrapper = activeModal.querySelector<HTMLElement>('.pwc-slide-img-wrapper');
  const resetBtnText = activeModal.querySelector<HTMLElement>('.pwc-slide-zoom-val');

  if (img) {
    img.style.transition = isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)';
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom}) rotate(${currentRotation}deg)`;
  }

  if (wrapper) {
    if (currentZoom > 1.0) {
      wrapper.style.cursor = isDragging ? 'grabbing' : 'grab';
    } else {
      wrapper.style.cursor = 'default';
    }
  }

  if (resetBtnText) {
    resetBtnText.textContent = `${Math.round(currentZoom * 100)}%`;
  }
}

function handleZoom(delta: number): void {
  const newZoom = Math.min(5.0, Math.max(0.1, Math.round((currentZoom + delta) * 100) / 100));
  if (Math.abs(newZoom - currentZoom) < 0.01) return;
  currentZoom = newZoom;
  if (currentZoom <= 1.0) {
    panX = 0;
    panY = 0;
  }
  applyImageTransform();
}

function handleRotate(): void {
  currentRotation = (currentRotation + 90) % 360;
  applyImageTransform();
}

// Open the Enlarged Pop-up Modal at a given slide index
export function openSlideViewer(targetIndex: number): void {
  cachedSlides = queryAllSlideCards();
  if (cachedSlides.length === 0) return;

  currentSlideIndex = Math.max(0, Math.min(targetIndex, cachedSlides.length - 1));
  resetAllTransform();

  let modal = document.getElementById(MODAL_ID);
  if (!modal) {
    modal = createSlideViewerModal();
    const host =
      document.fullscreenElement || getOuterPlayerContainer() || document.body;
    host.appendChild(modal);
    activeModal = modal;
  }

  updateModalSlideView();
  bindModalEventListeners();
}

// Jump straight to active slide in fullscreen (even if timeline is closed)
export function openActiveSlideViewer(): void {
  if (!state.extensionEnabled || !state.enableSlideViewer) return;

  const cards = queryAllSlideCards();
  if (cards.length === 0) {
    // Drawer might be closed. Trigger timeline panel to load cards
    triggerPlayerSlot('notetimeline');
    setTimeout(() => {
      syncTimelineSlideActions();
      const updatedCards = queryAllSlideCards();
      if (updatedCards.length > 0) {
        const activeIdx = findActiveSlideIndex(updatedCards);
        openSlideViewer(activeIdx);
      }
    }, 120);
    return;
  }

  const activeIdx = findActiveSlideIndex(cards);
  openSlideViewer(activeIdx);
}

// Create Modal DOM hierarchy
function createSlideViewerModal(): HTMLElement {
  const modal = document.createElement('div');
  modal.id = MODAL_ID;
  modal.className = 'pwc-slide-viewer-modal';

  modal.innerHTML = `
    <div class="pwc-slide-viewer-backdrop"></div>
    <div class="pwc-slide-viewer-container" role="dialog" aria-modal="true" aria-label="Slide Viewer">
      <!-- Main Slide Image Box -->
      <div class="pwc-slide-box">
        <!-- Top Control Bar -->
        <div class="pwc-slide-top-bar">
          <div class="pwc-slide-bar-left">
            <!-- Play/Pause Toggle -->
            <button type="button" class="pwc-slide-btn pwc-slide-play-pause-btn" title="Pause / Play Video (Space)" aria-label="Toggle Video Playback">
              <span class="pwc-slide-btn-icon">${SVG_PAUSE}</span>
            </button>

            <!-- Sync Video to Slide -->
            <button type="button" class="pwc-slide-btn pwc-slide-sync-video-btn" title="Sync video to this slide (S)" aria-label="Sync video to slide">
              <span class="pwc-slide-btn-icon">${SVG_SYNC_VIDEO}</span>
              <span class="pwc-slide-sync-label">Sync Video</span>
            </button>
          </div>

          <div class="pwc-slide-bar-center">
            <!-- Previous Slide Button -->
            <button type="button" class="pwc-slide-btn pwc-slide-prev-btn" title="Previous Slide (Left Arrow)" aria-label="Previous Slide">
              ${SVG_PREV}
            </button>

            <!-- Direct Jump Input Box: Slide [ 4 ] / 18 -->
            <div class="pwc-slide-jump-box" title="Type a slide number and press Enter to jump">
              <span class="pwc-slide-jump-prefix">Slide</span>
              <input type="number" class="pwc-slide-number-input" min="1" max="1" value="1" aria-label="Slide Number Input" />
              <span class="pwc-slide-total-count">/ 1</span>
            </div>

            <!-- Next Slide Button -->
            <button type="button" class="pwc-slide-btn pwc-slide-next-btn" title="Next Slide (Right Arrow)" aria-label="Next Slide">
              ${SVG_NEXT}
            </button>
          </div>

          <div class="pwc-slide-bar-right">
            <!-- Whiteboard Rotate 90° -->
            <button type="button" class="pwc-slide-btn pwc-slide-rotate-btn" title="Rotate 90° clockwise (R)" aria-label="Rotate 90 degrees">
              ${SVG_ROTATE}
            </button>

            <!-- Whiteboard Zoom Controls -->
            <div class="pwc-slide-zoom-group">
              <button type="button" class="pwc-slide-btn pwc-slide-zoom-btn pwc-slide-zoom-out-btn" title="Zoom Out (- or Scroll down)" aria-label="Zoom Out">
                ${SVG_ZOOM_OUT}
              </button>
              <button type="button" class="pwc-slide-btn pwc-slide-zoom-btn pwc-slide-zoom-reset-btn" title="Reset Zoom (0)" aria-label="Reset Zoom">
                <span class="pwc-slide-zoom-val">100%</span>
              </button>
              <button type="button" class="pwc-slide-btn pwc-slide-zoom-btn pwc-slide-zoom-in-btn" title="Zoom In (+ or Scroll up)" aria-label="Zoom In">
                ${SVG_ZOOM_IN}
              </button>
            </div>

            <!-- Download Button -->
            <button type="button" class="pwc-slide-btn pwc-slide-download-action-btn" title="Download slide PNG (D)" aria-label="Download slide">
              ${SVG_DOWNLOAD}
            </button>

            <!-- Close Button -->
            <button type="button" class="pwc-slide-btn pwc-slide-close-action-btn" title="Close (Esc or Right-Click backdrop)" aria-label="Close Slide Viewer">
              ${SVG_CLOSE}
            </button>
          </div>
        </div>

        <!-- Slide Image Wrapper with Pan & Zoom canvas -->
        <div class="pwc-slide-img-wrapper">
          <img class="pwc-slide-img" src="" alt="Lecture Slide" draggable="false" />
        </div>
      </div>
    </div>
  `;

  // Quick-Exit Backdrop Handlers (Left-click & Right-click)
  const backdrop = modal.querySelector('.pwc-slide-viewer-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => closeSlideViewer());
  }

  // Right-click anywhere on backdrop or margins outside buttons to immediately exit
  modal.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.pwc-slide-top-bar')) {
      return; // Allow standard behavior on top bar buttons
    }
    e.preventDefault();
    e.stopPropagation();
    closeSlideViewer();
  });

  const closeBtn = modal.querySelector('.pwc-slide-close-action-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeSlideViewer());
  }

  // Prev / Next Bottom Navigation
  const prevBtn = modal.querySelector('.pwc-slide-prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentSlideIndex - 1);
    });
  }

  const nextBtn = modal.querySelector('.pwc-slide-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentSlideIndex + 1);
    });
  }

  // Direct Slide Jump Input
  const jumpInput = modal.querySelector<HTMLInputElement>('.pwc-slide-number-input');
  if (jumpInput) {
    const submitJump = () => {
      const val = parseInt(jumpInput.value, 10);
      if (!isNaN(val) && val >= 1 && val <= cachedSlides.length) {
        goToSlide(val - 1);
      } else {
        jumpInput.value = String(currentSlideIndex + 1);
      }
    };

    jumpInput.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        submitJump();
        jumpInput.blur();
      } else if (e.key === 'Escape') {
        jumpInput.value = String(currentSlideIndex + 1);
        jumpInput.blur();
      }
    });

    jumpInput.addEventListener('change', submitJump);
    jumpInput.addEventListener('focus', () => jumpInput.select());
  }

  // Play / Pause Video button
  const playPauseBtn = modal.querySelector('.pwc-slide-play-pause-btn');
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleVideoPlayback();
    });
  }

  // Sync Video Button
  const syncBtn = modal.querySelector('.pwc-slide-sync-video-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      jumpVideoToCurrentSlide();
    });
  }

  // Rotate Button
  const rotateBtn = modal.querySelector('.pwc-slide-rotate-btn');
  if (rotateBtn) {
    rotateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleRotate();
    });
  }

  // Zoom Buttons
  const zoomInBtn = modal.querySelector('.pwc-slide-zoom-in-btn');
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleZoom(currentZoom < 1.0 ? 0.15 : 0.25);
    });
  }

  const zoomOutBtn = modal.querySelector('.pwc-slide-zoom-out-btn');
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleZoom(currentZoom <= 1.0 ? -0.15 : -0.25);
    });
  }

  const zoomResetBtn = modal.querySelector('.pwc-slide-zoom-reset-btn');
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetZoomAndPan();
    });
  }

  // Download Button
  const downloadBtn = modal.querySelector('.pwc-slide-download-action-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadCurrentSlide();
    });
  }

  // Interactive Whiteboard Canvas: Wheel Zoom + Drag Pan
  const imgWrapper = modal.querySelector<HTMLElement>('.pwc-slide-img-wrapper');
  if (imgWrapper) {
    // Mouse wheel & trackpad zoom
    imgWrapper.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        let delta: number;
        if (Math.abs(e.deltaY) < 40) {
          // Trackpad or smooth wheel
          delta = -e.deltaY * 0.005;
        } else {
          // Physical mouse wheel notch
          const step = currentZoom <= 1.0 ? 0.15 : 0.25;
          delta = e.deltaY < 0 ? step : -step;
        }
        handleZoom(delta);
      },
      { passive: false },
    );

    // Double-click toggle (100% <-> 200%) & debounced click-to-exit on backdrop margin
    imgWrapper.addEventListener('click', (e) => {
      if (hasMoved) return;
      if (e.target === imgWrapper) {
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }
        clickTimeout = setTimeout(() => {
          clickTimeout = null;
          closeSlideViewer();
        }, 220);
      }
    });

    imgWrapper.addEventListener('dblclick', (e) => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
      e.preventDefault();
      e.stopPropagation();
      if (currentZoom > 1.05) {
        resetZoomAndPan();
      } else {
        currentZoom = 2.0;
        panX = 0;
        panY = 0;
        applyImageTransform();
      }
    });

    // Drag-to-pan when zoomed in (dynamically binds window mousemove/mouseup only during active drag)
    imgWrapper.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Only primary button
      isDragging = true;
      hasMoved = false;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
      applyImageTransform();

      cleanupDragListeners();

      activeMouseMoveListener = (moveEvt: MouseEvent) => {
        if (!isDragging || !activeModal) return;
        const newPanX = moveEvt.clientX - startX;
        const newPanY = moveEvt.clientY - startY;
        if (Math.abs(newPanX - panX) > 2 || Math.abs(newPanY - panY) > 2) {
          hasMoved = true;
        }
        if (currentZoom > 1.0) {
          panX = newPanX;
          panY = newPanY;
          applyImageTransform();
        }
      };

      activeMouseUpListener = () => {
        if (!isDragging) return;
        isDragging = false;
        applyImageTransform();
        cleanupDragListeners();
      };

      window.addEventListener('mousemove', activeMouseMoveListener);
      window.addEventListener('mouseup', activeMouseUpListener);
    });
  }

  return modal;
}

// Update modal contents for the currently selected slide index
function updateModalSlideView(): void {
  if (!activeModal || cachedSlides.length === 0) return;

  const currentItem = cachedSlides[currentSlideIndex];
  if (!currentItem) return;

  // Refresh latest image URL from DOM in case it lazy-loaded
  const liveUrl = extractSlideImageUrl(currentItem.element) || currentItem.imageUrl;
  currentItem.imageUrl = liveUrl;

  const img = activeModal.querySelector<HTMLImageElement>('.pwc-slide-img');
  if (img) {
    img.src = liveUrl;
    img.alt = `Slide ${currentItem.slideNumber}`;
  }

  // Update Direct Jump Input
  const jumpInput = activeModal.querySelector<HTMLInputElement>('.pwc-slide-number-input');
  if (jumpInput) {
    jumpInput.value = String(currentItem.slideNumber);
    jumpInput.max = String(cachedSlides.length);
  }

  const totalCount = activeModal.querySelector('.pwc-slide-total-count');
  if (totalCount) {
    totalCount.textContent = `/ ${cachedSlides.length}`;
  }

  // Update Prev / Next button states
  const prevBtn = activeModal.querySelector<HTMLButtonElement>('.pwc-slide-prev-btn');
  if (prevBtn) {
    prevBtn.disabled = currentSlideIndex <= 0;
  }

  const nextBtn = activeModal.querySelector<HTMLButtonElement>('.pwc-slide-next-btn');
  if (nextBtn) {
    nextBtn.disabled = currentSlideIndex >= cachedSlides.length - 1;
  }

  syncPlayPauseIcon();
}

function goToSlide(targetIdx: number): void {
  if (targetIdx < 0 || targetIdx >= cachedSlides.length) return;
  currentSlideIndex = targetIdx;
  resetAllTransform();
  updateModalSlideView();
}

// Toggle Video Playback from inside the viewer
function toggleVideoPlayback(): void {
  const video = getActiveVideo();
  if (!video) return;

  if (video.paused) {
    try {
      const playPromise = video.play();
      if (playPromise !== undefined && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Playback auto-play policy may reject; ignore silently
        });
      }
    } catch {
      // Ignore playback errors
    }
  } else {
    video.pause();
  }
  syncPlayPauseIcon();
}

// Keep Play/Pause icon in sync with native video state
function syncPlayPauseIcon(): void {
  if (!activeModal) return;
  const video = getActiveVideo();
  const iconContainer = activeModal.querySelector('.pwc-slide-play-pause-btn .pwc-slide-btn-icon');
  const btn = activeModal.querySelector<HTMLButtonElement>('.pwc-slide-play-pause-btn');
  if (!iconContainer || !btn) return;

  const isPaused = !video || video.paused;
  iconContainer.innerHTML = isPaused ? SVG_PLAY : SVG_PAUSE;
  btn.title = isPaused ? 'Play Video (Space)' : 'Pause Video (Space)';
  btn.setAttribute('aria-label', isPaused ? 'Play Video' : 'Pause Video');
}

// Jump video to this slide while preserving paused/playing state
function jumpVideoToCurrentSlide(): void {
  if (cachedSlides.length === 0) return;
  const currentItem = cachedSlides[currentSlideIndex];
  if (!currentItem || !currentItem.element) return;

  const video = getActiveVideo();
  const wasPaused = video ? video.paused : false;

  // Simulate click on native timeline card to seek video
  currentItem.element.click();

  // If the user had paused the video to study in peace, ensure it remains paused
  if (wasPaused && video) {
    setTimeout(() => {
      if (!video.paused) {
        video.pause();
        syncPlayPauseIcon();
      }
    }, 60);
  }
}

// Download the currently viewed slide
function downloadCurrentSlide(): void {
  if (cachedSlides.length === 0) return;
  const currentItem = cachedSlides[currentSlideIndex];
  if (!currentItem) return;

  const liveUrl = extractSlideImageUrl(currentItem.element) || currentItem.imageUrl;
  const title = getSanitizedLectureTitle();
  const filename = `${title}_Slide_${String(currentItem.slideNumber).padStart(2, '0')}.png`;
  downloadSlideImage(liveUrl, filename);
}

// Bind keyboard shortcuts & video listeners when modal is open
function bindModalEventListeners(): void {
  unbindModalEventListeners();

  keydownListener = (e: KeyboardEvent) => {
    if (!activeModal) return;

    // If typing in the slide number input, don't hijack keys
    const target = e.target as HTMLElement | null;
    if (target && target.tagName === 'INPUT') {
      if (e.key === 'Escape') {
        target.blur();
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.stopPropagation();
      e.preventDefault();
      goToSlide(currentSlideIndex - 1);
      return;
    }

    if (e.key === 'ArrowRight') {
      e.stopPropagation();
      e.preventDefault();
      goToSlide(currentSlideIndex + 1);
      return;
    }

    if (e.code === 'Space' || e.key === ' ') {
      e.stopPropagation();
      e.preventDefault();
      toggleVideoPlayback();
      return;
    }

    if (e.key === 'Escape') {
      e.stopPropagation();
      e.preventDefault();
      closeSlideViewer();
      return;
    }

    // Whiteboard shortcuts
    if (e.key === '+' || e.key === '=') {
      e.stopPropagation();
      e.preventDefault();
      handleZoom(currentZoom < 1.0 ? 0.15 : 0.25);
      return;
    }

    if (e.key === '-' || e.key === '_') {
      e.stopPropagation();
      e.preventDefault();
      handleZoom(currentZoom <= 1.0 ? -0.15 : -0.25);
      return;
    }

    if (e.key === '0') {
      e.stopPropagation();
      e.preventDefault();
      resetZoomAndPan();
      return;
    }

    if (e.key === 'r' || e.key === 'R') {
      e.stopPropagation();
      e.preventDefault();
      handleRotate();
      return;
    }

    if (e.key === 's' || e.key === 'S') {
      e.stopPropagation();
      e.preventDefault();
      jumpVideoToCurrentSlide();
      return;
    }

    if (e.key === 'd' || e.key === 'D') {
      e.stopPropagation();
      e.preventDefault();
      downloadCurrentSlide();
      return;
    }

    // Stop propagation of other page shortcuts while viewer modal is active
    e.stopPropagation();
  };

  window.addEventListener('keydown', keydownListener, { capture: true });

  const video = getActiveVideo();
  if (video) {
    const onPlay = () => syncPlayPauseIcon();
    const onPause = () => syncPlayPauseIcon();
    const onEnded = () => syncPlayPauseIcon();

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    videoListenerCleanup = () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }
}

function unbindModalEventListeners(): void {
  if (keydownListener) {
    window.removeEventListener('keydown', keydownListener, { capture: true });
    keydownListener = null;
  }
  if (videoListenerCleanup) {
    videoListenerCleanup();
    videoListenerCleanup = null;
  }
}

// Close Slide Viewer
export function closeSlideViewer(): void {
  cleanupDragListeners();
  unbindModalEventListeners();
  resetAllTransform();

  if (activeModal) {
    activeModal.remove();
    activeModal = null;
  }

  const existing = document.getElementById(MODAL_ID);
  if (existing) {
    existing.remove();
  }
}
