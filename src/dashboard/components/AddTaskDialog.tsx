import { useState, useEffect } from 'preact/hooks';
import { subjects, chapters, addTask, updateTask, activeView } from '../store';
import { Task } from '../types';
import styles from './AddTaskDialog.module.css';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
  defaultChapterId?: string;
  editingTask?: Task | null;
}

export const AddTaskDialog = ({
  open,
  onClose,
  defaultSubjectId,
  defaultChapterId,
  editingTask,
}: AddTaskDialogProps) => {
  if (!open) return null;

  const currentView = activeView.value;

  const initialSubId =
    editingTask?.subjectId || defaultSubjectId || currentView.subjectId || subjects.value[0]?.id || '';
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubId);

  const availableChapters = chapters.value.filter((c) => c.subjectId === selectedSubjectId);
  const initialChapId =
    editingTask?.chapterId || defaultChapterId || currentView.chapterId || availableChapters[0]?.id || '';
  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialChapId);

  const [title, setTitle] = useState(editingTask?.title || '');
  const [dueDate, setDueDate] = useState(editingTask?.dueDate || '');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDueDate(editingTask.dueDate || '');
      setSelectedSubjectId(editingTask.subjectId);
      setSelectedChapterId(editingTask.chapterId);
    } else {
      setTitle('');
      setDueDate('');
      const subId = defaultSubjectId || currentView.subjectId || subjects.value[0]?.id || '';
      setSelectedSubjectId(subId);
      const chaps = chapters.value.filter((c) => c.subjectId === subId);
      setSelectedChapterId(defaultChapterId || currentView.chapterId || chaps[0]?.id || '');
    }
  }, [open, editingTask]);

  useEffect(() => {
    const chaps = chapters.value.filter((c) => c.subjectId === selectedSubjectId);
    if (chaps.length > 0) {
      if (!chaps.some((c) => c.id === selectedChapterId)) {
        setSelectedChapterId(chaps[0].id);
      }
    } else {
      setSelectedChapterId('');
    }
  }, [selectedSubjectId]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!title.trim() || !selectedSubjectId || !selectedChapterId) return;

    if (editingTask) {
      await updateTask(editingTask.id, {
        title: title.trim(),
        dueDate: dueDate || undefined,
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId,
      });
    } else {
      await addTask({
        title: title.trim(),
        completed: false,
        dueDate: dueDate || undefined,
        tags: [],
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId,
      });
    }

    onClose();
  };

  return (
    <div class={styles.modalOverlay} onClick={onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div class={styles.modalHeader}>
          <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
          <button class={styles.closeBtn} onClick={onClose}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              width="18"
              height="18"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Subject & Chapter Selectors */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div class={styles.formGroup} style={{ marginBottom: 0 }}>
              <label class={styles.label}>Subject</label>
              <select
                class={styles.select}
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId((e.target as HTMLSelectElement).value)}
              >
                {subjects.value.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div class={styles.formGroup} style={{ marginBottom: 0 }}>
              <label class={styles.label}>Chapter</label>
              <select
                class={styles.select}
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId((e.target as HTMLSelectElement).value)}
                disabled={availableChapters.length === 0}
              >
                {availableChapters.length === 0 ? (
                  <option value="">No chapters</option>
                ) : (
                  availableChapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Title */}
          <div class={styles.formGroup}>
            <label class={styles.label}>Task Title</label>
            <input
              type="text"
              class={styles.input}
              placeholder="Enter task title..."
              value={title}
              onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
              required
              autoFocus
            />
          </div>

          {/* Due Date */}
          <div class={styles.formGroup}>
            <label class={styles.label}>Due Date</label>
            <input
              type="date"
              class={styles.input}
              value={dueDate}
              onInput={(e) => setDueDate((e.target as HTMLInputElement).value)}
            />
          </div>

          {/* Modal Footer */}
          <div class={styles.modalFooter}>
            <button type="button" class={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              class={styles.submitBtn}
              disabled={!title.trim() || !selectedSubjectId || !selectedChapterId}
            >
              {editingTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
