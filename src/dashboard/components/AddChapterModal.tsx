import { useState, useEffect } from 'preact/hooks';
import { addChapter, renameChapter, subjects } from '../store';
import { Chapter } from '../types';
import styles from './AddTaskDialog.module.css';

interface AddChapterModalProps {
  open: boolean;
  subjectId: string;
  onClose: () => void;
  editingChapter?: Chapter | null;
}

export const AddChapterModal = ({
  open,
  subjectId,
  onClose,
  editingChapter,
}: AddChapterModalProps) => {
  if (!open) return null;

  const subject = subjects.value.find((s) => s.id === subjectId);
  const [name, setName] = useState(editingChapter ? editingChapter.name : '');

  useEffect(() => {
    setName(editingChapter ? editingChapter.name : '');
  }, [editingChapter, open]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingChapter) {
      await renameChapter(editingChapter.id, name.trim());
    } else {
      await addChapter(subjectId, name.trim());
    }
    onClose();
  };

  return (
    <div class={styles.modalOverlay} onClick={onClose}>
      <div
        class={styles.modalContent}
        style={{ width: '420px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div class={styles.modalHeader}>
          <h2>
            {editingChapter
              ? 'Rename Chapter'
              : `Add Chapter to ${subject ? subject.name : 'Subject'}`}
          </h2>
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
          <div class={styles.formGroup}>
            <label class={styles.label}>Chapter Title</label>
            <input
              type="text"
              class={styles.input}
              placeholder="e.g. Kinematics, Chemical Bonding, Calculus"
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              required
              autoFocus
            />
          </div>

          <div class={styles.modalFooter}>
            <button type="button" class={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" class={styles.submitBtn} disabled={!name.trim()}>
              {editingChapter ? 'Save Changes' : 'Create Chapter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
