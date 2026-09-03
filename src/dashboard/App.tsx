import { useEffect, useState } from 'preact/hooks';
import { initTheme } from '@shared/theme';
import {
  loadPlannerData,
  subjects,
  chapters,
  tasks,
  activeView,
  filteredTasks,
  deleteSubject,
  deleteChapter,
} from './store';
import { Subject, Chapter } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { FilterSection } from './components/FilterSection';
import { TaskItem } from './components/TaskItem';
import { AddTaskDialog } from './components/AddTaskDialog';
import { AddSubjectModal } from './components/AddSubjectModal';
import { AddChapterModal } from './components/AddChapterModal';
import { ConfirmModal } from './components/ConfirmModal';
import { SettingsView } from './components/SettingsView';
import styles from './App.module.css';

export const App = () => {
  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [chapterModalSubjectId, setChapterModalSubjectId] = useState('');

  // Editing state
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // Deletion confirm state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({ title: '', message: '', action: async () => {} });

  useEffect(() => {
    initTheme();
    loadPlannerData();
  }, []);

  const currentView = activeView.value;
  const taskList = filteredTasks.value;

  // View title and breadcrumbs calculation
  let title = 'Today';
  let breadcrumb = '';

  if (currentView.type === 'today') {
    title = "Today's Tasks";
  } else if (currentView.type === 'upcoming') {
    title = 'Upcoming Tasks';
  } else if (currentView.type === 'completed') {
    title = 'Completed Tasks';
  } else if (currentView.type === 'all') {
    title = 'All Study Tasks';
  } else if (currentView.type === 'chapter') {
    const sub = subjects.value.find((s) => s.id === currentView.subjectId);
    const chap = chapters.value.find((c) => c.id === currentView.chapterId);
    title = chap ? chap.name : 'Chapter Tasks';
    breadcrumb = sub ? sub.name : '';
  }

  // Handlers for subject/chapter creation and editing
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

  const handleDeleteSubject = (sub: Subject) => {
    const subTasks = tasks.value.filter((t) => t.subjectId === sub.id);
    const subChaps = chapters.value.filter((c) => c.subjectId === sub.id);

    setConfirmConfig({
      title: `Delete Subject '${sub.name}'?`,
      message: `This will permanently delete '${sub.name}' along with its ${subChaps.length} chapter(s) and ${subTasks.length} task(s). Are you sure?`,
      action: async () => {
        await deleteSubject(sub.id);
      },
    });
    setConfirmModalOpen(true);
  };

  const handleRenameChapter = (chap: Chapter) => {
    setChapterModalSubjectId(chap.subjectId);
    setEditingChapter(chap);
    setChapterModalOpen(true);
  };

  const handleDeleteChapter = (chap: Chapter) => {
    const chapTasks = tasks.value.filter((t) => t.chapterId === chap.id);

    setConfirmConfig({
      title: `Delete Chapter '${chap.name}'?`,
      message: `This will permanently delete '${chap.name}' and its ${chapTasks.length} task(s). Are you sure?`,
      action: async () => {
        await deleteChapter(chap.id);
      },
    });
    setConfirmModalOpen(true);
  };

  // Check if we can add tasks (needs at least 1 subject and 1 chapter)
  const canAddTask = subjects.value.length > 0 && chapters.value.length > 0;

  const handleFabClick = () => {
    if (!canAddTask) {
      if (subjects.value.length === 0) {
        handleOpenAddSubject();
      } else {
        handleOpenAddChapter(subjects.value[0].id);
      }
    } else {
      setTaskModalOpen(true);
    }
  };

  return (
    <div class={styles.dashboardContainer}>
      {/* Sidebar */}
      <Sidebar
        onOpenAddSubject={handleOpenAddSubject}
        onOpenAddChapter={handleOpenAddChapter}
        onRenameSubject={handleRenameSubject}
        onDeleteSubject={handleDeleteSubject}
        onRenameChapter={handleRenameChapter}
        onDeleteChapter={handleDeleteChapter}
      />

      {/* Main Area */}
      <div class={styles.mainWrapper}>
        <Header />

        <main class={styles.scrollArea}>
          <div class={styles.contentMaxWidth}>
            {currentView.type === 'settings' ? (
              <SettingsView />
            ) : subjects.value.length === 0 ? (
              /* Blank Canvas Prompt */
              <div class={styles.emptyState}>
                <div class={styles.emptyIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    width="28"
                    height="28"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                  </svg>
                </div>
                <h2 class={styles.emptyTitle}>Welcome to your PW Study Planner!</h2>
                <p class={styles.emptySubtitle}>
                  Keep your lectures, DPPs, and revision completely organized. Start by creating
                  your first Subject (e.g. Physics, Chemistry, Maths).
                </p>
                <button class={styles.primaryActionBtn} onClick={handleOpenAddSubject}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    width="16"
                    height="16"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Create Your First Subject</span>
                </button>
              </div>
            ) : (
              <>
                {/* View Title */}
                <div class={styles.viewHeader}>
                  <h2 class={styles.viewTitle}>
                    {breadcrumb && <span class={styles.viewBreadcrumb}>{breadcrumb} / </span>}
                    <span>{title}</span>
                  </h2>
                  <p class={styles.taskCountLabel}>
                    {taskList.length} {taskList.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>

                {/* Stats */}
                <StatsCards />

                {/* Tag Filters */}
                <FilterSection />

                {/* Task List */}
                {taskList.length === 0 ? (
                  <div class={styles.emptyState}>
                    <div class={styles.emptyIcon}>
                      <span style={{ fontSize: '24px' }}>✨</span>
                    </div>
                    <h3 class={styles.emptyTitle}>No tasks here yet</h3>
                    <p class={styles.emptySubtitle}>
                      {currentView.type === 'completed'
                        ? "You haven't completed any tasks in this view yet."
                        : 'Ready to study? Add your first task like watching a lecture or solving a DPP.'}
                    </p>
                    {currentView.type !== 'completed' && (
                      <button class={styles.primaryActionBtn} onClick={handleFabClick}>
                        + Add Task
                      </button>
                    )}
                  </div>
                ) : (
                  taskList.map((task) => <TaskItem key={task.id} task={task} />)
                )}
              </>
            )}
          </div>
        </main>

        {/* Floating Add Task Button */}
        {currentView.type !== 'settings' && (
          <button class={styles.fab} onClick={handleFabClick} title="Add New Task">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              width="18"
              height="18"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Modals */}
      <AddTaskDialog
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        defaultSubjectId={currentView.subjectId}
        defaultChapterId={currentView.chapterId}
      />

      <AddSubjectModal
        open={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        editingSubject={editingSubject}
      />

      <AddChapterModal
        open={chapterModalOpen}
        subjectId={chapterModalSubjectId}
        onClose={() => setChapterModalOpen(false)}
        editingChapter={editingChapter}
      />

      <ConfirmModal
        open={confirmModalOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={async () => {
          await confirmConfig.action();
          setConfirmModalOpen(false);
        }}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </div>
  );
};
