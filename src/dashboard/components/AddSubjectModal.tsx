import { useState, useEffect, useRef } from 'preact/hooks';
import { addSubject, updateSubject, deleteSubject } from '../store';
import { Subject } from '../types';
import { Modal } from '@shared/components/Modal';
import { IconPicker } from '@shared/components/IconPicker';
import { ConfirmDeleteButton } from '@shared/components/ConfirmDeleteButton';
import { PRESET_COLORS } from '@shared/colors';
import { ColorPicker } from '@shared/components/ColorPicker';
import styles from './SubjectModal.module.css';

interface AddSubjectModalProps {
  open: boolean;
  onClose: () => void;
  editingSubject?: Subject | null;
  onDelete?: (subject: Subject) => void;
}

export const AddSubjectModal = ({
  open,
  onClose,
  editingSubject,
  onDelete,
}: AddSubjectModalProps) => {
  const [name, setName] = useState(editingSubject ? editingSubject.name : '');
  const [color, setColor] = useState(
    editingSubject && editingSubject.color ? editingSubject.color : PRESET_COLORS[0],
  );
  const [icon, setIcon] = useState(
    editingSubject && editingSubject.icon ? editingSubject.icon : 'calculator',
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(editingSubject ? editingSubject.name : '');
      setColor(editingSubject && editingSubject.color ? editingSubject.color : PRESET_COLORS[0]);
      setIcon(editingSubject && editingSubject.icon ? editingSubject.icon : 'calculator');

      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
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

  const handleDelete = async () => {
    if (!editingSubject) return;
    if (onDelete) {
      onDelete(editingSubject);
    } else {
      await deleteSubject(editingSubject.id);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        {/* Subject Name & Color */}
        <div class={styles.formGroup}>
          <label class={styles.label}>Subject Name</label>
          <div class={styles.nameColorRow}>
            <input
              ref={inputRef}
              type="text"
              class={styles.input}
              placeholder="e.g. Physics, Chemistry, Mathematics"
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              required
            />
            <ColorPicker value={color} onChange={(c) => setColor(c)} align="right" />
          </div>
        </div>

        {/* Icon Picker */}
        <div class={styles.formGroup}>
          <IconPicker
            value={icon}
            onChange={(selectedIcon) => setIcon(selectedIcon)}
            color={color}
            label="Subject Icon"
            iconSize={20}
          />
        </div>

        {/* Modal Footer with Delete option on left if editing */}
        <div
          class={`${styles.modalFooter} ${editingSubject ? styles.modalFooterSpaceBetween : ''}`}
        >
          {editingSubject && (
            <ConfirmDeleteButton
              onConfirm={handleDelete}
              label="Delete Subject"
              confirmLabel="Confirm?"
            />
          )}

          <div class={styles.footerRightActions}>
            <button type="button" class={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" class={styles.submitBtn} disabled={!name.trim()}>
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
