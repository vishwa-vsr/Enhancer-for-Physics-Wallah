import { useState, useEffect } from 'preact/hooks';
import styles from './ConfirmDeleteButton.module.css';

export interface ConfirmDeleteButtonProps {
  onConfirm: () => void | Promise<void>;
  label?: string;
  confirmLabel?: string;
  timeoutMs?: number;
  disabled?: boolean;
  className?: string;
  confirmClassName?: string;
  ariaLabel?: string;
}

export const ConfirmDeleteButton = ({
  onConfirm,
  label = 'Delete',
  confirmLabel = 'Confirm?',
  timeoutMs = 3500,
  disabled = false,
  className = '',
  confirmClassName = '',
  ariaLabel,
}: ConfirmDeleteButtonProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isConfirming) return;
    const timer = setTimeout(() => {
      setIsConfirming(false);
    }, timeoutMs);
    return () => clearTimeout(timer);
  }, [isConfirming, timeoutMs]);

  useEffect(() => {
    if (disabled && isConfirming) {
      setIsConfirming(false);
    }
  }, [disabled, isConfirming]);

  const handleClick = async () => {
    if (disabled) return;
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    setIsConfirming(false);
    await onConfirm();
  };

  const currentLabel = isConfirming ? confirmLabel : label;

  return (
    <button
      type="button"
      class={`${styles.deleteActionBtn} ${
        isConfirming ? `${styles.deleteActionBtnConfirm} ${confirmClassName}` : ''
      } ${className}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel || currentLabel}
      title={ariaLabel || currentLabel}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        width="14"
        height="14"
        aria-hidden="true"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
      <span>{currentLabel}</span>
    </button>
  );
};
