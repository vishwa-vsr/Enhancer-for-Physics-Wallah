import { ComponentChildren } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { createPortal } from 'preact/compat';
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
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    width?: number;
    maxHeight?: number;
  }>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const isSm = size === 'sm';
  const effectiveAlign = align === 'auto' ? (isSm ? 'right' : 'left') : align;

  const updateCoords = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let useTop = false;
    if (placement === 'top') {
      useTop = true;
    } else if (placement === 'auto') {
      if (spaceBelow < 180 && spaceAbove > spaceBelow) {
        useTop = true;
      }
    }
    setCurrentPlacement(useTop ? 'top' : 'bottom');

    const availableHeight = useTop ? rect.top - 16 : window.innerHeight - rect.bottom - 16;
    const computedMaxHeight = Math.min(220, Math.max(100, availableHeight));

    const newCoords: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
      width?: number;
      maxHeight?: number;
    } = {
      maxHeight: computedMaxHeight,
    };

    if (useTop) {
      newCoords.bottom = Math.max(8, window.innerHeight - rect.top + 5);
    } else {
      newCoords.top = rect.bottom + 5;
    }

    if (isSm) {
      if (effectiveAlign === 'right') {
        newCoords.right = Math.max(8, window.innerWidth - rect.right);
      } else {
        newCoords.left = Math.max(8, rect.left);
      }
    } else {
      let left = rect.left;
      const width = rect.width;
      if (left + width > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - width - 8);
      }
      newCoords.left = Math.max(8, left);
      newCoords.width = width;
    }

    setCoords(newCoords);
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
    }
  }, [isOpen, placement, align, size]);

  // Close on outside pointerdown or Escape key, handle scrolling & resizing
  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && containerRef.current.contains(target)) return;
      if (menuRef.current && menuRef.current.contains(target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
      }
    };

    const handleScroll = (e: Event) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return;
      setIsOpen(false);
    };

    const handleResize = () => {
      updateCoords();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

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

      {isOpen &&
        !disabled &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            class={`${styles.menuContainer} ${isSm ? styles.menuContainerSm : ''} ${currentPlacement === 'top' ? styles.menuTop : ''}`}
            style={{
              top: coords.top !== undefined ? `${coords.top}px` : 'auto',
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : 'auto',
              left: coords.left !== undefined ? `${coords.left}px` : 'auto',
              right: coords.right !== undefined ? `${coords.right}px` : 'auto',
              width: coords.width !== undefined ? `${coords.width}px` : undefined,
              maxHeight: coords.maxHeight !== undefined ? `${coords.maxHeight}px` : undefined,
              visibility:
                coords.top !== undefined || coords.bottom !== undefined ? 'visible' : 'hidden',
            }}
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
                        <span class={styles.colorDot} style={{ backgroundColor: option.color }} />
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
          </div>,
          document.body,
        )}
    </div>
  );
};
