import { useState, useEffect, useRef } from 'preact/hooks';
import {
  activeView,
  currentDisplaySettings,
  setViewLayout,
  setViewGroupBy,
} from '../store';
import { GroupByMode, LayoutMode } from '../types';
import { SelectDropdown } from '@shared/components/SelectDropdown';
import styles from './DisplayMenu.module.css';

const GROUPING_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'label', label: 'Label' },
];

export const DisplayMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const view = activeView.value;
  const { layout, groupBy } = currentDisplaySettings.value;
  const isModified = layout !== 'list' || groupBy !== 'date';

  // Close popover if user navigates to another view
  useEffect(() => {
    setIsOpen(false);
  }, [view.type, view.subjectId, view.chapterId]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
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

  const handleLayoutSelect = (nextLayout: LayoutMode) => {
    setViewLayout(nextLayout);
  };

  const handleGroupSelect = (nextGroup: string) => {
    setViewGroupBy(nextGroup as GroupByMode);
  };

  return (
    <div class={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        class={`${styles.triggerBtn} ${isOpen ? styles.triggerBtnOpen : ''} ${
          isModified ? styles.triggerBtnActive : ''
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Display options"
      >
        <span class={styles.triggerIcon}>
          {layout === 'board' ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              width="15"
              height="15"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              width="15"
              height="15"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="8" cy="6" r="1.5" fill="currentColor" />
              <circle cx="15" cy="12" r="1.5" fill="currentColor" />
              <circle cx="10" cy="18" r="1.5" fill="currentColor" />
            </svg>
          )}
        </span>
        <span>Display</span>
      </button>

      {isOpen && (
        <div class={styles.popover}>
          {/* Layout Section */}
          <div class={styles.section}>
            <div class={styles.sectionHeader}>
              <span class={styles.sectionTitle}>Layout</span>
            </div>

            <div class={styles.layoutGrid}>
              <button
                type="button"
                class={`${styles.layoutCard} ${layout === 'list' ? styles.layoutCardActive : ''}`}
                onClick={() => handleLayoutSelect('list')}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  width="18"
                  height="18"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="7" y1="9" x2="17" y2="9" />
                  <line x1="7" y1="13" x2="17" y2="13" />
                  <line x1="7" y1="17" x2="13" y2="17" />
                </svg>
                <span>List</span>
              </button>

              <button
                type="button"
                class={`${styles.layoutCard} ${layout === 'board' ? styles.layoutCardActive : ''}`}
                onClick={() => handleLayoutSelect('board')}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  width="18"
                  height="18"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="9" y1="4" x2="9" y2="20" />
                  <line x1="15" y1="4" x2="15" y2="20" />
                </svg>
                <span>Board</span>
              </button>
            </div>
          </div>

          <div class={styles.divider} />

          {/* Grouping Section */}
          <div class={styles.section}>
            <div class={styles.row}>
              <span class={styles.rowLabel}>Grouping</span>

              <div class={styles.dropdownControl}>
                <SelectDropdown
                  options={GROUPING_OPTIONS}
                  value={groupBy}
                  onChange={handleGroupSelect}
                  size="sm"
                  align="right"
                  ariaLabel="Grouping"
                  className={styles.groupingDropdown}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
