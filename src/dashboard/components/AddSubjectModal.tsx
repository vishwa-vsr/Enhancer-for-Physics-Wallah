import { useState, useEffect } from 'preact/hooks';
import { addSubject, renameSubject } from '../store';
import { Subject } from '../types';
import styles from './AddTaskDialog.module.css';

interface AddSubjectModalProps {
  open: boolean;
  onClose: () => void;
  editingSubject?: Subject | null;
}

export const AddSubjectModal = ({ open, onClose, editingSubject }: AddSubjectModalProps) => {
  if (!open) return null;

  const [name, setName] = useState(editingSubject ? editingSubject.name : '');

  useEffect(() => {
    setName(editingSubject ? editingSubject.name : '');
  }, [editingSubject, open]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSubject) {
      await renameSubject(editingSubject.id, name.trim());
    } else {
      await addSubject(name.trim());
    }
    onClose();
  };

  return (
    <div class={styles.modalOverlay} onClick={onClose}>
      <div
        class={styles.modalContent}
        style={{ width: '400px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div class={styles.modalHeader}>
          <h2>{editingSubject ? 'Rename Subject' : 'Add New Subject'}</h2>
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
            <label class={styles.label}>Subject Name</label>
            <input
              type="text"
              class={styles.input}
              placeholder="e.g. Physics, Chemistry, Mathematics"
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
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
