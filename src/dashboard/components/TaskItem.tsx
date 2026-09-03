import { Task } from '../types';
import { subjects, chapters, toggleTask, deleteTask, activeView } from '../store';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
}

const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

export const TaskItem = ({ task }: TaskItemProps) => {
  const currentView = activeView.value;

  const subject = subjects.value.find((s) => s.id === task.subjectId);
  const chapter = chapters.value.find((c) => c.id === task.chapterId);
  const showOrigin = currentView.type !== 'chapter';

  const priorityColor = PRIORITY_COLORS[task.priority] || '#10b981';

  // Format date like "Dec 14, 2024" as in Figma
  const formattedDate = task.dueDate
    ? (() => {
        try {
          const parts = task.dueDate.split('-');
          if (parts.length === 3) {
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            return d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          }
          return task.dueDate;
        } catch {
          return task.dueDate;
        }
      })()
    : null;

  return (
    <div class={`${styles.taskCard} ${task.completed ? styles.taskCompleted : ''}`}>
      {/* Checkbox */}
      <button
        class={`${styles.checkbox} ${task.completed ? styles.checkboxChecked : ''}`}
        onClick={() => toggleTask(task.id)}
        title={task.completed ? 'Mark uncompleted' : 'Mark completed'}
      >
        {task.completed && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            width="12"
            height="12"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Task Content */}
      <div class={styles.taskContent}>
        <p class={`${styles.taskTitle} ${task.completed ? styles.titleCompleted : ''}`}>
          {task.title}
        </p>

        <div class={styles.taskMeta}>
          {/* Origin Badge if in global view */}
          {showOrigin && (subject || chapter) && (
            <span class={styles.originBadge}>
              {subject ? subject.name : ''}
              {chapter ? ` • ${chapter.name}` : ''}
            </span>
          )}

          {/* Due date */}
          {formattedDate && (
            <div class={styles.metaItem}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                width="14"
                height="14"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              <span>{formattedDate}</span>
            </div>
          )}

          {/* Priority */}
          <div class={styles.metaItem}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              width="14"
              height="14"
              style={{ color: priorityColor }}
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" x2="4" y1="22" />
            </svg>
            <span style={{ color: priorityColor, textTransform: 'capitalize' }}>
              {task.priority}
            </span>
          </div>

          {/* Tags */}
          {task.tags.map((tag) => (
            <span key={tag} class={styles.tagPill}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                width="11"
                height="11"
              >
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                <path d="M7 7h.01" />
              </svg>
              <span>{tag}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Delete button */}
      <button class={styles.deleteBtn} onClick={() => deleteTask(task.id)} title="Delete task">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          width="16"
          height="16"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
};
