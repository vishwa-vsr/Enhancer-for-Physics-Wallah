import { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ComponentChildren;
  headerActions?: ComponentChildren;
  hideCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  contentClassName?: string;
  ariaLabel?: string;
  children: ComponentChildren;
}

export const Modal = ({
  open,
  onClose,
  title,
  headerActions,
  hideCloseButton = false,
  size = 'md',
  className = '',
  contentClassName = '',
  ariaLabel,
  children,
}: ModalProps) => {
  const isOverlayMouseDownRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't close if default is already handled (e.g. within an open dropdown)
      if (e.key === 'Escape' && !e.defaultPrevented) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayMouseDown = (e: MouseEvent) => {
    isOverlayMouseDownRef.current = e.target === e.currentTarget;
  };

  const handleOverlayClick = (e: MouseEvent) => {
    // Only close if the mouse press AND mouse release both happened on the backdrop
    if (isOverlayMouseDownRef.current && e.target === e.currentTarget) {
      onClose();
    }
    isOverlayMouseDownRef.current = false;
  };

  const sizeClass =
    size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

  return (
    <div
      class={`${styles.modalOverlay} ${className}`}
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : ariaLabel}
    >
      <div class={`${styles.modalContent} ${sizeClass} ${contentClassName}`}>
        {(title || !hideCloseButton || headerActions) && (
          <div class={styles.modalHeader}>
            {typeof title === 'string' ? <h2 class={styles.modalTitle}>{title}</h2> : title}
            <div class={styles.modalHeaderRight}>
              {headerActions}
              {!hideCloseButton && (
                <button
                  type="button"
                  class={styles.closeBtn}
                  onClick={onClose}
                  aria-label="Close dialog"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="16"
                    height="16"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
