import { useState, useEffect } from 'preact/hooks';
import { addSubject, updateSubject } from '../store';
import { Subject } from '../types';
import { StudyIcon, STUDY_ICONS_LIST } from '@shared/components/StudyIcons';
import { getAlphaColor } from '@shared/theme';
import styles from './SubjectModal.module.css';

interface AddSubjectModalProps {
  open: boolean;
  onClose: () => void;
  editingSubject?: Subject | null;
  onDelete?: (subject: Subject) => void;
}

import { PRESET_COLORS } from '@shared/colors';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Math', 'Physics', 'Chemistry & Biology', 'Tech & Code', 'Study & General'];

  const displayedIcons =
    selectedCategory === 'All'
      ? STUDY_ICONS_LIST
      : STUDY_ICONS_LIST.filter((i) => i.category === selectedCategory);

  useEffect(() => {
    setName(editingSubject ? editingSubject.name : '');
    setColor(editingSubject && editingSubject.color ? editingSubject.color : PRESET_COLORS[0]);
    setIcon(editingSubject && editingSubject.icon ? editingSubject.icon : 'calculator');
    setSelectedCategory('All');
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
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label class={styles.label} style={{ margin: 0 }}>Subject Icon</label>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {STUDY_ICONS_LIST.find((i) => i.id === icon)?.label || icon}
              </span>
            </div>

            <div class={styles.iconCategoryBar}>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  class={`${styles.iconCategoryChip} ${selectedCategory === cat ? styles.iconCategoryChipActive : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'Chemistry & Biology' ? 'Chem & Bio' : cat === 'Study & General' ? 'General' : cat}
                </button>
              ))}
            </div>

            <div class={styles.iconGrid}>
              {displayedIcons.map((item) => {
                const isSelected = icon === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    class={`${styles.iconBtn} ${isSelected ? styles.iconBtnSelected : ''}`}
                    style={
                      isSelected
                        ? {
                            borderColor: color,
                            backgroundColor: getAlphaColor(color, 0.16),
                            color,
                          }
                        : undefined
                    }
                    onClick={() => setIcon(item.id)}
                  >
                    <StudyIcon
                      name={item.id}
                      size={20}
                      color={isSelected ? color : 'var(--text-secondary)'}
                    />
                  </button>
                );
              })}
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
