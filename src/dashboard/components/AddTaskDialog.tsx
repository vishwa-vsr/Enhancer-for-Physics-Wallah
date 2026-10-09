import { useState, useEffect } from 'preact/hooks';
import { subjects, chapters, addTask, updateTask, activeView, customTags } from '../store';
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
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(!!editingTask?.description);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDueDate(editingTask.dueDate || '');
      setSelectedSubjectId(editingTask.subjectId);
      setSelectedChapterId(editingTask.chapterId);
      setDescription(editingTask.description || '');
      setSelectedTag(editingTask.tags?.[0] || '');
      setIsNotesOpen(!!editingTask.description);
    } else {
      setTitle('');
      setDueDate('');
      setDescription('');
      setSelectedTag('');
      setIsNotesOpen(false);
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

          {/* Collapsible Notes / Description */}
          {isNotesOpen ? (
            <div class={styles.formGroup}>
              <div class={styles.notesHeader}>
                <label class={styles.label} style={{ margin: 0 }}>Notes</label>
                <button
                  type="button"
                  class={styles.notesRemoveBtn}
                  onClick={() => {
                    setDescription('');
                    setIsNotesOpen(false);
                  }}
                >
                  Remove notes
                </button>
              </div>
              <textarea
                class={styles.textarea}
                placeholder="Add notes, formulas, or details (optional)..."
                value={description}
                onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
                rows={3}
              />
            </div>
          ) : (
            <button
              type="button"
              class={styles.notesToggleBtn}
              onClick={() => setIsNotesOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                width="14"
                height="14"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add notes</span>
            </button>
          )}

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
