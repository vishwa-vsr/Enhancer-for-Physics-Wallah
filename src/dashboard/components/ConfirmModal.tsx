import styles from './AddTaskDialog.module.css';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  open,
  title,
  message,
  confirmText = 'Delete',
  isDanger = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!open) return null;

  return (
    <div class={styles.modalOverlay} onClick={onCancel}>
      <div
        class={`${styles.modalContent} ${styles.confirmModalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div class={styles.modalHeader}>
          <h2>{title}</h2>
          <button class={styles.closeBtn} onClick={onCancel}>
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

        <p class={styles.confirmMessage}>{message}</p>

        <div class={styles.modalFooter}>
          <button type="button" class={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            class={`${styles.submitBtn} ${isDanger ? styles.dangerSubmitBtn : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
