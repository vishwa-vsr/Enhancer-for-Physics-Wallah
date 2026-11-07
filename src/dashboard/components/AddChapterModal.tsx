import { useState, useEffect, useRef } from 'preact/hooks';
import { addChapter, updateChapter, deleteChapter, subjects } from '../store';
import { Chapter } from '../types';
import { Modal } from '@shared/components/Modal';
import { IconPicker } from '@shared/components/IconPicker';
import { ConfirmDeleteButton } from '@shared/components/ConfirmDeleteButton';
import styles from './SubjectModal.module.css';

interface AddChapterModalProps {
  open: boolean;
  subjectId: string;
  onClose: () => void;
  editingChapter?: Chapter | null;
  onDelete?: (chapter: Chapter) => void;
}

export const AddChapterModal = ({
  open,
  subjectId,
  onClose,
  editingChapter,
  onDelete,
}: AddChapterModalProps) => {
  const subject = subjects.value.find((s) => s.id === subjectId);
  const [name, setName] = useState(editingChapter ? editingChapter.name : '');
  const [icon, setIcon] = useState(
    editingChapter && editingChapter.icon ? editingChapter.icon : 'file-text',
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(editingChapter ? editingChapter.name : '');
      setIcon(editingChapter && editingChapter.icon ? editingChapter.icon : 'file-text');

      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [editingChapter, open]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingChapter) {
      await updateChapter(editingChapter.id, {
        name: name.trim(),
        icon,
      });
    } else {
      await addChapter(subjectId, name.trim(), icon);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!editingChapter) return;
    if (onDelete) {
      onDelete(editingChapter);
    } else {
      await deleteChapter(editingChapter.id);
    }
    onClose();
  };

  const title = editingChapter
    ? 'Edit Chapter'
    : `Add Chapter to ${subject ? subject.name : 'Subject'}`;

  const subjectColor = subject?.color || 'var(--accent-primary)';

  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit}>
        <div class={styles.formGroup}>
          <label class={styles.label}>Chapter Title</label>
          <input
            ref={inputRef}
            type="text"
            class={styles.input}
            placeholder="e.g. Kinematics, Chemical Bonding, Calculus"
            value={name}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
            required
          />
        </div>

        {/* Chapter Icon */}
        <div class={styles.formGroup}>
          <IconPicker
            value={icon}
            onChange={(selectedIcon) => setIcon(selectedIcon)}
            color={subjectColor}
            label="Chapter Icon"
            iconSize={18}
          />
        </div>

        {/* Modal Footer with Delete option on left if editing */}
        <div
          class={`${styles.modalFooter} ${editingChapter ? styles.modalFooterSpaceBetween : ''}`}
        >
          {editingChapter && (
            <ConfirmDeleteButton
              onConfirm={handleDelete}
              label="Delete Chapter"
              confirmLabel="Confirm?"
            />
          )}

          <div class={styles.footerRightActions}>
            <button type="button" class={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" class={styles.submitBtn} disabled={!name.trim()}>
              {editingChapter ? 'Save Changes' : 'Create Chapter'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
