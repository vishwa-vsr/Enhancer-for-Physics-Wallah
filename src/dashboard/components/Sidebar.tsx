import {
  subjects,
  chapters,
  tasks,
  activeView,
  userName,
  expandedSubjects,
  toggleSubjectExpanded,
  getLocalDateStr,
} from '../store';
import { Subject, Chapter } from '../types';
import { StudyIcon } from '@shared/components/StudyIcons';
import { getLightShade } from '@shared/theme';
import styles from './Sidebar.module.css';

interface SidebarProps {
  onOpenAddSubject: () => void;
  onRenameSubject: (subject: Subject) => void;
  onOpenAddChapter?: (subjectId: string) => void;
  onEditChapter?: (chapter: Chapter) => void;
}

export const Sidebar = ({
  onOpenAddSubject,
  onRenameSubject,
  onOpenAddChapter,
  onEditChapter,
}: SidebarProps) => {
  const currentView = activeView.value;

  // Accurate counts for Today and Upcoming views
  const todayStr = getLocalDateStr();
  const todayCount = tasks.value.filter(
    (t) => !t.completed && (t.dueDate === todayStr || (t.dueDate && t.dueDate < todayStr)),
  ).length;
  const upcomingCount = tasks.value.filter(
    (t) => !t.completed && t.dueDate && t.dueDate > todayStr,
  ).length;

  const logoUrl =
    typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? chrome.runtime.getURL('icons/icon48.png')
      : '/icons/icon48.png';

  // Truncate name in sidebar to max 8 characters as requested
  const trimmedName = userName.value.trim();
  const displayName =
    trimmedName.length > 8 ? trimmedName.slice(0, 8) + '...' : trimmedName;

  return (
    <aside class={styles.sidebar}>
      {/* Brand: "Padhle" with the extension logo */}
      <div class={styles.brand}>
        <div class={styles.brandLogo}>
          <img src={logoUrl} alt="PW Logo" class={styles.brandLogoImg} width={28} height={28} />
        </div>
        <div class={styles.brandTextWrapper}>
          <h2 class={styles.brandTitle}>Padhle</h2>
          {trimmedName && (
            <span class={styles.brandUserName}>
              • {displayName}
            </span>
          )}
        </div>
      </div>

      {/* Navigation Quick Views */}
      <nav class={styles.navSection}>
        <button
          class={`${styles.navItem} ${currentView.type === 'today' ? styles.navItemActive : ''}`}
          onClick={() => {
            activeView.value = { type: 'today' };
          }}
        >
          <div class={styles.navLeft}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              width="18"
              height="18"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>Today</span>
          </div>
          {todayCount > 0 && <span class={styles.badge}>{todayCount}</span>}
        </button>

        <button
          class={`${styles.navItem} ${currentView.type === 'upcoming' ? styles.navItemActive : ''}`}
          onClick={() => {
            activeView.value = { type: 'upcoming' };
          }}
        >
          <div class={styles.navLeft}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              width="18"
              height="18"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
              <path d="m14 14 2 2 4-4" />
            </svg>
            <span>Upcoming</span>
          </div>
          {upcomingCount > 0 && <span class={styles.badge}>{upcomingCount}</span>}
        </button>
      </nav>

      <div class={styles.divider} />

      {/* Subjects & Chapters Section */}
      <div class={styles.subjectsSection}>
        <div class={styles.sectionHeader}>
          <span class={styles.sectionTitle}>Subjects</span>
          <button
            class={styles.addBtnSmall}
            onClick={onOpenAddSubject}
            title="Add subject"
            aria-label="Add subject"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              width="16"
              height="16"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {subjects.value.length === 0 ? null : (
          subjects.value.map((sub) => {
            const isExpanded = !!expandedSubjects.value[sub.id];
            const subChapters = chapters.value.filter((c) => c.subjectId === sub.id);
            const subColor = sub.color || '#6366f1';
            const chapterIconLightColor = getLightShade(subColor, 30);

            return (
              <div key={sub.id} class={styles.subjectGroup}>
                <div
                  class={styles.subjectItem}
                  onClick={() => {
                    toggleSubjectExpanded(sub.id);
                    if (activeView.value.type === 'settings' || activeView.value.subjectId !== sub.id) {
                      activeView.value = {
                        type: 'chapter',
                        subjectId: sub.id,
                        chapterId: subChapters.length > 0 ? subChapters[0].id : '',
                      };
                    }
                  }}
                >
                  <div class={styles.subjectLeft}>
                    <StudyIcon
                      name={sub.icon || 'book'}
                      size={18}
                      color={sub.color || 'var(--accent-primary)'}
                      class={styles.subjectBookIcon}
                    />
                    <span class={styles.subjectName}>{sub.name}</span>
                  </div>

                  <button
                    type="button"
                    class={styles.subjectMenuBtn}
                    aria-label={`Options for ${sub.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameSubject(sub);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <circle cx="5" cy="12" r="2.2" />
                      <circle cx="12" cy="12" r="2.2" />
                      <circle cx="19" cy="12" r="2.2" />
                    </svg>
                  </button>
                </div>

                {isExpanded && (
                  <div class={styles.chaptersList}>
                    {subChapters.map((chap) => {
                      const isChapActive =
                        currentView.type === 'chapter' && currentView.chapterId === chap.id;

                      return (
                        <div
                          key={chap.id}
                          class={`${styles.chapterItem} ${isChapActive ? styles.chapterItemActive : ''}`}
                          onClick={() => {
                            activeView.value = {
                              type: 'chapter',
                              subjectId: sub.id,
                              chapterId: chap.id,
                            };
                          }}
                        >
                          <div class={styles.chapterLeft}>
                            <StudyIcon
                              name={chap.icon || 'file-text'}
                              size={14}
                              color={isChapActive ? subColor : chapterIconLightColor}
                              class={styles.chapterIcon}
                            />
                            <span class={styles.chapterName}>{chap.name}</span>
                          </div>

                          {onEditChapter && (
                            <button
                              type="button"
                              class={styles.chapterMenuBtn}
                              aria-label={`Options for ${chap.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditChapter(chap);
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <circle cx="5" cy="12" r="2.2" />
                                <circle cx="12" cy="12" r="2.2" />
                                <circle cx="19" cy="12" r="2.2" />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {onOpenAddChapter && (
                      <button
                        type="button"
                        class={styles.addChapterRowBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddChapter(sub.id);
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          width="12"
                          height="12"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Add Chapter</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Settings at the very bottom */}
      <div class={styles.footer}>
        <button
          class={`${styles.settingsBtn} ${currentView.type === 'settings' ? styles.settingsBtnActive : ''}`}
          onClick={() => {
            activeView.value = { type: 'settings' };
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            width="18"
            height="18"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
