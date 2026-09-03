import { tasks, activeView } from '../store';
import styles from './StatsCards.module.css';

export const StatsCards = () => {
  const view = activeView.value;

  // Calculate stats for current view
  let relevantTasks = tasks.value;
  if (view.type === 'chapter' && view.chapterId) {
    relevantTasks = relevantTasks.filter((t) => t.chapterId === view.chapterId);
  }

  const total = relevantTasks.length;
  const completed = relevantTasks.filter((t) => t.completed).length;
  const active = total - completed;

  return (
    <div class={styles.statsGrid}>
      <div class={`${styles.statCard} ${styles.totalCard}`}>
        <div class={styles.statLabel}>
          <span>Total Tasks</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            width="16"
            height="16"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
          </svg>
        </div>
        <p class={styles.statValue}>{total}</p>
      </div>

      <div class={`${styles.statCard} ${styles.activeCard}`}>
        <div class={styles.statLabel}>
          <span>Active</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            width="16"
            height="16"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <p class={styles.statValue}>{active}</p>
      </div>

      <div class={`${styles.statCard} ${styles.completedCard}`}>
        <div class={styles.statLabel}>
          <span>Completed</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            width="16"
            height="16"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <p class={styles.statValue}>{completed}</p>
      </div>
    </div>
  );
};
