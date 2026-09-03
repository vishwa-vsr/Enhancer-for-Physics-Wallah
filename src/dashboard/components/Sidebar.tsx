import {
  subjects,
  chapters,
  tasks,
  activeView,
  expandedSubjects,
  toggleSubjectExpanded,
} from '../store';
import { Subject, Chapter } from '../types';
import styles from './Sidebar.module.css';

interface SidebarProps {
  onOpenAddSubject: () => void;
  onOpenAddChapter: (subjectId: string) => void;
  onRenameSubject: (subject: Subject) => void;
  onDeleteSubject: (subject: Subject) => void;
  onRenameChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapter: Chapter) => void;
}

export const Sidebar = ({
  onOpenAddSubject,
  onOpenAddChapter,
  onRenameSubject,
  onDeleteSubject,
  onRenameChapter,
  onDeleteChapter,
}: SidebarProps) => {
  const currentView = activeView.value;

  // Counts for top views
  const todayCount = tasks.value.filter((t) => !t.completed).length;
  const upcomingCount = tasks.value.filter((t) => !t.completed).length;
  const completedCount = tasks.value.filter((t) => t.completed).length;
  const allCount = tasks.value.length;

  return (
    <aside class={styles.sidebar}>
      {/* Brand */}
      <div class={styles.brand}>
        <div class={styles.brandIcon}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            width="18"
            height="18"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
        </div>
        <div class={styles.brandText}>
          <h2>StudyFlow</h2>
          <p>PW Task & Syllabus Planner</p>
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
              width="16"
              height="16"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>Today</span>
          </div>
          <span class={styles.badge}>{todayCount}</span>
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
              width="16"
              height="16"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
              <path d="m14 14 2 2 4-4" />
            </svg>
            <span>Upcoming</span>
          </div>
          <span class={styles.badge}>{upcomingCount}</span>
        </button>

        <button
          class={`${styles.navItem} ${currentView.type === 'completed' ? styles.navItemActive : ''}`}
          onClick={() => {
            activeView.value = { type: 'completed' };
          }}
        >
          <div class={styles.navLeft}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              width="16"
              height="16"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Completed</span>
          </div>
          <span class={styles.badge}>{completedCount}</span>
        </button>

        <button
          class={`${styles.navItem} ${currentView.type === 'all' ? styles.navItemActive : ''}`}
          onClick={() => {
            activeView.value = { type: 'all' };
          }}
        >
          <div class={styles.navLeft}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              width="16"
              height="16"
            >
              <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
              <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
              <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
            </svg>
            <span>All Tasks</span>
          </div>
          <span class={styles.badge}>{allCount}</span>
        </button>
      </nav>

      <div class={styles.divider} />

      {/* Subjects & Chapters List */}
      <div class={styles.subjectsSection}>
        <div class={styles.sectionHeader}>
          <span class={styles.sectionTitle}>Subjects</span>
          <button class={styles.addBtnSmall} onClick={onOpenAddSubject} title="Create New Subject">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              width="14"
              height="14"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {subjects.value.length === 0 ? (
          <div class={styles.emptyPrompt}>
            <p>No subjects yet.</p>
            <button class={styles.emptyBtn} onClick={onOpenAddSubject}>
              + Add Subject
            </button>
          </div>
        ) : (
          subjects.value.map((sub) => {
            const isExpanded = !!expandedSubjects.value[sub.id];
            const subChapters = chapters.value.filter((c) => c.subjectId === sub.id);
            const isSubActive = currentView.type === 'chapter' && currentView.subjectId === sub.id;

            return (
              <div key={sub.id} class={styles.subjectGroup}>
                <div class={`${styles.subjectItem} ${isSubActive ? styles.subjectItemActive : ''}`}>
                  <div class={styles.subjectLeft} onClick={() => toggleSubjectExpanded(sub.id)}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      width="13"
                      height="13"
                      style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span class={styles.subjectName}>{sub.name}</span>
                  </div>

                  <div class={styles.subjectActions}>
                    <button
                      class={styles.iconBtn}
                      title="Add Chapter"
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
                    </button>
                    <button
                      class={styles.iconBtn}
                      title="Rename Subject"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRenameSubject(sub);
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        width="11"
                        height="11"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      class={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                      title="Delete Subject"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSubject(sub);
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        width="11"
                        height="11"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div class={styles.chaptersList}>
                    {subChapters.length === 0 ? (
                      <button
                        class={styles.chapterItem}
                        onClick={() => onOpenAddChapter(sub.id)}
                        style={{ color: 'var(--accent-primary)', fontStyle: 'italic' }}
                      >
                        + Add first chapter
                      </button>
                    ) : (
                      subChapters.map((chap) => {
                        const isChapActive =
                          currentView.type === 'chapter' && currentView.chapterId === chap.id;
                        const chapTasksCount = tasks.value.filter(
                          (t) => t.chapterId === chap.id,
                        ).length;

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
                            <span class={styles.chapterName}>{chap.name}</span>
                            <span
                              class={styles.badge}
                              style={{ fontSize: '10px', padding: '1px 5px' }}
                            >
                              {chapTasksCount}
                            </span>
                            <div class={styles.chapterActions}>
                              <button
                                class={styles.iconBtn}
                                title="Rename Chapter"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRenameChapter(chap);
                                }}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2.2}
                                  width="10"
                                  height="10"
                                >
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                </svg>
                              </button>
                              <button
                                class={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                title="Delete Chapter"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteChapter(chap);
                                }}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2.2}
                                  width="10"
                                  height="10"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Settings at the bottom */}
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
            width="16"
            height="16"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
