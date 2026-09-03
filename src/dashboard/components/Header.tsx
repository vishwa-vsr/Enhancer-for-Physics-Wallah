import { isLightTheme, toggleTheme } from '@shared/theme';
import { SunIcon, MoonIcon } from '@shared/components/ThemeIcons';
import { userName } from '../store';
import styles from './Header.module.css';

export const Header = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header class={styles.header}>
      <div class={styles.greetingSection}>
        <h1>Good day{userName.value ? `, ${userName.value}` : ''}! 👋</h1>
        <p>{currentDate}</p>
      </div>

      <div class={styles.headerActions}>
        <button
          onClick={toggleTheme}
          class={styles.themeToggleCircle}
          title="Toggle Light / AMOLED Dark Theme"
        >
          {isLightTheme.value ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  );
};
