import { isLightTheme, toggleTheme } from '@shared/theme';
import { SunIcon, MoonIcon } from '@shared/components/ThemeIcons';
import { userName, activeView, subjects, chapters, isAddChainModalOpen } from '../store';
import { Subject, Chapter } from '../types';
import styles from './Header.module.css';

interface HeaderProps {
  onOpenAddChapter?: (subjectId: string) => void;
  onOpenAddTask?: () => void;
  onEditChapter?: (chapter: Chapter) => void;
  onEditSubject?: (subject: Subject) => void;
}

export const Header = ({
  onOpenAddChapter,
  onOpenAddTask,
  onEditChapter,
  onEditSubject,
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

  // In Chapter / Subject view: show Subject breadcrumb, Chapter title, Add Chapter, Add Task, and Edit
  if (currentView.type === 'chapter' && activeSubject) {
    return (
      <header class={styles.header}>
        <div class={styles.chapterHeaderLeft}>
          <div class={styles.breadcrumbsRow}>
            <span class={styles.breadcrumbSubject}>{activeSubject.name}</span>
            {onEditSubject && (
              <button
                class={styles.headerIconBtn}
                onClick={() => onEditSubject(activeSubject)}
                aria-label={`Edit ${activeSubject.name}`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                  <circle cx="5" cy="12" r="2.2" />
                  <circle cx="12" cy="12" r="2.2" />
                  <circle cx="19" cy="12" r="2.2" />
                </svg>
              </button>
            )}
          </div>
          <h1 class={styles.chapterTitle}>
            {activeChapter ? `${activeChapter.name} Tasks` : `${activeSubject.name} Tasks`}
          </h1>
        </div>

        <div class={styles.headerActions}>
          {activeChapter && (
            <button
              class={styles.headerActionBtnPrimary}
              onClick={() => {
                isAddChainModalOpen.value = true;
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                width="12"
                height="12"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Study Chain
            </button>
          )}

          {onOpenAddChapter && (
            <button
              class={styles.headerActionBtn}
              onClick={() => onOpenAddChapter(activeSubject.id)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                width="12"
                height="12"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Chapter
            </button>
          )}

          {activeChapter && onEditChapter && (
            <button
              class={styles.headerActionBtn}
              onClick={() => onEditChapter(activeChapter)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                width="12"
                height="12"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
              Edit
            </button>
          )}

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
