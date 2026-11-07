import { useState } from 'preact/hooks';
import { StudyIcon, STUDY_ICONS_LIST } from './StudyIcons';
import { getAlphaColor } from '@shared/theme';
import styles from './IconPicker.module.css';

export interface IconPickerProps {
  value: string;
  onChange: (iconId: string) => void;
  color?: string;
  label?: string;
  iconSize?: number;
  className?: string;
}

const CATEGORIES = ['All', 'Math', 'Physics', 'Chemistry & Biology', 'Study & General'] as const;

export const IconPicker = ({
  value,
  onChange,
  color = 'var(--accent-primary)',
  label = 'Icon',
  iconSize = 18,
  className = '',
}: IconPickerProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const displayedIcons =
    selectedCategory === 'All'
      ? STUDY_ICONS_LIST
      : STUDY_ICONS_LIST.filter((i) => i.category === selectedCategory);

  const selectedItem = STUDY_ICONS_LIST.find((i) => i.id === value);
  const selectedLabel = selectedItem ? selectedItem.label : value;

  return (
    <div class={`${styles.container} ${className}`}>
      <div class={styles.iconHeaderRow}>
        <label class={styles.label}>{label}</label>
        <span class={styles.selectedIconLabel}>{selectedLabel}</span>
      </div>

      <div class={styles.iconCategoryBar} role="tablist" aria-label="Icon categories">
        {CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat}
            role="tab"
            aria-selected={selectedCategory === cat}
            class={`${styles.iconCategoryChip} ${
              selectedCategory === cat ? styles.iconCategoryChipActive : ''
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'Chemistry & Biology'
              ? 'Chem & Bio'
              : cat === 'Study & General'
                ? 'General'
                : cat}
          </button>
        ))}
      </div>

      <div class={styles.iconGrid} role="grid" aria-label="Available icons">
        {displayedIcons.map((item) => {
          const isSelected = value === item.id;
          const isCustomColor = color && !color.startsWith('var(');
          const activeStyle =
            isSelected && isCustomColor
              ? {
                  borderColor: color,
                  backgroundColor: getAlphaColor(color, 0.16),
                  color,
                }
              : undefined;

          return (
            <button
              type="button"
              key={item.id}
              role="gridcell"
              aria-label={item.label}
              aria-selected={isSelected}
              class={`${styles.iconBtn} ${isSelected ? styles.iconBtnSelected : ''}`}
              style={activeStyle}
              onClick={() => onChange(item.id)}
            >
              <StudyIcon
                name={item.id}
                size={iconSize}
                color={isSelected ? color : 'var(--text-secondary)'}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
