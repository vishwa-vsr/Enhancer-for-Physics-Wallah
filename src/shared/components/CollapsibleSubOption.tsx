import { ComponentChildren } from 'preact';
import styles from './CollapsibleSubOption.module.css';

interface CollapsibleSubOptionProps {
  isOpen: boolean;
  children: ComponentChildren;
  className?: string;
  variant?: 'default' | 'hud';
}

export function CollapsibleSubOption({
  isOpen,
  children,
  className = '',
  variant = 'default',
}: CollapsibleSubOptionProps) {
  const variantClass = variant === 'hud' ? styles.hudVariant : styles.defaultVariant;

  return (
    <div
      class={`${styles.collapsibleWrapper} ${isOpen ? styles.open : ''} ${variantClass} ${className}`.trim()}
      aria-hidden={!isOpen}
    >
      <div class={styles.collapsibleInner}>
        <div class={styles.collapsibleContent}>{children}</div>
      </div>
    </div>
  );
}
