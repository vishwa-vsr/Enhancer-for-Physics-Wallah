import { useEffect } from 'preact/hooks';
import { TabBar } from '@shared/components/TabBar';
import { initTheme } from '@shared/theme';
import { initStore, activeTab, isLoading } from './store';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import styles from './App.module.css';

const LoadingOverlay = () => (
  <div class={styles.loadingOverlay}>
    <div class={styles.spinner}></div>
  </div>
);

import { SpeedTab } from './features/speed/SpeedTab';
import { FocusTab } from './features/focus/FocusTab';
import { SilenceTab } from './features/silence/SilenceTab';
import { ReviewModal } from './features/review/ReviewModal';

const tabs = [
  {
    id: 'speed-tab',
    label: 'Playback',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        width="16"
        height="16"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: 'focus-tab',
    label: 'Focus',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        width="16"
        height="16"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 'silence-tab',
    label: 'Media',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        width="16"
        height="16"
      >
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    ),
  },
];

export const App = () => {
  useEffect(() => {
    initTheme();
    initStore();
  }, []);

  return (
    <div class={styles.popupContainer}>
      {isLoading.value && <LoadingOverlay />}
      <Header />
      <TabBar
        tabs={tabs}
        activeTab={activeTab.value}
        onTabChange={(id) => {
          activeTab.value = id;
        }}
      />
      <main class={styles.popupContent}>
        {activeTab.value === 'speed-tab' && (
          <div class={styles.tabPanel}>
            <SpeedTab />
          </div>
        )}
        {activeTab.value === 'focus-tab' && (
          <div class={styles.tabPanel}>
            <FocusTab />
          </div>
        )}
        {activeTab.value === 'silence-tab' && (
          <div class={styles.tabPanel}>
            <SilenceTab />
          </div>
        )}
      </main>
      <Footer />
      <ReviewModal />
    </div>
  );
};
