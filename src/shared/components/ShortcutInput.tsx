import { useState } from 'preact/hooks';
import styles from './ShortcutInput.module.css';

export interface ShortcutInputProps {
  value: string;
  onChange: (key: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
  emptyLabel?: string;
  placeholder?: string;
  validate?: (candidateKey: string) => string | null;
  onNotice?: (message: string | null) => void;
  className?: string;
}

export const ShortcutInput = ({
  value,
  onChange,
  disabled = false,
  ariaLabel,
  title,
  emptyLabel = '—',
  placeholder = 'Press key...',
  validate,
  onNotice,
  className = '',
}: ShortcutInputProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleFocus = () => {
    if (disabled) return;
    setIsEditing(true);
    if (onNotice) onNotice(null);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();
    const input = e.target as HTMLInputElement;

    // Ignore modifier and navigation keys
    if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    // Cancel edit without changing
    if (e.key === 'Escape') {
      setIsEditing(false);
      input.blur();
      return;
    }

    // Clear key
    if (e.key === 'Backspace' || e.key === 'Delete') {
      onChange('');
      if (onNotice) onNotice(null);
      setIsEditing(false);
      input.blur();
      return;
    }

    // Reserve spacebar
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space') {
      if (onNotice) {
        onNotice('Spacebar is reserved for video playback and speed hold.');
      }
      setIsEditing(false);
      input.blur();
      return;
    }

    // Only allow single alphanumeric keys (A-Z, 0-9)
    if (/^[a-zA-Z0-9]$/.test(e.key)) {
      const candidate = e.key.toLowerCase();
      if (validate) {
        const error = validate(candidate);
        if (error) {
          if (onNotice) onNotice(error);
          setIsEditing(false);
          input.blur();
          return;
        }
      }
      onChange(candidate);
      if (onNotice) onNotice(null);
      setIsEditing(false);
      input.blur();
      return;
    }

    if (onNotice) {
      onNotice('Please press a single letter (A–Z) or number (0–9).');
    }
    setIsEditing(false);
    input.blur();
  };

  const displayValue = isEditing ? placeholder : value ? value.toUpperCase() : emptyLabel;

  return (
    <input
      type="text"
      readonly
      disabled={disabled}
      class={`${styles.shortcutInput} ${isEditing ? styles.editing : ''} ${className}`}
      value={displayValue}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      title={title || (value ? `Shortcut: ${value.toUpperCase()} (Click to change)` : 'Click to set shortcut')}
      aria-label={ariaLabel || 'Keyboard Shortcut Key'}
    />
  );
};
