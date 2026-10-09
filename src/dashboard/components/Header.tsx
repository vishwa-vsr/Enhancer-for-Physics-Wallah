import { isLightTheme, toggleTheme } from '@shared/theme';
import { SunIcon, MoonIcon } from '@shared/components/ThemeIcons';
import { userName, activeView, subjects, chapters } from '../store';
import styles from './Header.module.css';

interface HeaderProps {
  onOpenAddChapter?: (subjectId: string) => void;
  onOpenAddTask?: () => void;
}

export const Header = ({
  onOpenAddChapter,
  onOpenAddTask,
}: HeaderProps) => {
  const currentView = activeView.value;

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const activeSubject =
    currentView.type === 'chapter'
      ? subjects.value.find((s) => s.id === currentView.subjectId)
      : null;
  const activeChapter =
    currentView.type === 'chapter'
      ? chapters.value.find((c) => c.id === currentView.chapterId)
      : null;

  // In Chapter / Subject view: show Subject breadcrumb and Chapter title
  if (currentView.type === 'chapter' && activeSubject) {
    return (
      <header class={styles.header}>
        <div class={styles.chapterHeaderLeft}>
          <div class={styles.breadcrumbsRow}>
            <span class={styles.breadcrumbSubject}>{activeSubject.name}</span>
          </div>
          <h1 class={styles.chapterTitle}>
            {activeChapter ? `${activeChapter.name} Tasks` : `${activeSubject.name} Tasks`}
          </h1>
        </div>

        <div class={styles.headerActions}>
          <button
            onClick={toggleTheme}
            class={styles.themeToggleCircle}
            aria-label="Toggle Theme"
          >
            {isLightTheme.value ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </header>
    );
  }

  // Default Today / Upcoming / Settings greeting view:
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
          aria-label="Toggle Theme"
        >
          {isLightTheme.value ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  );
};
