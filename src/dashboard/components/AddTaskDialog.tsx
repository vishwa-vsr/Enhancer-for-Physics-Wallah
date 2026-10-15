import { useState, useEffect, useRef } from 'preact/hooks';
import {
  subjects,
  chapters,
  addChapter,
  addTask,
  updateTask,
  deleteTask,
  activeView,
  customTags,
  getLocalDateStr,
} from '../store';
import { Task } from '../types';
import { DatePicker } from './DatePicker';
import { SelectDropdown } from '@shared/components/SelectDropdown';
import { StudyIcon } from '@shared/components/StudyIcons';
import styles from './AddTaskDialog.module.css';

const renderStudyIcon = (name: string, size: number, color: string) => (
  <StudyIcon name={name} size={size} color={color} />
);

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
  const hideSubjectChapter = currentView.type === 'inbox';

  const getDefaultSubjectId = () => {
    if (editingTask) return editingTask.subjectId || '';
    if (currentView.type === 'inbox' || currentView.type === 'today' || currentView.type === 'upcoming') {
      return '';
    }
    return defaultSubjectId || currentView.subjectId || subjects.value[0]?.id || '';
  };

  const initialSubId = getDefaultSubjectId();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubId);

  const availableChapters = selectedSubjectId
    ? chapters.value.filter((c) => c.subjectId === selectedSubjectId)
    : [];
  const initialChapId = editingTask
    ? editingTask.chapterId || ''
    : selectedSubjectId
    ? defaultChapterId || currentView.chapterId || availableChapters[0]?.id || ''
    : '';
  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialChapId);

  const subjectOptions = [
    { value: '', label: 'None (Inbox)' },
    ...subjects.value.map((s) => ({
      value: s.id,
      label: s.name,
      icon: s.icon || 'book',
      color: s.color || 'var(--accent-primary)',
    })),
  ];

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

  const getValidInitialTag = (task?: Task | null): string => {
    const rawTag = task?.tags?.[0];
    if (!rawTag) return '';
    const match = customTags.value.find(
      (t) => t.name.toLowerCase() === rawTag.toLowerCase(),
    );
    return match ? match.name : '';
  };

  const defaultDueDate = editingTask
    ? editingTask.dueDate || ''
    : currentView.type === 'today'
    ? getLocalDateStr()
    : '';

  const [title, setTitle] = useState(editingTask?.title || '');
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [description, setDescription] = useState(editingTask?.description || '');
  const [selectedTag, setSelectedTag] = useState<string>(getValidInitialTag(editingTask));
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
    if (editingTask) {
      setTitle(editingTask.title);
      setDueDate(editingTask.dueDate || '');
      setSelectedSubjectId(editingTask.subjectId || '');
      setSelectedChapterId(editingTask.chapterId || '');
      setDescription(editingTask.description || '');
      setSelectedTag(getValidInitialTag(editingTask));
    } else {
      setTitle('');
      setDueDate(currentView.type === 'today' ? getLocalDateStr() : '');
      setDescription('');
      setSelectedTag('');
      const subId =
        currentView.type === 'inbox' || currentView.type === 'today' || currentView.type === 'upcoming'
          ? ''
          : defaultSubjectId || currentView.subjectId || subjects.value[0]?.id || '';
      setSelectedSubjectId(subId);
      const chaps = subId ? chapters.value.filter((c) => c.subjectId === subId) : [];
      setSelectedChapterId(subId ? defaultChapterId || currentView.chapterId || chaps[0]?.id || '' : '');
    }
  }, [open, editingTask]);

  useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => {
      setConfirmDelete(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [confirmDelete]);

  useEffect(() => {
    if (!selectedSubjectId) {
      setSelectedChapterId('');
      return;
    }
    const chaps = chapters.value.filter((c) => c.subjectId === selectedSubjectId);
    if (chaps.length > 0) {
      if (!chaps.some((c) => c.id === selectedChapterId)) {
        setSelectedChapterId(chaps[0].id);
      }
    } else {
      setSelectedChapterId('');
    }
  }, [selectedSubjectId]);

  const isValidSelection =
    hideSubjectChapter ||
    !selectedSubjectId ||
    Boolean(selectedSubjectId && (selectedChapterId || availableChapters.length === 0));

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!title.trim() || !isValidSelection) return;

    const trimmedDesc = description.trim();
    const tagsArray = selectedTag ? [selectedTag] : [];
    const finalSubjectId = hideSubjectChapter || !selectedSubjectId ? '' : selectedSubjectId;
    let finalChapterId = hideSubjectChapter || !selectedSubjectId ? '' : selectedChapterId;

    if (finalSubjectId && !finalChapterId) {
      const newChap = await addChapter(finalSubjectId, 'Chapter 1');
      finalChapterId = newChap.id;
    }

    if (editingTask) {
      await updateTask(editingTask.id, {
        title: title.trim(),
        description: trimmedDesc || undefined,
        dueDate: dueDate || undefined,
        tags: tagsArray,
        subjectId: finalSubjectId,
        chapterId: finalChapterId,
      });
    } else {
      await addTask({
        title: title.trim(),
        description: trimmedDesc || undefined,
        completed: false,
        dueDate: dueDate || undefined,
        tags: tagsArray,
        subjectId: finalSubjectId,
        chapterId: finalChapterId,
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

  const isOverlayMouseDownRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleOverlayMouseDown = (e: MouseEvent) => {
    isOverlayMouseDownRef.current = e.target === e.currentTarget;
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (isOverlayMouseDownRef.current && e.target === e.currentTarget) {
      onClose();
    }
    isOverlayMouseDownRef.current = false;
  };

  return (
    <div
      class={styles.modalOverlay}
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
    >
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
                  maxLength={150}
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
                  rows={10}
                />
              </div>
            </div>

            {/* Right Column: Subject, Chapter, Due Date, Study Label, Actions */}
            <div class={styles.rightColumn}>
              <div class={styles.rightFields}>
                {/* Subject & Chapter (hidden in Inbox tab) */}
                {!hideSubjectChapter && (
                  <>
                    <div class={styles.formGroupFlush}>
                      <label class={styles.label}>Subject</label>
                      <SelectDropdown
                        options={subjectOptions}
                        value={selectedSubjectId}
                        onChange={(val) => setSelectedSubjectId(val)}
                        placeholder="None (Inbox)"
                        ariaLabel="Subject"
                        renderIcon={renderStudyIcon}
                      />
                    </div>

                    <div class={styles.formGroupFlush}>
                      <label class={styles.label}>Chapter</label>
                      <SelectDropdown
                        options={chapterOptions}
                        value={selectedChapterId}
                        onChange={(val) => setSelectedChapterId(val)}
                        placeholder={
                          !selectedSubjectId
                            ? 'None (Inbox)'
                            : availableChapters.length === 0
                            ? 'No chapters'
                            : 'Select Chapter'
                        }
                        disabled={!selectedSubjectId || availableChapters.length === 0}
                        emptyLabel="No chapters available"
                        ariaLabel="Chapter"
                        renderIcon={renderStudyIcon}
                      />
                    </div>

                    {selectedSubjectId && availableChapters.length === 0 && (
                      <p class={styles.noChaptersHint}>
                        No chapters in this subject yet — "Chapter 1" will be automatically created.
                      </p>
                    )}
                  </>
                )}

                {/* Due Date */}
                <div class={styles.formGroupFlush}>
                  <label class={styles.label}>Due Date</label>
                  <DatePicker
                    value={dueDate}
                    onChange={(val) => setDueDate(val)}
                    placeholder="dd-mm-yyyy"
                  />
                </div>

                {/* Study Label */}
                <div class={styles.formGroupFlush}>
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

              {/* Modal Footer anchored at bottom of right column */}
              <div
                class={`${styles.modalFooter} ${editingTask ? styles.modalFooterSpaceBetween : ''}`}
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

                <div class={styles.footerRightActions}>
                  <button type="button" class={styles.cancelBtn} onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class={styles.submitBtn}
                    disabled={!title.trim() || !isValidSelection}
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
