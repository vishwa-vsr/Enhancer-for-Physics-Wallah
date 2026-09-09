import styles from './Toggle.module.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, ariaLabel, disabled }: ToggleProps) {
  return (
    <label class={`${styles.switch} ${disabled ? styles.disabled : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => !disabled && onChange(e.currentTarget.checked)}
        aria-label={ariaLabel}
      />
      <span class={styles.switchSlider} />
    </label>
  );
}
