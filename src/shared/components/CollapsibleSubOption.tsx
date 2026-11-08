import { ComponentChildren } from 'preact';
import styles from './CollapsibleSubOption.module.css';

interface CollapsibleSubOptionProps {
  isOpen: boolean;
  children: ComponentChildren;
  className?: string;
  variant?: 'default' | 'hud' | 'hudSub';
}

export function CollapsibleSubOption({
  isOpen,
  children,
  className = '',
  variant = 'default',
}: CollapsibleSubOptionProps) {
  let variantClass = styles.defaultVariant;
  if (variant === 'hud') {
    variantClass = styles.hudVariant;
  } else if (variant === 'hudSub') {
    variantClass = styles.hudSubVariant;
  }

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
