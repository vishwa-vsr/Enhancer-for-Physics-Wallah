import { useEffect, useState, useRef } from 'preact/hooks';
import { initTheme } from '@shared/theme';
import {
  loadPlannerData,
  subjects,
  chapters,
  activeView,
  filteredTasks,
  groupedTasks,
  currentDisplaySettings,
  deleteSubject,
  deleteChapter,
  deleteTask,
} from './store';
import { Subject, Chapter, Task } from './types';
import { Sidebar } from './components/Sidebar';
import { TaskItem } from './components/TaskItem';
import { DisplayMenu } from './components/DisplayMenu';
import { AddTaskDialog } from './components/AddTaskDialog';
import { AddSubjectModal } from './components/AddSubjectModal';
import { AddChapterModal } from './components/AddChapterModal';
import { SettingsView } from './components/SettingsView';
import styles from './App.module.css';

export const App = () => {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [chapterModalSubjectId, setChapterModalSubjectId] = useState('');

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initTheme();
    loadPlannerData();
  }, []);

  const currentView = activeView.value;
  const taskList = filteredTasks.value;
  const groups = groupedTasks.value;
  const { layout } = currentDisplaySettings.value;
  const isBoardView = currentView.type !== 'settings' && layout === 'board';

  // Smooth left-click drag-to-scroll for board view
  useEffect(() => {
    const el = boardRef.current;
    if (!el || layout !== 'board') return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasDragged = false;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, a, input, textarea, select, [contenteditable="true"]')) {
        return;
      }

      isDown = true;
      hasDragged = false;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.2;

      if (!hasDragged && Math.abs(x - startX) > 4) {
        hasDragged = true;
        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';
      }

      if (hasDragged) {
        e.preventDefault();
        el.scrollLeft = scrollLeft - walk;
      }
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = '';
      el.style.userSelect = '';

      if (hasDragged) {
        const captureClick = (e: MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
        };
        window.addEventListener('click', captureClick, { capture: true, once: true });
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [layout]);

  const activeSubject =
    currentView.type === 'chapter'
      ? subjects.value.find((s) => s.id === currentView.subjectId)
      : null;
  const activeChapter =
    currentView.type === 'chapter'
      ? chapters.value.find((c) => c.id === currentView.chapterId)
      : null;

  // View title calculation
  let title = 'Tasks';
  if (currentView.type === 'today') {
    title = 'Tasks';
  } else if (currentView.type === 'inbox') {
    title = 'Inbox Tasks';
  } else if (currentView.type === 'chapter') {
    title = activeChapter ? `${activeChapter.name} Tasks` : 'Chapter Tasks';
  }

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectModalOpen(true);
  };

  const handleOpenAddChapter = (subId: string) => {
    setChapterModalSubjectId(subId);
    setEditingChapter(null);
    setChapterModalOpen(true);
  };

  const handleRenameSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectModalOpen(true);
  };

  const handleDeleteSubject = async (sub: Subject) => {
    await deleteSubject(sub.id);
  };

  const handleRenameChapter = (chap: Chapter) => {
    setChapterModalSubjectId(chap.subjectId);
    setEditingChapter(chap);
    setChapterModalOpen(true);
  };

  const handleDeleteChapter = async (chap: Chapter) => {
    await deleteChapter(chap.id);
  };

  const handleDeleteTask = async (task: Task) => {
    await deleteTask(task.id);
  };

  const handleFabClick = () => {
    if (currentView.type === 'chapter' && !currentView.chapterId && currentView.subjectId) {
      handleOpenAddChapter(currentView.subjectId);
    } else {
      setEditingTask(null);
      setTaskModalOpen(true);
    }
  };

  const handleEditTask = (t: Task) => {
    setEditingTask(t);
    setTaskModalOpen(true);
  };

  const showDisplayMenu =
    currentView.type !== 'settings' &&
    !(currentView.type === 'chapter' && !currentView.chapterId);

  return (
    <div class={styles.dashboardContainer}>
      {/* Left Sidebar */}
      <Sidebar
        onOpenAddSubject={handleOpenAddSubject}
        onRenameSubject={handleRenameSubject}
        onOpenAddChapter={handleOpenAddChapter}
        onEditChapter={handleRenameChapter}
      />

      {/* Main Area */}
      <div class={styles.mainWrapper}>
        <main class={`${styles.scrollArea} ${isBoardView ? styles.scrollAreaBoard : ''}`}>
          <div class={`${styles.contentMaxWidth} ${isBoardView ? styles.contentBoardWidth : ''}`}>
            {currentView.type === 'settings' ? (
              <SettingsView />
            ) : (
              <>
                {/* View Title Header */}
                {currentView.type === 'chapter' && activeSubject ? (
                  <div class={styles.viewHeader}>
                    <div class={styles.chapterTitleBlock}>
                      <span class={styles.breadcrumbSubject}>{activeSubject.name}</span>
                      <h2 class={styles.viewTitle}>
                        {activeChapter ? `${activeChapter.name} Tasks` : `${activeSubject.name} Tasks`}
                      </h2>
                    </div>
                    {showDisplayMenu && <DisplayMenu />}
                  </div>
                ) : (
                  <div class={styles.viewHeader}>
                    <h2 class={styles.viewTitle}>{title}</h2>
                    {showDisplayMenu && <DisplayMenu />}
                  </div>
                )}

                {/* If in chapter view and no chapters exist yet in subject */}
                {currentView.type === 'chapter' && !currentView.chapterId ? (
                  <div class={styles.emptyChapterCard}>
                    <div class={styles.emptyChapterIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="24" height="24">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                    <h3 class={styles.emptyChapterTitle}>
                      No chapters in this subject yet
                    </h3>
                    <p class={styles.emptyChapterDesc}>
                      Add your first chapter to begin adding study tasks.
                    </p>
                    {activeSubject && (
                      <button
                        type="button"
                        class={styles.primaryActionBtn}
                        onClick={() => handleOpenAddChapter(activeSubject.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width="14" height="14">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Chapter
                      </button>
                    )}
                  </div>
                ) : taskList.length === 0 ? (
                  <div class={styles.emptyTasksState}>
                    <p class={styles.emptyTasksText}>
                      {currentView.type === 'chapter'
                        ? 'No tasks in this chapter yet.'
                        : currentView.type === 'inbox'
                        ? 'Your Inbox is empty. Add a quick task without needing a subject or chapter.'
                        : 'No scheduled tasks yet.'}
                    </p>
                  </div>
                ) : layout === 'board' ? (
                  <div class={styles.boardContainer} ref={boardRef}>
                    {groups.map((group) => (
                      <div key={group.id} class={styles.boardColumn}>
                        <div class={styles.boardColumnHeader}>
                          {group.color && (
                            <span
                              class={styles.groupDot}
                              style={{ backgroundColor: group.color }}
                            />
                          )}
                          <span class={styles.groupTitle}>{group.title || 'Tasks'}</span>
                          <span class={styles.groupCount}>{group.tasks.length}</span>
                        </div>

                        <div class={styles.boardColumnCards}>
                          {group.tasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onEditRequest={handleEditTask}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div class={styles.groupedListContainer}>
                    {groups.map((group) => (
                      <section key={group.id} class={styles.groupSection}>
                        <div class={styles.groupHeader}>
                          {group.color && (
                            <span
                              class={styles.groupDot}
                              style={{ backgroundColor: group.color }}
                            />
                          )}
                          <span class={styles.groupTitle}>{group.title}</span>
                          <span class={styles.groupCount}>{group.tasks.length}</span>
                        </div>

                        <div>
                          {group.tasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onEditRequest={handleEditTask}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Floating Add Task Circular Button */}
        {currentView.type !== 'settings' && (
          <button class={styles.fab} onClick={handleFabClick}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              width="24"
              height="24"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        )}
      </div>

      {/* Modals */}
      {taskModalOpen && (
        <AddTaskDialog
          open={taskModalOpen}
          onClose={() => {
            setTaskModalOpen(false);
            setEditingTask(null);
          }}
          editingTask={editingTask}
          defaultSubjectId={currentView.subjectId}
          defaultChapterId={currentView.chapterId}
          onDelete={handleDeleteTask}
        />
      )}

      {subjectModalOpen && (
        <AddSubjectModal
          open={subjectModalOpen}
          onClose={() => {
            setSubjectModalOpen(false);
            setEditingSubject(null);
          }}
          editingSubject={editingSubject}
          onDelete={handleDeleteSubject}
        />
      )}

      {chapterModalOpen && (
        <AddChapterModal
          open={chapterModalOpen}
          subjectId={chapterModalSubjectId}
          onClose={() => {
            setChapterModalOpen(false);
            setEditingChapter(null);
          }}
          editingChapter={editingChapter}
          onDelete={handleDeleteChapter}
        />
      )}
    </div>
  );
};
