import { ComponentChildren } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import styles from './SelectDropdown.module.css';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  color?: string;
}

export interface SelectDropdownProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  emptyLabel?: string;
  id?: string;
  ariaLabel?: string;
  size?: 'default' | 'sm';
  placement?: 'auto' | 'top' | 'bottom';
  align?: 'auto' | 'left' | 'right';
  className?: string;
  renderIcon?: (name: string, size: number, color: string) => ComponentChildren;
}

export const SelectDropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  emptyLabel = 'No options',
  id,
  ariaLabel,
  size = 'default',
  placement = 'auto',
  align = 'auto',
  className = '',
  renderIcon,
}: SelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPlacement, setCurrentPlacement] = useState<'top' | 'bottom'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Auto detect placement if space below is limited
  useEffect(() => {
    if (isOpen && containerRef.current) {
      if (placement === 'auto') {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 180 && spaceAbove > spaceBelow) {
          setCurrentPlacement('top');
        } else {
          setCurrentPlacement('bottom');
        }
      } else {
        setCurrentPlacement(placement);
      }
    }
  }, [isOpen, placement]);

  // Close on outside pointerdown or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const isSm = size === 'sm';
  const effectiveAlign = align === 'auto' ? (isSm ? 'right' : 'left') : align;

  return (
    <div
      class={`${isSm ? styles.containerSm : styles.container} ${isOpen ? styles.containerOpen : ''} ${className}`}
      ref={containerRef}
    >
      <button
        id={id}
        type="button"
        class={`${styles.trigger} ${isSm ? styles.triggerSm : ''} ${isOpen ? styles.triggerOpen : ''} ${disabled ? styles.triggerDisabled : ''}`}
        onClick={toggleDropdown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <div class={styles.triggerLeft}>
          {selectedOption ? (
            <>
              {selectedOption.icon && renderIcon ? (
                renderIcon(
                  selectedOption.icon,
                  isSm ? 13 : 15,
                  selectedOption.color || 'var(--accent-primary)',
                )
              ) : selectedOption.color ? (
                <span
                  class={styles.colorDot}
                  style={{ backgroundColor: selectedOption.color, color: selectedOption.color }}
                />
              ) : null}
              <span class={styles.triggerText}>{selectedOption.label}</span>
            </>
          ) : (
            <span class={`${styles.triggerText} ${styles.placeholder}`}>{placeholder}</span>
          )}
        </div>

        <span
          class={`${styles.chevron} ${isSm ? styles.chevronSm : ''} ${isOpen ? styles.chevronOpen : ''}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            width={isSm ? 13 : 15}
            height={isSm ? 13 : 15}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {isOpen && !disabled && (
        <div
          class={`${styles.menuContainer} ${isSm ? styles.menuContainerSm : ''} ${currentPlacement === 'top' ? styles.menuTop : ''} ${effectiveAlign === 'right' ? styles.alignRight : ''}`}
          role="listbox"
        >
          {options.length > 0 ? (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  class={`${styles.optionItem} ${isSm ? styles.optionItemSm : ''} ${isSelected ? styles.optionSelected : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  <div class={styles.optionLeft}>
                    {option.icon && renderIcon ? (
                      renderIcon(
                        option.icon,
                        isSm ? 13 : 15,
                        option.color ||
                          (isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)'),
                      )
                    ) : option.color ? (
                      <span
                        class={styles.colorDot}
                        style={{ backgroundColor: option.color }}
                      />
                    ) : null}
                    <span class={styles.optionLabel}>{option.label}</span>
                  </div>

                  {isSelected && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      width={isSm ? 12 : 14}
                      height={isSm ? 12 : 14}
                      class={styles.checkIcon}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })
          ) : (
            <div class={styles.emptyState}>{emptyLabel}</div>
          )}
        </div>
      )}
    </div>
  );
};
