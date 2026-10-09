import { useState, useEffect } from 'preact/hooks';
import { ScrapedPwData } from '../../../content/modules/sync/scraper';
import { syncPwDataToPlanner } from '../../../shared/syncHelper';
import styles from './SyncBanner.module.css';

export const SyncBanner = () => {
  const [isPwPage, setIsPwPage] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedPwData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.tabs?.query) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id || !activeTab.url) return;

      const url = activeTab.url;
      if (url.includes('pw.live') || url.includes('penpencil')) {
        setIsPwPage(true);
        // Ask content script for page data
        chrome.tabs.sendMessage(activeTab.id, { type: 'GET_PW_PAGE_DATA' }, (response) => {
          if (chrome.runtime.lastError) {
            // Content script may not be loaded or page is still loading
            return;
          }
          if (response?.success && response.data) {
            setScrapedData(response.data);
          }
        });
      }
    });
  }, []);

  if (!isPwPage) return null;

  const handleSync = async () => {
    if (!scrapedData) return;
    setSyncing(true);
    try {
      const res = await syncPwDataToPlanner(scrapedData);
      setSyncSuccess(res.message);
    } catch {
      setSyncSuccess('Sync failed. Please refresh the page and try again.');
    } finally {
      setSyncing(false);
    }
  };

  const openDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html') });
    } else {
      window.open('/src/dashboard/index.html', '_blank');
    }
  };

  let description = 'Sync your studies with Padhle';
  if (scrapedData) {
    if (scrapedData.pageType === 'chapter_contents') {
      const lecCount = scrapedData.items.filter((i) => i.type === 'lecture').length;
      const dppCount = scrapedData.items.filter((i) => i.type === 'dpp').length;
      description = `${scrapedData.chapterName} • ${lecCount} Lectures • ${dppCount} DPPs`;
    } else if (scrapedData.pageType === 'subject_topics') {
      description = `${scrapedData.subjectName} • ${scrapedData.chapters?.length || 0} Chapters`;
    } else if (scrapedData.pageType === 'batch_overview') {
      description = `Batch Overview • ${scrapedData.subjects?.length || 0} Subjects`;
    }
  }

  return (
    <div class={styles.syncCard}>
      <div class={styles.cardHeader}>
        <div class={styles.badge}>
          <svg
            class={styles.badgeIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          PW Connected
        </div>
      </div>

      <div class={styles.details}>
        <h4 class={styles.pageTitle}>
          {scrapedData?.chapterName || scrapedData?.subjectName || 'Current PW Page'}
        </h4>
        <p class={styles.subTitle}>{description}</p>
      </div>

      {syncSuccess ? (
        <div class={styles.successBanner}>
          <p class={styles.successText}>✓ {syncSuccess}</p>
          <button onClick={openDashboard} class={styles.viewBtn}>
            Open Planner
          </button>
        </div>
      ) : (
        <button
          class={styles.syncBtn}
          onClick={handleSync}
          disabled={syncing || !scrapedData}
        >
          {syncing ? (
            'Syncing...'
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={14} height={14}>
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              1-Click Sync to Planner
            </>
          )}
        </button>
      )}
    </div>
  );
};
