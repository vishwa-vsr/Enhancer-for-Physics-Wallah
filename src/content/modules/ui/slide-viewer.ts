import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { getOuterPlayerContainer } from '../distractions/elements';

const MODAL_ID = 'pwc-slide-viewer-modal';
const ACTION_BADGE_CLASS = 'pwc-slide-actions';

interface SlideItem {
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
function queryAllSlideCards(): SlideItem[] {
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>(
      '#timeline-wrapper [id^="timeline-"]:not(#timeline-wrapper), [data-slide-id]',
    ),
  ).filter((el) => {
    // Exclude wrapper itself or non-slide containers
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
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="15 18 9 12 15 6"></polyline>
</svg>`;

const SVG_NEXT = `
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="9 18 15 12 9 6"></polyline>
</svg>`;

const SVG_CLOSE = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;

// Inject [ ⤓ ] and [ ⤢ ] badges onto every slide card in the timeline sidebar
export function syncTimelineSlideActions(): void {
  if (!state.extensionEnabled || !state.enableSlideViewer) {
    removeAllSlideActions();
    closeSlideViewer();
    return;
  }

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

    // Twin badge styled matching the native "Slide No. X" badge at bottom-right
    const badge = document.createElement('div');
    badge.className = `${ACTION_BADGE_CLASS} pwc-slide-actions-badge`;
    badge.classList.toggle('pwc-badge-active', !!isNativeWhite);
    badge.classList.toggle('pwc-badge-inactive', !isNativeWhite);
    badge.setAttribute('data-pwc-injected', 'true');

    // Download Button
    const downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.className = 'pwc-slide-card-action-btn pwc-slide-card-download';
    downloadBtn.title = 'Download slide image (PNG)';
    downloadBtn.setAttribute('aria-label', `Download Slide ${item.slideNumber}`);
    downloadBtn.innerHTML = SVG_DOWNLOAD;

    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const currentUrl = extractSlideImageUrl(card) || item.imageUrl;
      const title = getSanitizedLectureTitle();
      const filename = `${title}_Slide_${String(item.slideNumber).padStart(2, '0')}.png`;
      downloadSlideImage(currentUrl, filename);
    });

    // Enlarge Button
    const enlargeBtn = document.createElement('button');
    enlargeBtn.type = 'button';
    enlargeBtn.className = 'pwc-slide-card-action-btn pwc-slide-card-enlarge';
    enlargeBtn.title = 'Enlarge slide viewer';
    enlargeBtn.setAttribute('aria-label', `Enlarge Slide ${item.slideNumber}`);
    enlargeBtn.innerHTML = SVG_ENLARGE;

    enlargeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      openSlideViewer(item.index);
    });

    badge.appendChild(downloadBtn);
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
}

// Open the Enlarged Pop-up Modal
export function openSlideViewer(targetIndex: number): void {
  cachedSlides = queryAllSlideCards();
  if (cachedSlides.length === 0) return;

  currentSlideIndex = Math.max(0, Math.min(targetIndex, cachedSlides.length - 1));

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

// Create Modal DOM hierarchy matching the user's drawing
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
          </div>

          <div class="pwc-slide-bar-center">
            <!-- Previous Slide Button -->
            <button type="button" class="pwc-slide-btn pwc-slide-prev-btn" title="Previous Slide (Left Arrow)" aria-label="Previous Slide">
              ${SVG_PREV}
            </button>

            <!-- Slide Number & Jump Video Button (without ▶ icon) -->
            <button type="button" class="pwc-slide-btn pwc-slide-jump-btn" title="Click to jump video to this slide" aria-label="Jump video to slide">
              <span class="pwc-slide-number-text">Slide No. 1</span>
            </button>

            <!-- Next Slide Button -->
            <button type="button" class="pwc-slide-btn pwc-slide-next-btn" title="Next Slide (Right Arrow)" aria-label="Next Slide">
              ${SVG_NEXT}
            </button>
          </div>

          <div class="pwc-slide-bar-right">
            <!-- Download Button -->
            <button type="button" class="pwc-slide-btn pwc-slide-download-action-btn" title="Download slide (PNG)" aria-label="Download slide">
              ${SVG_DOWNLOAD}
            </button>

            <!-- Close Button -->
            <button type="button" class="pwc-slide-btn pwc-slide-close-action-btn" title="Close (Esc)" aria-label="Close Slide Viewer">
              ${SVG_CLOSE}
            </button>
          </div>
        </div>

        <!-- Slide Image Wrapper -->
        <div class="pwc-slide-img-wrapper">
          <img class="pwc-slide-img" src="" alt="Lecture Slide" draggable="false" />
        </div>
      </div>
    </div>
  `;

  // Close handlers
  const backdrop = modal.querySelector('.pwc-slide-viewer-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => closeSlideViewer());
  }

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

  // Play / Pause Video button
  const playPauseBtn = modal.querySelector('.pwc-slide-play-pause-btn');
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleVideoPlayback();
    });
  }

  // Jump Video Button
  const jumpBtn = modal.querySelector('.pwc-slide-jump-btn');
  if (jumpBtn) {
    jumpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      jumpVideoToCurrentSlide();
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

  const slideText = activeModal.querySelector('.pwc-slide-number-text');
  if (slideText) {
    slideText.textContent = `Slide No. ${currentItem.slideNumber} / ${cachedSlides.length}`;
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
        playPromise.catch(() => {});
      }
    } catch (_e) {}
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

  // Simulate click on the native timeline card
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

// Toggle True Fullscreen on the modal
function toggleModalFullscreen(): void {
  if (!activeModal) return;

  if (document.fullscreenElement) {
    try {
      const exitPromise = document.exitFullscreen();
      if (exitPromise !== undefined && typeof exitPromise.catch === 'function') {
        exitPromise.catch(() => {});
      }
    } catch (_e) {}
  } else {
    try {
      const reqPromise = activeModal.requestFullscreen();
      if (reqPromise !== undefined && typeof reqPromise.catch === 'function') {
        reqPromise.catch(() => {
          const player = getOuterPlayerContainer();
          if (player && typeof player.requestFullscreen === 'function') {
            try {
              player.requestFullscreen();
            } catch (_err) {}
          }
        });
      }
    } catch (_err) {}
  }
}

// Bind keyboard shortcuts & video listeners when modal is open
function bindModalEventListeners(): void {
  unbindModalEventListeners();

  // 1. Keyboard event listener with priority over page shortcuts
  keydownListener = (e: KeyboardEvent) => {
    if (!activeModal) return;

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

    // Stop propagation of other shortcuts while slide viewer modal is active
    e.stopPropagation();
  };

  window.addEventListener('keydown', keydownListener, { capture: true });

  // 2. Video state listeners to keep play/pause icon in sync
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
  unbindModalEventListeners();

  if (activeModal) {
    activeModal.remove();
    activeModal = null;
  }

  const existing = document.getElementById(MODAL_ID);
  if (existing) {
    existing.remove();
  }
}
