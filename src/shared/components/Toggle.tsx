import styles from './Toggle.module.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
}

export function Toggle({ checked, onChange, ariaLabel }: ToggleProps) {
  return (
    <label class={styles.switch}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
        aria-label={ariaLabel}
      />
      <span class={styles.switchSlider} />
    </label>
  );
}
