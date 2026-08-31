import { isLightTheme, toggleTheme } from '@shared/theme';
import styles from './Header.module.css';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export const Header = () => {
  const logoUrl = typeof chrome !== 'undefined' && chrome.runtime?.getURL
    ? chrome.runtime.getURL('icons/icon48.png')
    : '/icons/icon48.png';

  return (
    <header class={styles.header}>
      <div class={styles.brand}>
        <div class={styles.logoWrapper}>
          <img src={logoUrl} alt="PW Control Logo" class={styles.logoImg} width={32} height={32} />
        </div>
        <h1 class={styles.title}>Enhancer for PW</h1>
      </div>
      <button onClick={toggleTheme} class={styles.themeBtn}>
        {isLightTheme.value ? <MoonIcon /> : <SunIcon />}
      </button>
    </header>
  );
};
