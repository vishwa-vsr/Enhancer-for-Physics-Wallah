import { selectedTags, toggleTag, clearSelectedTags, availableTags } from '../store';
import styles from './FilterSection.module.css';

const DEFAULT_SUGGESTED_TAGS = ['Lecture', 'DPP', 'Revision', 'Notes', 'NCERT', 'Test', 'Urgent'];

export const FilterSection = () => {
  // Combine tags from tasks with common study tags
  const allTags = Array.from(new Set([...availableTags.value, ...DEFAULT_SUGGESTED_TAGS]));
  const currentSelected = selectedTags.value;

  if (allTags.length === 0) return null;

  return (
    <div class={styles.filterContainer}>
      <div class={styles.filterHeader}>
        <div class={styles.filterTitle}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            width="15"
            height="15"
            style={{ color: 'var(--accent-primary)' }}
          >
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
            <path d="M7 7h.01" />
          </svg>
          <span>Filter by Tags</span>
        </div>

        {currentSelected.length > 0 && (
          <button class={styles.clearBtn} onClick={clearSelectedTags}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              width="12"
              height="12"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>Clear filters ({currentSelected.length})</span>
          </button>
        )}
      </div>

      <div class={styles.tagsList}>
        {allTags.map((tag) => {
          const isSelected = currentSelected.includes(tag);
          return (
            <button
              key={tag}
              class={`${styles.tagChip} ${isSelected ? styles.tagChipSelected : ''}`}
              onClick={() => toggleTag(tag)}
            >
              <span>{tag}</span>
              {isSelected && <span class={styles.checkIcon}>✓</span>}
            </button>
          );
        })}
      </div>

      {currentSelected.length > 0 && (
        <div class={styles.filterSummary}>
          Showing tasks matching: <span>{currentSelected.join(', ')}</span>
        </div>
      )}
    </div>
  );
};
