import { useState, useRef, useEffect } from 'preact/hooks';
import { Task } from '../types';
import { subjects, chapters, toggleTask, activeView, getLocalDateStr, customTags } from '../store';
import { getAlphaColor } from '@shared/theme';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onEditRequest?: (task: Task) => void;
}

const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/g;

function renderTextWithLinks(text: string) {
  const parts = text.split(URL_SPLIT_REGEX);
  return parts.map((part, idx) => {
    if (part.match(/^https?:\/\/[^\s]+$/)) {
      const cleanUrl = part.replace(/[.,;!?)]+$/, '');
      const trailing = part.slice(cleanUrl.length);
      return (
        <span key={idx}>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            class={styles.noteLink}
            onClick={(e) => e.stopPropagation()}
          >
            {cleanUrl}
          </a>
          {trailing}
        </span>
      );
    }
    return part;
  });
}

export const TaskItem = ({ task, onEditRequest }: TaskItemProps) => {
  const currentView = activeView.value;
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [isNoteOverflowing, setIsNoteOverflowing] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setIsNoteExpanded(false);
  }, [task.id, task.description]);

  useEffect(() => {
    const el = descRef.current;
    if (!el || !task.description) {
      setIsNoteOverflowing(false);
      return;
    }

    const checkOverflow = () => {
      if (!isNoteExpanded && descRef.current) {
        setIsNoteOverflowing(descRef.current.scrollHeight > descRef.current.clientHeight + 1);
      }
    };

    checkOverflow();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(checkOverflow);
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, [task.description, isNoteExpanded]);

  const subject = task.subjectId ? subjects.value.find((s) => s.id === task.subjectId) : null;
  const chapter = task.chapterId ? chapters.value.find((c) => c.id === task.chapterId) : null;
  const isInboxTask = !task.subjectId || !task.chapterId;
  const showOrigin = currentView.type !== 'chapter' && currentView.type !== 'inbox';
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
    <div
      class={`${styles.taskCard} ${task.completed ? styles.taskCompleted : ''} ${
        isNoteExpanded ? styles.taskCardExpanded : ''
      }`}
    >
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
          <div class={styles.descriptionWrapper}>
            <p
              ref={descRef}
              class={`${styles.taskDescription} ${
                isNoteExpanded ? styles.taskDescriptionExpanded : styles.taskDescriptionClamped
              } ${task.completed ? styles.titleCompleted : ''}`}
              onClick={() => {
                if (isNoteOverflowing || isNoteExpanded) {
                  setIsNoteExpanded((prev) => !prev);
                }
              }}
              style={{ cursor: isNoteOverflowing || isNoteExpanded ? 'pointer' : 'default' }}
            >
              {renderTextWithLinks(task.description)}
            </p>
            {(isNoteOverflowing || isNoteExpanded) && (
              <button
                type="button"
                class={styles.showMoreBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNoteExpanded((prev) => !prev);
                }}
              >
                {isNoteExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        <div class={styles.taskMeta}>
          {/* Origin Badge if in Today or Upcoming view */}
          {showOrigin &&
            (isInboxTask ? (
              <span class={styles.originBadge}>Inbox</span>
            ) : subject || chapter ? (
              <span class={styles.originBadge}>
                {subject ? subject.name : ''}
                {chapter ? ` • ${chapter.name}` : ''}
              </span>
            ) : null)}

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

      {/* Task Actions (Options on hover) */}
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
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <circle cx="5" cy="12" r="2.2" />
              <circle cx="12" cy="12" r="2.2" />
              <circle cx="19" cy="12" r="2.2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
