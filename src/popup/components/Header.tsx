import { isLightTheme, toggleTheme } from '@shared/theme';
import { SunIcon, MoonIcon } from '@shared/components/ThemeIcons';
import styles from './Header.module.css';

const DoubleArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    width="16"
    height="16"
  >
    <polyline points="13 17 18 12 13 7" />
    <polyline points="6 17 11 12 6 7" />
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
          <img src={logoUrl} alt="PW Control Logo" class={styles.logoImg} width={32} height={32} />
        </div>
        <h1 class={styles.title}>Enhancer for PW</h1>
      </div>
      <div class={styles.actions}>
        <button onClick={openDashboard} class={styles.actionBtn} title="Padhle Dashboard">
          <DoubleArrowIcon />
        </button>
        <button onClick={toggleTheme} class={styles.themeBtn} title="Toggle Theme">
          {isLightTheme.value ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  );
};
