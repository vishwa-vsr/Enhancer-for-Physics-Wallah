import { useEffect, useState } from 'preact/hooks';
import { hasSeenRefreshPrompt, isLoading } from '@popup/store';
import { saveSetting } from '@shared/storage';
import styles from './RefreshModal.module.css';

export function RefreshModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Wait until store has finished loading from storage
    if (isLoading.value) {
      return;
    }

    if (hasSeenRefreshPrompt.value) {
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, 200);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        setVisible(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading.value, hasSeenRefreshPrompt.value, visible]);

  // Clicking outside / backdrop closes it for now, but will show again until "Got it" is clicked
  const handleCloseTemporary = () => {
    setVisible(false);
  };

  // Clicking "Got it" permanently marks it as seen
  const handleAcknowledge = () => {
    hasSeenRefreshPrompt.value = true;
    saveSetting('hasSeenRefreshPrompt', true);
    setVisible(false);
  };

  return (
    <div class={`${styles.overlay} ${visible ? styles.active : ''}`}>
      <div class={styles.backdrop} onClick={handleCloseTemporary} />
      <div class={styles.card}>
        <h2 class={styles.title}>Before You Start</h2>
        <p class={styles.desc}>
          If you already had a Physics Wallah lecture tab open, please refresh that tab once so the enhancer features can activate.
        </p>
        <p class={styles.note}>
          Note: This extension does not work on YouTube routed lectures.
        </p>
        <div class={styles.actions}>
          <button class={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAcknowledge}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
