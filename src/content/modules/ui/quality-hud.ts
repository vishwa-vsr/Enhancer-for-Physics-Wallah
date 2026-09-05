import { state } from '../../state';
import { VideoQuality } from '../../types';
import { findPWToolbar } from '../distractions/elements';
import { getCurrentQuality, saveQuality, getAvailableQualities } from '../video/quality-controller';

let isMenuOpen = false;
let closeMenuTimer: ReturnType<typeof setTimeout> | null = null;

function populateQualityMenuItems(menu: HTMLElement): void {
  const title = menu.querySelector('.pwc-quality-menu-title');
  menu.innerHTML = '';
  if (title) {
    menu.appendChild(title);
  } else {
    const menuTitle = document.createElement('div');
    menuTitle.className = 'pwc-quality-menu-title';
    menuTitle.textContent = 'Quality';
    menu.appendChild(menuTitle);
  }

  const available = getAvailableQualities();
  const descriptors: Record<number, string> = {
    1080: '1080p (Full HD)',
    720: '720p (High)',
    480: '480p (Standard)',
    360: '360p (Medium)',
    240: '240p (Data Saver)',
  };

  const options: { label: string; value: VideoQuality }[] = [
    { label: 'Auto (Recommended)', value: 'auto' },
  ];

  available.forEach((h) => {
    const val = `${h}p` as VideoQuality;
    const label = descriptors[h] || `${h}p`;
    options.push({ label, value: val });
  });

  options.forEach((opt) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'pwc-quality-item';
    item.dataset.quality = opt.value;

    const labelSpan = document.createElement('span');
    labelSpan.className = 'pwc-quality-item-label';
    labelSpan.textContent = opt.label;
    item.appendChild(labelSpan);

    const checkSpan = document.createElement('span');
    checkSpan.className = 'pwc-quality-item-check';
    checkSpan.textContent = '✓';
    item.appendChild(checkSpan);

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      saveQuality(opt.value);
      closeQualityMenu();
    });

    menu.appendChild(item);
  });
}

export function buildQualityControl(container: HTMLElement): void {
  container.innerHTML = '';

  // 1. Quality Trigger Button
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pwc-quality-btn';
  btn.title = 'Video Quality Settings';
  btn.setAttribute('aria-label', 'Video Quality');

  // HD / Quality SVG Icon
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '2');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');

  // Quality icon path (display/monitor with gear or HD)
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '2');
  rect.setAttribute('y', '3');
  rect.setAttribute('width', '20');
  rect.setAttribute('height', '14');
  rect.setAttribute('rx', '2');
  rect.setAttribute('ry', '2');
  icon.appendChild(rect);

  const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line1.setAttribute('x1', '8');
  line1.setAttribute('y1', '21');
  line1.setAttribute('x2', '16');
  line1.setAttribute('y2', '21');
  icon.appendChild(line1);

  const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line2.setAttribute('x1', '12');
  line2.setAttribute('y1', '17');
  line2.setAttribute('x2', '12');
  line2.setAttribute('y2', '21');
  icon.appendChild(line2);

  btn.appendChild(icon);

  // Quality Badge Text (e.g., "720p" or "Auto")
  const badge = document.createElement('span');
  badge.className = 'pwc-quality-badge';
  const cur = getCurrentQuality();
  badge.textContent = cur.toLowerCase() === 'auto' ? 'Auto' : cur;
  btn.appendChild(badge);

  container.appendChild(btn);

  // 2. Options Popup Menu (opens on hover or click)
  const menu = document.createElement('div');
  menu.className = 'pwc-quality-menu';
  populateQualityMenuItems(menu);
  container.appendChild(menu);

  // 3. Event Listeners for smooth hover & click
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleQualityMenu();
  });

  container.addEventListener('mouseenter', () => {
    if (closeMenuTimer) {
      clearTimeout(closeMenuTimer);
      closeMenuTimer = null;
    }
    openQualityMenu();
  });

  container.addEventListener('mouseleave', () => {
    closeMenuTimer = setTimeout(() => {
      closeQualityMenu();
    }, 300);
  });

  // Close when clicking elsewhere on the page
  document.addEventListener('click', (e) => {
    if (isMenuOpen && !container.contains(e.target as Node)) {
      closeQualityMenu();
    }
  });

  updateQualityHUD();
}

function openQualityMenu(): void {
  const container = document.getElementById('pwc-quality-control');
  if (!container) return;
  container.classList.add('pwc-menu-open');
  isMenuOpen = true;
  updateQualityHUD();
}

function closeQualityMenu(): void {
  const container = document.getElementById('pwc-quality-control');
  if (!container) return;
  container.classList.remove('pwc-menu-open');
  isMenuOpen = false;
}

function toggleQualityMenu(): void {
  if (isMenuOpen) {
    closeQualityMenu();
  } else {
    openQualityMenu();
  }
}

// Inject floating quality widget into player control bar
export function injectQualityControl(): void {
  if (!state.extensionEnabled || !state.constantVideoQuality) {
    const container = document.getElementById('pwc-quality-control');
    if (container) container.remove();
    return;
  }

  const toolbar = findPWToolbar();
  if (toolbar) {
    let container = document.getElementById('pwc-quality-control') as HTMLElement | null;
    if (!container) {
      container = document.createElement('div');
      container.id = 'pwc-quality-control';
      container.className = 'pwc-quality-container';
      buildQualityControl(container);

      // Insert right next to speed control for neat grouping
      const speedCtrl = document.getElementById('pwc-speed-control');
      if (speedCtrl && speedCtrl.nextSibling) {
        toolbar.insertBefore(container, speedCtrl.nextSibling);
      } else if (speedCtrl) {
        toolbar.appendChild(container);
      } else if (toolbar.firstChild) {
        toolbar.insertBefore(container, toolbar.firstChild);
      } else {
        toolbar.appendChild(container);
      }
    }

    if (container) {
      if (state.hideSettings.hideQuality) {
        container.style.display = 'none';
      } else {
        container.style.display = '';
      }
    }
  }
}

// Update quality badge and highlight active option in the popup menu
export function updateQualityHUD(): void {
  const container = document.getElementById('pwc-quality-control');
  if (container) {
    if (!state.extensionEnabled || !state.constantVideoQuality || state.hideSettings.hideQuality) {
      container.style.display = 'none';
    } else {
      container.style.display = '';
    }

    const menu = container.querySelector<HTMLElement>('.pwc-quality-menu');
    if (menu) {
      const renderedQualities: number[] = [];
      menu.querySelectorAll<HTMLElement>('.pwc-quality-item').forEach((item) => {
        const q = item.dataset.quality;
        if (q && q !== 'auto') {
          const num = parseInt(q.replace('p', ''), 10);
          if (!isNaN(num)) renderedQualities.push(num);
        }
      });

      const available = getAvailableQualities();
      const isMatch =
        renderedQualities.length === available.length &&
        renderedQualities.every((val, index) => val === available[index]);

      if (!isMatch) {
        populateQualityMenuItems(menu);
      }
    }
  }

  const current = getCurrentQuality().toLowerCase().replace('p', '');

  // Update badge label
  document.querySelectorAll<HTMLElement>('.pwc-quality-badge').forEach((badge) => {
    badge.textContent = current === 'auto' ? 'Auto' : `${current}p`;
  });

  // Update menu item checkmarks / active classes
  document.querySelectorAll<HTMLElement>('.pwc-quality-item').forEach((item) => {
    const itemQ = (item.dataset.quality || '').toLowerCase().replace('p', '');
    if (itemQ === current) {
      item.classList.add('pwc-active-quality');
    } else {
      item.classList.remove('pwc-active-quality');
    }
  });
}
