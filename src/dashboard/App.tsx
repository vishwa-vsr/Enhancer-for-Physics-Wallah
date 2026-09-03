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
import { TaskItem } from './components/TaskItem';
import { AddTaskDialog } from './components/AddTaskDialog';
import { AddSubjectModal } from './components/AddSubjectModal';
import { AddChapterModal } from './components/AddChapterModal';
import { ConfirmModal } from './components/ConfirmModal';
import { SettingsView } from './components/SettingsView';
import styles from './App.module.css';

export const App = () => {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [chapterModalSubjectId, setChapterModalSubjectId] = useState('');

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

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
    title = 'Today Tasks';
  } else if (currentView.type === 'upcoming') {
    title = 'Upcoming Tasks';
  } else if (currentView.type === 'chapter') {
    const sub = subjects.value.find((s) => s.id === currentView.subjectId);
    const chap = chapters.value.find((c) => c.id === currentView.chapterId);
    title = chap ? `${chap.name} Tasks` : 'Chapter Tasks';
    breadcrumb = sub ? `${sub.name} / ` : '';
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

  const handleDeleteSubject = (sub: Subject) => {
    const subTasks = tasks.value.filter((t) => t.subjectId === sub.id);
    const subChaps = chapters.value.filter((c) => c.subjectId === sub.id);

    setConfirmConfig({
      title: `Delete '${sub.name}'?`,
      message: `This will delete '${sub.name}' along with its ${subChaps.length} chapter(s) and ${subTasks.length} task(s). Continue?`,
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
      title: `Delete '${chap.name}'?`,
      message: `This will delete '${chap.name}' and its ${chapTasks.length} task(s). Continue?`,
      action: async () => {
        await deleteChapter(chap.id);
      },
    });
    setConfirmModalOpen(true);
  };

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
      {/* Left Sidebar */}
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
            ) : (
              <>
                {/* Stats Section */}
                <StatsCards />

                {/* Tasks Section Header */}
                <div class={styles.viewHeader}>
                  <h2 class={styles.viewTitle}>
                    {breadcrumb && <span class={styles.viewBreadcrumb}>{breadcrumb}</span>}
                    <span>{title}</span>
                  </h2>
                  <p class={styles.taskCountLabel}>
                    {taskList.length} {taskList.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>

                {/* Task List: completely clean without star or 'no tasks' text */}
                {taskList.length === 0 ? null : (
                  taskList.map((task) => <TaskItem key={task.id} task={task} />)
                )}
              </>
            )}
          </div>
        </main>

        {/* Floating Add Task Circular Button */}
        {currentView.type !== 'settings' && (
          <button class={styles.fab} onClick={handleFabClick} title="Add Task">
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
