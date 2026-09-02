import { ComponentChildren } from 'preact';
import styles from './FeatureRow.module.css';

interface FeatureRowProps {
  label: string;
  htmlFor?: string;
  children: ComponentChildren;
}

export function FeatureRow({ label, htmlFor, children }: FeatureRowProps) {
  return (
    <div class={styles.featureRow}>
      <div class={styles.featureInfo}>
        {htmlFor ? (
          <label class={styles.featureTitle} htmlFor={htmlFor}>{label}</label>
        ) : (
          <span class={styles.featureTitle}>{label}</span>
        )}
      </div>
      {children}
    </div>
  );
}
