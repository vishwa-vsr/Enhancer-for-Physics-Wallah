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
      <div class={styles.statCard}>
        <p class={styles.statLabel}>Total Tasks</p>
        <p class={styles.statValue}>{total}</p>
      </div>

      <div class={styles.statCard}>
        <p class={styles.statLabel}>Active</p>
        <p class={styles.statValue}>{active}</p>
      </div>

      <div class={styles.statCard}>
        <p class={styles.statLabel}>Completed</p>
        <p class={styles.statValue}>{completed}</p>
      </div>
    </div>
  );
};
