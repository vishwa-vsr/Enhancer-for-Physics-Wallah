import { selectedTags, toggleTag, clearSelectedTags, availableTags } from '../store';
import styles from './FilterSection.module.css';

const TAG_COLORS: Record<string, string> = {
  Lecture: '#6b7fd7',
  DPP: '#10b981',
  Revision: '#f59e0b',
  Notes: '#8b5cf6',
  NCERT: '#06b6d4',
  Test: '#ec4899',
  Urgent: '#ef4444',
};

const DEFAULT_SUGGESTED_TAGS = ['Lecture', 'DPP', 'Revision', 'Notes', 'NCERT', 'Test', 'Urgent'];

export const FilterSection = () => {
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
            width="16"
            height="16"
            style={{ color: '#6b7fd7' }}
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
              width="13"
              height="13"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>Clear filters</span>
          </button>
        )}
      </div>

      <div class={styles.tagsList}>
        {allTags.map((tag) => {
          const isSelected = currentSelected.includes(tag);
          const color = TAG_COLORS[tag] || '#6b7fd7';

          return (
            <button
              key={tag}
              class={`${styles.tagChip} ${isSelected ? styles.tagChipSelected : ''}`}
              style={{
                backgroundColor: isSelected ? color : undefined,
              }}
              onClick={() => toggleTag(tag)}
            >
              <span>{tag}</span>
              {isSelected && <span class={styles.checkBadge}>✓</span>}
            </button>
          );
        })}
      </div>

      {currentSelected.length > 0 && (
        <div class={styles.filterSummary}>
          Showing tasks with: <span>{currentSelected.join(', ')}</span>
        </div>
      )}
    </div>
  );
};
