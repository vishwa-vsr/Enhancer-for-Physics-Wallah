import { useState, useEffect } from 'preact/hooks';
import { subjects, chapters, addTask, updateTask, deleteTask, activeView, customTags } from '../store';
import { Task } from '../types';
import { DatePicker } from './DatePicker';
import { SelectDropdown } from '@shared/components/SelectDropdown';
import styles from './AddTaskDialog.module.css';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
  defaultChapterId?: string;
  editingTask?: Task | null;
  onDelete?: (task: Task) => void | Promise<void>;
}

export const AddTaskDialog = ({
  open,
  onClose,
  defaultSubjectId,
  defaultChapterId,
  editingTask,
  onDelete,
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

  const subjectOptions = subjects.value.map((s) => ({
    value: s.id,
    label: s.name,
    icon: s.icon || 'book',
    color: s.color || 'var(--accent-primary)',
  }));

  const chapterOptions = availableChapters.map((c) => ({
    value: c.id,
    label: c.name,
    icon: c.icon || 'file-text',
  }));

  const tagOptions = [
    { value: '', label: 'No Label' },
    ...customTags.value.map((t) => ({
      value: t.name,
      label: t.name,
    })),
  ];

  const [title, setTitle] = useState(editingTask?.title || '');
  const [dueDate, setDueDate] = useState(editingTask?.dueDate || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [selectedTag, setSelectedTag] = useState<string>(editingTask?.tags?.[0] || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
    if (editingTask) {
      setTitle(editingTask.title);
      setDueDate(editingTask.dueDate || '');
      setSelectedSubjectId(editingTask.subjectId);
      setSelectedChapterId(editingTask.chapterId);
      setDescription(editingTask.description || '');
      setSelectedTag(editingTask.tags?.[0] || '');
    } else {
      setTitle('');
      setDueDate('');
      setDescription('');
      setSelectedTag('');
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

    const trimmedDesc = description.trim();
    const tagsArray = selectedTag ? [selectedTag] : [];

    if (editingTask) {
      await updateTask(editingTask.id, {
        title: title.trim(),
        description: trimmedDesc || undefined,
        dueDate: dueDate || undefined,
        tags: tagsArray,
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId,
      });
    } else {
      await addTask({
        title: title.trim(),
        description: trimmedDesc || undefined,
        completed: false,
        dueDate: dueDate || undefined,
        tags: tagsArray,
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId,
      });
    }

    onClose();
  };

  const handleDelete = async () => {
    if (!editingTask) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (onDelete) {
      await onDelete(editingTask);
    } else {
      await deleteTask(editingTask.id);
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

        <form onSubmit={handleSubmit} class={styles.dialogForm}>
          <div class={styles.columnsContainer}>
            {/* Left Column: Title and Notes */}
            <div class={styles.leftColumn}>
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

              <div class={`${styles.formGroup} ${styles.notesGroup}`}>
                <label class={styles.label}>Notes</label>
                <textarea
                  class={styles.textarea}
                  placeholder="Add notes, formulas, or details (optional)..."
                  value={description}
                  onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
                  rows={5}
                />
              </div>
            </div>

            {/* Right Column: Subject, Chapter, Due Date, Study Label, Actions */}
            <div class={styles.rightColumn}>
              <div class={styles.rightFields}>
                {/* Subject & Chapter side-by-side */}
                <div class={styles.twoCol}>
                  <div class={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label class={styles.label}>Subject</label>
                    <SelectDropdown
                      options={subjectOptions}
                      value={selectedSubjectId}
                      onChange={(val) => setSelectedSubjectId(val)}
                      placeholder="Select Subject"
                      ariaLabel="Subject"
                    />
                  </div>

                  <div class={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label class={styles.label}>Chapter</label>
                    <SelectDropdown
                      options={chapterOptions}
                      value={selectedChapterId}
                      onChange={(val) => setSelectedChapterId(val)}
                      placeholder={availableChapters.length === 0 ? 'No chapters' : 'Select Chapter'}
                      disabled={availableChapters.length === 0}
                      emptyLabel="No chapters available"
                      ariaLabel="Chapter"
                    />
                  </div>
                </div>

                {/* Due Date & Study Label side-by-side */}
                <div class={styles.twoCol}>
                  <div class={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label class={styles.label}>Due Date</label>
                    <DatePicker
                      value={dueDate}
                      onChange={(val) => setDueDate(val)}
                      placeholder="dd-mm-yyyy"
                    />
                  </div>

                  <div class={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label class={styles.label}>Study Label</label>
                    <SelectDropdown
                      options={tagOptions}
                      value={selectedTag}
                      onChange={(val) => setSelectedTag(val)}
                      placeholder="No Label"
                      ariaLabel="Study Label"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer anchored at bottom of right column */}
              <div
                class={styles.modalFooter}
                style={{ justifyContent: editingTask ? 'space-between' : 'flex-end' }}
              >
                {editingTask && (
                  <button
                    type="button"
                    class={`${styles.deleteActionBtn} ${confirmDelete ? styles.deleteActionBtnConfirm : ''}`}
                    onClick={handleDelete}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      width="14"
                      height="14"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                    {confirmDelete ? 'Confirm?' : 'Delete'}
                  </button>
                )}

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
