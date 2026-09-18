import { ComponentChildren } from 'preact';
import styles from './FeatureRow.module.css';

interface FeatureRowProps {
  label: string;
  sublabel?: string;
  htmlFor?: string;
  disabled?: boolean;
  children: ComponentChildren;
}

export function FeatureRow({ label, sublabel, htmlFor, disabled, children }: FeatureRowProps) {
  return (
    <div class={`${styles.featureRow} ${disabled ? styles.disabled : ''}`}>
      <div class={styles.featureInfo}>
        {htmlFor ? (
          <label class={styles.featureTitle} htmlFor={htmlFor}>
            {label}
          </label>
        ) : (
          <span class={styles.featureTitle}>{label}</span>
        )}
        {sublabel && <span class={styles.featureSublabel}>{sublabel}</span>}
      </div>
      {children}
    </div>
  );
}
