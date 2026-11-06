import { useState, useEffect } from 'preact/hooks';
import styles from './Stepper.module.css';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  decimals?: number;
  className?: string;
}

export function Stepper({
  value,
  onChange,
  min,
  max,
  step,
  unit = 'x',
  decimals,
  className = '',
}: StepperProps) {
  const precision = decimals !== undefined ? decimals : step % 1 === 0 ? 0 : 1;
  const formatVal = (v: number) =>
    precision === 0 ? Math.round(v).toString() : v.toFixed(precision);

  const [inputValue, setInputValue] = useState(formatVal(value));

  useEffect(() => {
    setInputValue(formatVal(value));
  }, [value, precision]);

  const handleIncrement = () => {
    const raw = value + step;
    const newValue = Math.min(max, precision === 0 ? Math.round(raw) : Math.round(raw * 10) / 10);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const raw = value - step;
    const newValue = Math.max(min, precision === 0 ? Math.round(raw) : Math.round(raw * 10) / 10);
    onChange(newValue);
  };

  const handleBlur = () => {
    let parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      setInputValue(formatVal(value));
      return;
    }
    parsed = Math.min(
      max,
      Math.max(min, precision === 0 ? Math.round(parsed) : Math.round(parsed * 10) / 10),
    );
    onChange(parsed);
    setInputValue(formatVal(parsed));
  };

  const handleChange = (e: Event) => {
    setInputValue((e.target as HTMLInputElement).value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div class={`${styles.stepperBox} ${className}`.trim()}>
      <button
        class={styles.stepperBtn}
        onClick={handleDecrement}
        aria-label="Decrease"
        type="button"
      >
        <svg
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <div class={styles.stepperValueWrapper}>
        <input
          class={`${styles.stepperInput} ${!unit ? styles.noUnit : ''}`.trim()}
          type="number"
          step={step}
          min={min}
          max={max}
          value={inputValue}
          onInput={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {Boolean(unit) && <span class={styles.stepperUnit}>{unit}</span>}
      </div>
      <button
        class={styles.stepperBtn}
        onClick={handleIncrement}
        aria-label="Increase"
        type="button"
      >
        <svg
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
