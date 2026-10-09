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
  deleteTask,
  isAddChainModalOpen,
} from './store';
import { Subject, Chapter, Task } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { TaskItem } from './components/TaskItem';
import { AddTaskDialog } from './components/AddTaskDialog';
import { AddSubjectModal } from './components/AddSubjectModal';
import { AddChapterModal } from './components/AddChapterModal';
import { ConfirmModal } from './components/ConfirmModal';
import { SettingsView } from './components/SettingsView';
import { FlowView } from './components/FlowView';
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

  const activeSubject =
    currentView.type === 'chapter'
      ? subjects.value.find((s) => s.id === currentView.subjectId)
      : null;
  const activeChapter =
    currentView.type === 'chapter'
      ? chapters.value.find((c) => c.id === currentView.chapterId)
      : null;

  // View title calculation
  let title = 'Today';
  if (currentView.type === 'today') {
    title = 'Today Tasks';
  } else if (currentView.type === 'upcoming') {
    title = 'Upcoming Tasks';
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

  const handleDeleteTask = (task: Task) => {
    setConfirmConfig({
      title: 'Delete Task?',
      message: `Are you sure you want to delete "${task.title}"? This cannot be undone.`,
      action: async () => {
        await deleteTask(task.id);
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
    } else if (currentView.type === 'chapter') {
      isAddChainModalOpen.value = true;
    } else {
      setTaskModalOpen(true);
    }
  };

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
        <Header
          onOpenAddChapter={handleOpenAddChapter}
          onOpenAddTask={() => setTaskModalOpen(true)}
        />

        <main class={styles.scrollArea}>
          <div class={currentView.type === 'chapter' ? styles.flowFullWidth : styles.contentMaxWidth}>
            {currentView.type === 'settings' ? (
              <SettingsView />
            ) : (
              <>
                {/* Stats Section: only in Today tab */}
                {currentView.type === 'today' && <StatsCards />}

                {/* Tasks Section Header: only in Today / Upcoming */}
                {currentView.type !== 'chapter' && (
                  <div class={styles.viewHeader}>
                    <h2 class={styles.viewTitle}>{title}</h2>
                  </div>
                )}

                {/* Chapters are exclusively Flow View */}
                {currentView.type === 'chapter' ? (
                  currentView.chapterId ? (
                    <FlowView
                      chapterId={currentView.chapterId}
                      subjectId={currentView.subjectId || ''}
                    />
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'var(--bg-card)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-subtle)',
                        marginTop: '20px',
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: 'var(--accent-primary, #6366f1)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '16px',
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="24" height="24">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                      </div>
                      <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>
                        No chapters in this subject yet
                      </h3>
                      <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        Add your first chapter to begin creating study chains and tracking progress.
                      </p>
                      {activeSubject && (
                        <button
                          type="button"
                          onClick={() => handleOpenAddChapter(activeSubject.id)}
                          style={{
                            padding: '8px 18px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'var(--accent-primary, #6366f1)',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width="14" height="14">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add Chapter
                        </button>
                      )}
                    </div>
                  )
                ) : taskList.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '48px 20px',
                      color: 'var(--text-muted)',
                      fontSize: '13.5px',
                    }}
                  >
                    No tasks for {title.toLowerCase()}. You're all caught up!
                  </div>
                ) : (
                  taskList.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onDeleteRequest={handleDeleteTask}
                    />
                  ))
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
        onDelete={handleDeleteSubject}
      />

      <AddChapterModal
        open={chapterModalOpen}
        subjectId={chapterModalSubjectId}
        onClose={() => setChapterModalOpen(false)}
        editingChapter={editingChapter}
        onDelete={handleDeleteChapter}
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
