import { useState, useEffect } from 'preact/hooks';
import { addChapter, updateChapter, subjects } from '../store';
import { Chapter } from '../types';
import { StudyIcon, STUDY_ICONS_LIST } from '@shared/components/StudyIcons';
import { getAlphaColor } from '@shared/theme';
import styles from './AddTaskDialog.module.css';

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
  if (!open) return null;

  const subject = subjects.value.find((s) => s.id === subjectId);
  const [name, setName] = useState(editingChapter ? editingChapter.name : '');
  const [icon, setIcon] = useState(
    editingChapter && editingChapter.icon ? editingChapter.icon : 'file-text',
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Math', 'Physics', 'Chemistry & Biology', 'Tech & Code', 'Study & General'];

  const displayedIcons =
    selectedCategory === 'All'
      ? STUDY_ICONS_LIST
      : STUDY_ICONS_LIST.filter((i) => i.category === selectedCategory);

  useEffect(() => {
    setName(editingChapter ? editingChapter.name : '');
    setIcon(editingChapter && editingChapter.icon ? editingChapter.icon : 'file-text');
    setSelectedCategory('All');
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

  const handleDelete = () => {
    if (editingChapter && onDelete) {
      onClose();
      onDelete(editingChapter);
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
          <h2>
            {editingChapter
              ? 'Edit Chapter'
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
          {/* Chapter Name */}
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

          {/* Chapter Icon */}
          <div class={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label class={styles.label} style={{ margin: 0 }}>Chapter Icon</label>
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
                const subjectColor = subject?.color || 'var(--accent-primary)';
                return (
                  <button
                    type="button"
                    key={item.id}
                    class={`${styles.iconBtn} ${isSelected ? styles.iconBtnSelected : ''}`}
                    style={
                      isSelected && subject?.color
                        ? {
                            borderColor: subject.color,
                            backgroundColor: getAlphaColor(subject.color, 0.16),
                            color: subject.color,
                          }
                        : undefined
                    }
                    onClick={() => setIcon(item.id)}
                  >
                    <StudyIcon
                      name={item.id}
                      size={18}
                      color={isSelected ? subjectColor : 'var(--text-secondary)'}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Footer with Delete option on left if editing */}
          <div
            class={styles.modalFooter}
            style={{ justifyContent: editingChapter ? 'space-between' : 'flex-end' }}
          >
            {editingChapter && (
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
                </svg>
                Delete Chapter
              </button>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button type="button" class={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" class={styles.submitBtn} disabled={!name.trim()}>
                {editingChapter ? 'Save Changes' : 'Create Chapter'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
