import { useEffect, useState } from 'preact/hooks';
import { installDate, reviewPromptStatus, reviewPromptNextShowTime } from '@popup/store';
import { saveSetting } from '@shared/storage';
import styles from './ReviewModal.module.css';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function ReviewModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reviewPromptStatus.value === 'reviewed' || reviewPromptStatus.value === 'dismissed_permanently') {
      return;
    }
    const now = Date.now();
    if (now - installDate.value < ONE_DAY_MS) {
      return;
    }
    if (now < reviewPromptNextShowTime.value) {
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, 350);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        handleSnooze();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [installDate.value, reviewPromptStatus.value, reviewPromptNextShowTime.value, visible]);

  const handleLeaveReview = () => {
    let url = 'https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj/reviews';
    if (navigator.userAgent.includes('Firefox')) {
      url = 'https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/';
    } else if (navigator.userAgent.includes('Edg/')) {
      url = 'https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan';
    }
    window.open(url, '_blank');
    reviewPromptStatus.value = 'reviewed';
    saveSetting('reviewPromptStatus', 'reviewed');
    setVisible(false);
  };

  const handleSnooze = () => {
    const nextShow = Date.now() + THREE_DAYS_MS;
    reviewPromptNextShowTime.value = nextShow;
    saveSetting('reviewPromptNextShowTime', nextShow);
    setVisible(false);
  };

  const handleDismiss = () => {
    reviewPromptStatus.value = 'dismissed_permanently';
    saveSetting('reviewPromptStatus', 'dismissed_permanently');
    setVisible(false);
  };

  return (
    <div class={`${styles.overlay} ${visible ? styles.active : ''}`}>
      <div class={styles.backdrop} onClick={handleSnooze} />
      <div class={styles.card}>
        <div class={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <svg key={i} class={styles.star} viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
        <h2 class={styles.title}>Love the extension?</h2>
        <p class={styles.desc}>Please take 10 seconds to leave a rating on the store.</p>
        <div class={styles.actions}>
          <button class={`${styles.btn} ${styles.btnPrimary}`} onClick={handleLeaveReview}>
            ⭐ Leave a Review
          </button>
          <button class={`${styles.btn} ${styles.btnSecondary}`} onClick={handleSnooze}>
            Maybe Later
          </button>
          <button class={`${styles.btn} ${styles.btnSecondary}`} onClick={handleDismiss}>
            Don't Ask Again
          </button>
        </div>
      </div>
    </div>
  );
}
