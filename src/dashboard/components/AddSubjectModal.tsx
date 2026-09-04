import { useState, useEffect } from 'preact/hooks';
import { addSubject, updateSubject } from '../store';
import { Subject } from '../types';
import { StudyIcon, STUDY_ICONS_LIST } from '@shared/components/StudyIcons';
import styles from './AddTaskDialog.module.css';

interface AddSubjectModalProps {
  open: boolean;
  onClose: () => void;
  editingSubject?: Subject | null;
  onDelete?: (subject: Subject) => void;
}

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ef4444', // Red
];

export const AddSubjectModal = ({
  open,
  onClose,
  editingSubject,
  onDelete,
}: AddSubjectModalProps) => {
  if (!open) return null;

  const [name, setName] = useState(editingSubject ? editingSubject.name : '');
  const [color, setColor] = useState(
    editingSubject && editingSubject.color ? editingSubject.color : PRESET_COLORS[0],
  );
  const [icon, setIcon] = useState(
    editingSubject && editingSubject.icon ? editingSubject.icon : 'calculator',
  );

  useEffect(() => {
    setName(editingSubject ? editingSubject.name : '');
    setColor(editingSubject && editingSubject.color ? editingSubject.color : PRESET_COLORS[0]);
    setIcon(editingSubject && editingSubject.icon ? editingSubject.icon : 'calculator');
  }, [editingSubject, open]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSubject) {
      await updateSubject(editingSubject.id, {
        name: name.trim(),
        color,
        icon,
      });
    } else {
      await addSubject(name.trim(), color, icon);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingSubject && onDelete) {
      onClose();
      onDelete(editingSubject);
    }
  };

  return (
    <div class={styles.modalOverlay} onClick={onClose}>
      <div
        class={styles.modalContent}
        style={{ width: '420px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div class={styles.modalHeader}>
          <h2>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
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
          {/* Subject Name */}
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

          {/* Color Picker */}
          <div class={styles.formGroup}>
            <label class={styles.label}>Subject Color</label>
            <div class={styles.colorGrid}>
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  class={`${styles.colorBtn} ${color === c ? styles.colorBtnSelected : ''}`}
                  onClick={() => setColor(c)}
                >
                  <span class={styles.colorInner} style={{ backgroundColor: c }} />
                </button>
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div class={styles.formGroup}>
            <label class={styles.label}>Subject Icon</label>
            <div class={styles.iconGrid}>
              {STUDY_ICONS_LIST.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  class={`${styles.iconBtn} ${icon === item.id ? styles.iconBtnSelected : ''}`}
                  onClick={() => setIcon(item.id)}
                >
                  <StudyIcon
                    name={item.id}
                    size={20}
                    color={icon === item.id ? color : 'var(--text-secondary)'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer with Delete option on left if editing */}
          <div
            class={styles.modalFooter}
            style={{ justifyContent: editingSubject ? 'space-between' : 'flex-end' }}
          >
            {editingSubject && (
              <button type="button" class={styles.deleteActionBtn} onClick={handleDelete}>
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
                Delete Subject
              </button>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button type="button" class={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" class={styles.submitBtn} disabled={!name.trim()}>
                {editingSubject ? 'Save Changes' : 'Create Subject'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
