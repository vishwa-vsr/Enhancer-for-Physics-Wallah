import { Task } from '../types';
import { subjects, chapters, toggleTask, deleteTask, activeView, getLocalDateStr, customTags } from '../store';
import { getAlphaColor } from '@shared/theme';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onDeleteRequest?: (task: Task) => void;
  onEditRequest?: (task: Task) => void;
}

export const TaskItem = ({ task, onDeleteRequest, onEditRequest }: TaskItemProps) => {
  const currentView = activeView.value;

  const subject = subjects.value.find((s) => s.id === task.subjectId);
  const chapter = chapters.value.find((c) => c.id === task.chapterId);
  const showOrigin = currentView.type !== 'chapter';
  const todayStr = getLocalDateStr();
  const isOverdue = !task.completed && !!task.dueDate && task.dueDate < todayStr;

  const getTagColor = (tag: string) => {
    const found = customTags.value.find((t) => t.name.toLowerCase() === tag.toLowerCase());
    return found?.color || '#6366f1';
  };

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
        {task.description && (
          <p class={`${styles.taskDescription} ${task.completed ? styles.titleCompleted : ''}`}>
            {task.description}
          </p>
        )}

        <div class={styles.taskMeta}>
          {/* Origin Badge if in global view */}
          {showOrigin && (subject || chapter) && (
            <span class={styles.originBadge}>
              {subject ? subject.name : ''}
              {chapter ? ` • ${chapter.name}` : ''}
            </span>
          )}

          {/* Overdue Badge */}
          {isOverdue && (
            <span class={styles.overdueBadge}>Overdue</span>
          )}

          {/* Tag Pills */}
          {task.tags && task.tags.length > 0 && (
            task.tags.map((tag) => {
              const color = getTagColor(tag);
              return (
                <span
                  key={tag}
                  class={styles.tagPill}
                  style={{
                    color: color,
                    backgroundColor: getAlphaColor(color, 0.12),
                    borderColor: getAlphaColor(color, 0.25),
                  }}
                >
                  {tag}
                </span>
              );
            })
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

        </div>
      </div>

      {/* Task Actions (Edit & Delete on hover) */}
      <div class={styles.taskActions}>
        {onEditRequest && (
          <button
            class={styles.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEditRequest(task);
            }}
            aria-label="Edit task"
            title="Edit task"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              width="15"
              height="15"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}

        <button
          class={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            if (onDeleteRequest) {
              onDeleteRequest(task);
            } else {
              deleteTask(task.id);
            }
          }}
          aria-label="Delete task"
          title="Delete task"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            width="15"
            height="15"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
};
