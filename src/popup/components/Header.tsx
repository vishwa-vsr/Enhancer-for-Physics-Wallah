import { isLightTheme, toggleTheme } from '@shared/theme';
import styles from './Header.module.css';

const SunIcon = () => (
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
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
    <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="22" y2="12" />
    <line x1="6.34" y1="17.66" x2="4.93" y2="19.07" />
    <line x1="19.07" y1="4.93" x2="17.66" y2="6.34" />
  </svg>
);

const MoonIcon = () => (
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
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const DashboardIcon = () => (
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
    <polyline points="3.5 6.5 7 10 11.5 5.5" />
    <line x1="15" y1="7.5" x2="20.5" y2="7.5" />
    <polyline points="3.5 16.5 7 20 11.5 15.5" />
    <line x1="15" y1="17.5" x2="20.5" y2="17.5" />
  </svg>
);

export const Header = () => {
  const logoUrl =
    typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? chrome.runtime.getURL('icons/icon48.png')
      : '/icons/icon48.png';

  const openDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html') });
    } else {
      window.open('/src/dashboard/index.html', '_blank');
    }
  };

  return (
    <header class={styles.header}>
      <div class={styles.brand}>
        <div class={styles.logoWrapper}>
          <img
            src={logoUrl}
            alt="Enhancer for PW Logo"
            class={styles.logoImg}
            width={32}
            height={32}
          />
        </div>
        <h1 class={styles.title}>Enhancer for PW</h1>
      </div>
      <div class={styles.actions}>
        <button onClick={openDashboard} class={styles.actionBtn} title="Padhle Dashboard">
          <DashboardIcon />
        </button>
        <button onClick={toggleTheme} class={styles.themeBtn} title="Toggle Theme">
          {isLightTheme.value ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  );
};
