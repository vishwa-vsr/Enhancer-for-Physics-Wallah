import { scrapeCurrentPwPage } from './scraper';
import { syncPwDataToPlanner } from '../../../shared/syncHelper';

const SYNC_BTN_ID = 'pw-sync-to-padhle-btn';

/**
 * Injects the "⚡ Sync to Padhle" button on Physics Wallah pages next to the tab navigation.
 * Appears on both the Chapters Overview page and Chapter Content (Lectures/DPPs) list page.
 */
export function injectSyncButton(): void {
  // 1. Locate the tab list element
  const parentTab = document.querySelector('[class*="_parentTab_"]');
  if (!parentTab) return;

  // 2. Locate the enclosing header bar or parent container
  const container = (parentTab.closest('[class*="header-"]') ||
    parentTab.parentElement?.parentElement ||
    parentTab.parentElement) as HTMLElement | null;
  if (!container) return;

  // 3. Avoid duplicate button injection
  const existingBtn = document.getElementById(SYNC_BTN_ID) as HTMLButtonElement | null;
  if (existingBtn) {
    if (container.contains(existingBtn)) {
      return; // Already cleanly placed in current container
    }
    // If container was replaced during route navigation, remove previous detached button
    existingBtn.remove();
  }

  // 4. Ensure header container aligns items in a row across the width
  if (container.style.display !== 'flex') {
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'space-between';
  }

  // 5. Create and style the button
  const btn = document.createElement('button');
  btn.id = SYNC_BTN_ID;
  btn.type = 'button';
  btn.textContent = '⚡ Sync to Padhle';
  btn.setAttribute('aria-label', 'Sync to Padhle');

  // Exact styling matching PW purple theme and site typography
  btn.style.backgroundColor = '#5a4bda';
  btn.style.color = '#ffffff';
  btn.style.border = 'none';
  btn.style.borderRadius = '8px';
  btn.style.padding = '6px 14px';
  btn.style.fontSize = '13px';
  btn.style.fontWeight = '600';
  btn.style.fontFamily = 'inherit';
  btn.style.cursor = 'pointer';
  btn.style.display = 'inline-flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
  btn.style.gap = '6px';
  btn.style.marginLeft = 'auto';
  btn.style.marginRight = '8px';
  btn.style.transition = 'background-color 0.2s ease, transform 0.1s ease, opacity 0.2s ease';
  btn.style.lineHeight = '1.2';
  btn.style.userSelect = 'none';
  btn.style.whiteSpace = 'nowrap';
  btn.style.flexShrink = '0';
  btn.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.08)';

  // Hover feedback
  btn.addEventListener('mouseenter', () => {
    if (!btn.disabled && !btn.dataset.synced) {
      btn.style.backgroundColor = '#4838c7';
    }
  });

  btn.addEventListener('mouseleave', () => {
    if (!btn.disabled && !btn.dataset.synced) {
      btn.style.backgroundColor = '#5a4bda';
    }
  });

  // 6. Click handler: scrape and save directly
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (btn.disabled) return;

    // Transition to Syncing state
    btn.disabled = true;
    btn.style.cursor = 'wait';
    btn.style.opacity = '0.85';
    btn.textContent = 'Syncing...';

    try {
      const scraped = scrapeCurrentPwPage();
      await syncPwDataToPlanner(scraped);

      // Transition to Success state
      btn.dataset.synced = 'true';
      btn.textContent = '✓ Synced!';
      btn.style.backgroundColor = '#16a34a'; // Clean subtle green
      btn.style.opacity = '1';
      btn.style.cursor = 'default';

      setTimeout(() => {
        btn.disabled = false;
        delete btn.dataset.synced;
        btn.textContent = '⚡ Sync to Padhle';
        btn.style.backgroundColor = '#5a4bda';
        btn.style.cursor = 'pointer';
      }, 2500);
    } catch (err) {
      console.error('[Padhle] Sync error:', err);
      btn.textContent = '⚠️ Sync Failed';
      btn.style.backgroundColor = '#dc2626';
      btn.style.opacity = '1';

      setTimeout(() => {
        btn.disabled = false;
        delete btn.dataset.synced;
        btn.textContent = '⚡ Sync to Padhle';
        btn.style.backgroundColor = '#5a4bda';
        btn.style.cursor = 'pointer';
      }, 2500);
    }
  });

  // 7. Mount into DOM
  container.appendChild(btn);
}
