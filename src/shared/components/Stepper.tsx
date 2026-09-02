import { useState, useEffect } from 'preact/hooks';
import styles from './Stepper.module.css';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export function Stepper({ value, onChange, min, max, step, unit = 'x' }: StepperProps) {
  const [inputValue, setInputValue] = useState(value.toFixed(1));

  useEffect(() => {
    setInputValue(value.toFixed(1));
  }, [value]);

  const handleIncrement = () => {
    const newValue = Math.min(max, Math.round((value + step) * 10) / 10);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, Math.round((value - step) * 10) / 10);
    onChange(newValue);
  };

  const handleBlur = () => {
    let parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      setInputValue(value.toFixed(1));
      return;
    }
    parsed = Math.min(max, Math.max(min, Math.round(parsed * 10) / 10));
    onChange(parsed);
    setInputValue(parsed.toFixed(1));
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
    <div class={styles.stepperBox}>
      <button class={styles.stepperBtn} onClick={handleDecrement} aria-label="Decrease" type="button">−</button>
      <div class={styles.stepperValueWrapper}>
        <input
          class={styles.stepperInput}
          type="number"
          step={step}
          min={min}
          max={max}
          value={inputValue}
          onInput={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {unit && <span class={styles.stepperUnit}>{unit}</span>}
      </div>
      <button class={styles.stepperBtn} onClick={handleIncrement} aria-label="Increase" type="button">+</button>
    </div>
  );
}
