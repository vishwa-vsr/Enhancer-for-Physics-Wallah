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
import { Modal } from '@shared/components/Modal';
import { ConfirmDeleteButton } from '@shared/components/ConfirmDeleteButton';
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
  const currentView = activeView.value;
  const hideSubjectChapter = currentView.type === 'inbox';

  const getDefaultSubjectId = () => {
    if (editingTask) return editingTask.subjectId || '';
    if (currentView.type === 'inbox' || currentView.type === 'today') {
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
    { value: '', label: 'No Subject' },
    ...subjects.value.map((s) => ({
      value: s.id,
      label: s.name,
      icon: s.icon || 'calculator',
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
    const match = customTags.value.find((t) => t.name.toLowerCase() === rawTag.toLowerCase());
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
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
          currentView.type === 'inbox' || currentView.type === 'today'
            ? ''
            : defaultSubjectId || currentView.subjectId || subjects.value[0]?.id || '';
        setSelectedSubjectId(subId);
        const chaps = subId ? chapters.value.filter((c) => c.subjectId === subId) : [];
        setSelectedChapterId(
          subId ? defaultChapterId || currentView.chapterId || chaps[0]?.id || '' : '',
        );
      }

      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open, editingTask]);

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
    if (onDelete) {
      await onDelete(editingTask);
    } else {
      await deleteTask(editingTask.id);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingTask ? 'Edit Task' : 'Add New Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit} class={styles.dialogForm}>
        <div class={styles.columnsContainer}>
          {/* Left Column: Core Fields */}
          <div class={styles.leftColumn}>
            <div class={styles.formGroupFlush}>
              <label class={styles.label}>Task Title</label>
              <input
                ref={inputRef}
                type="text"
                class={styles.input}
                placeholder="What needs to be studied or completed?"
                value={title}
                onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
                required
              />
            </div>

            <div class={styles.formGroupFlush}>
              <label class={styles.label}>Description</label>
              <textarea
                class={styles.textarea}
                placeholder="Add sub-topics, questions, or lecture notes..."
                value={description}
                onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
                rows={7}
              />
            </div>
          </div>

          {/* Right Column: Meta & Actions */}
          <div class={styles.rightColumn}>
            <div class={styles.rightMetaFields}>
              {/* Subject */}
              {!hideSubjectChapter && (
                <div class={styles.formGroupFlush}>
                  <label class={styles.label}>Subject</label>
                  <SelectDropdown
                    options={subjectOptions}
                    value={selectedSubjectId}
                    onChange={(val) => {
                      setSelectedSubjectId(val);
                      const chaps = val ? chapters.value.filter((c) => c.subjectId === val) : [];
                      setSelectedChapterId(chaps[0]?.id || '');
                    }}
                    placeholder="Select subject"
                    ariaLabel="Subject"
                    renderIcon={renderStudyIcon}
                  />
                </div>
              )}

              {/* Chapter */}
              {!hideSubjectChapter && selectedSubjectId && (
                <div class={styles.formGroupFlush}>
                  <label class={styles.label}>Chapter</label>
                  <SelectDropdown
                    options={chapterOptions}
                    value={selectedChapterId}
                    onChange={(val) => setSelectedChapterId(val)}
                    placeholder="Select chapter"
                    ariaLabel="Chapter"
                    emptyLabel="No chapters"
                    renderIcon={renderStudyIcon}
                  />
                </div>
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
                <ConfirmDeleteButton
                  onConfirm={handleDelete}
                  label="Delete"
                  confirmLabel="Confirm?"
                />
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
    </Modal>
  );
};
