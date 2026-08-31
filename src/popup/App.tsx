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
    label: 'Speed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  {
    id: 'focus-tab',
    label: 'Focus',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )
  },
  {
    id: 'silence-tab',
    label: 'Silence',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    )
  }
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
      <TabBar tabs={tabs} activeTab={activeTab.value} onTabChange={(id) => { activeTab.value = id; }} />
      <main class={styles.popupContent}>
        {activeTab.value === 'speed-tab' && <div class={styles.tabPanel}><SpeedTab /></div>}
        {activeTab.value === 'focus-tab' && <div class={styles.tabPanel}><FocusTab /></div>}
        {activeTab.value === 'silence-tab' && <div class={styles.tabPanel}><SilenceTab /></div>}
      </main>
      <Footer />
      <ReviewModal />
    </div>
  );
};
