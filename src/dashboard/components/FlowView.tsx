import { useState } from 'preact/hooks';
import { Task } from '../types';
import {
  tasks,
  subjects,
  chapters,
  toggleTask,
  updateTask,
  deleteTask,
  addCustomFlowStep,
  addConnectedChain,
  updateChainTitle,
  deleteConnectedChain,
  isAddChainModalOpen,
  customTags,
  getLocalDateStr,
  getLocalTomorrowStr,
} from '../store';
import styles from './FlowView.module.css';

interface FlowViewProps {
  chapterId: string;
  subjectId: string;
}

const getTodayStr = () => getLocalDateStr();
const getTomorrowStr = () => getLocalTomorrowStr();

const formatScheduleDate = (dueDate?: string) => {
  if (!dueDate) return '+ Schedule';
  const today = getTodayStr();
  const tomorrow = getTomorrowStr();
  if (dueDate === today) return 'Today';
  if (dueDate === tomorrow) return 'Tomorrow';
  try {
    const parts = dueDate.split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return dueDate;
  } catch {
    return dueDate;
  }
};

export const FlowView = ({ chapterId, subjectId }: FlowViewProps) => {
  const currentSubject = subjects.value.find((s) => s.id === subjectId);
  const currentChapter = chapters.value.find((c) => c.id === chapterId);
  const [newChainLectureTitle, setNewChainLectureTitle] = useState('');
  const [newChainDuration, setNewChainDuration] = useState('');
  const [selectedChainLabels, setSelectedChainLabels] = useState<string[]>(['Lecture', 'DPP', 'Revision']);

  // Add Step Pop-up Modal State (replaces the inline '+' card)
  const [addStepModalParentTask, setAddStepModalParentTask] = useState<Task | null>(null);
  const [addStepModalDescription, setAddStepModalDescription] = useState('');
  const [addStepModalLabel, setAddStepModalLabel] = useState('');
  const [addStepModalDurationHours, setAddStepModalDurationHours] = useState('');
  const [addStepModalDurationMinutes, setAddStepModalDurationMinutes] = useState('');
  const [addStepModalDueDate, setAddStepModalDueDate] = useState<string | undefined>(undefined);

  // 3-Dot Step Settings Modal State
  const [activeStepModalTask, setActiveStepModalTask] = useState<Task | null>(null);
  const [stepModalDescription, setStepModalDescription] = useState('');
  const [stepModalLabel, setStepModalLabel] = useState('');
  const [stepModalDurationHours, setStepModalDurationHours] = useState('');
  const [stepModalDurationMinutes, setStepModalDurationMinutes] = useState('');
  const [stepModalDueDate, setStepModalDueDate] = useState<string | undefined>(undefined);
  const [isDeletingStep, setIsDeletingStep] = useState(false);

  // Study Chain Settings Modal State
  const [activeChainModalId, setActiveChainModalId] = useState<string | null>(null);
  const [activeChainModalTitle, setActiveChainModalTitle] = useState('');
  const [activeChainModalTasks, setActiveChainModalTasks] = useState<Task[]>([]);
  const [isDeletingChain, setIsDeletingChain] = useState(false);

  // Filter tasks belonging to this chapter
  const chapterTasks = tasks.value.filter((t) => t.chapterId === chapterId);

  // Robust connected chain builder:
  // Groups tasks linked together by chainId OR by pointer sequence (prevTaskId / nextTaskId)
  const visited = new Set<string>();
  const chainRows: Task[][] = [];

  // Pass 1: Explicit chainId groups
  const chainsMap: Record<string, Task[]> = {};
  chapterTasks.forEach((t) => {
    if (t.chainId) {
      if (!chainsMap[t.chainId]) chainsMap[t.chainId] = [];
      chainsMap[t.chainId].push(t);
    }
  });

  Object.values(chainsMap).forEach((chainList) => {
    // Find head: has no prevTaskId, or prevTaskId is outside this chainList
    const head =
      chainList.find(
        (t) => !t.prevTaskId || !chainList.some((other) => other.id === t.prevTaskId),
      ) || chainList[0];

    const ordered: Task[] = [];
    let current: Task | undefined = head;
    while (current && !visited.has(current.id)) {
      ordered.push(current);
      visited.add(current.id);
      const nextId: string | undefined = current.nextTaskId;
      current = nextId ? chapterTasks.find((t) => t.id === nextId) : undefined;
    }

    // Add any remaining items in this chain group
    chainList.forEach((t) => {
      if (!visited.has(t.id)) {
        ordered.push(t);
        visited.add(t.id);
      }
    });

    if (ordered.length > 0) {
      chainRows.push(ordered);
    }
  });

  // Pass 2: Remaining tasks (connected via pointers or standalone)
  chapterTasks.forEach((task) => {
    if (visited.has(task.id)) return;

    // Follow backwards to find the chain root
    let root: Task = task;
    const backTrack = new Set<string>([root.id]);
    while (root.prevTaskId) {
      const prev = chapterTasks.find((t) => t.id === root.prevTaskId);
      if (!prev || backTrack.has(prev.id)) break;
      backTrack.add(prev.id);
      root = prev;
    }

    // Follow forward from root
    const sequence: Task[] = [];
    let current: Task | undefined = root;
    while (current && !visited.has(current.id)) {
      sequence.push(current);
      visited.add(current.id);
      const nextId: string | undefined = current.nextTaskId;
      current = nextId ? chapterTasks.find((t) => t.id === nextId) : undefined;
    }

    if (sequence.length > 0) {
      chainRows.push(sequence);
    }
  });

  // Sort chain rows with newest chains at the top
  chainRows.sort((a, b) => (b[0]?.createdAt || 0) - (a[0]?.createdAt || 0));

  const filteredChains = chainRows;

  const openAddStepModal = (parentTask: Task) => {
    setAddStepModalParentTask(parentTask);
    setAddStepModalDescription('');
    setAddStepModalLabel(customTags.value[0]?.name || 'Revision');
    setAddStepModalDurationHours('');
    setAddStepModalDurationMinutes('');
    setAddStepModalDueDate(undefined);
  };

  const handleSaveAddStep = async () => {
    if (!addStepModalParentTask) return;
    const isLecture = addStepModalLabel.toLowerCase() === 'lecture';
    let durationVal: string | undefined = undefined;
    if (isLecture) {
      const h = addStepModalDurationHours.trim();
      const m = addStepModalDurationMinutes.trim();
      if (h && m) {
        durationVal = `${h}h:${m}m`;
      } else if (h) {
        durationVal = `${h}h`;
      } else if (m) {
        durationVal = `${m}m`;
      }
    }
    await addCustomFlowStep(
      addStepModalParentTask.id,
      addStepModalLabel.trim() || 'Task',
      addStepModalDescription.trim() || undefined,
      addStepModalDueDate,
      durationVal,
    );
    setAddStepModalParentTask(null);
  };

  const openStepModal = (task: Task) => {
    setActiveStepModalTask(task);
    setStepModalDescription(task.description || '');
    setStepModalLabel(task.tags[0] || task.chainType || 'Lecture');
    setStepModalDueDate(task.dueDate);
    const dur = task.duration || '';
    const hMatch = dur.match(/(\d+)\s*h/i);
    const mMatch = dur.match(/(\d+)\s*m/i);
    setStepModalDurationHours(hMatch ? hMatch[1] : '');
    setStepModalDurationMinutes(mMatch ? mMatch[1] : '');
    setIsDeletingStep(false);
  };

  const handleSaveStepModal = async () => {
    if (!activeStepModalTask) return;
    const isLecture = stepModalLabel.toLowerCase() === 'lecture';
    let durationVal: string | undefined = undefined;
    if (isLecture) {
      const h = stepModalDurationHours.trim();
      const m = stepModalDurationMinutes.trim();
      if (h && m) {
        durationVal = `${h}h:${m}m`;
      } else if (h) {
        durationVal = `${h}h`;
      } else if (m) {
        durationVal = `${m}m`;
      }
    }
    await updateTask(activeStepModalTask.id, {
      description: stepModalDescription.trim() || undefined,
      tags: [stepModalLabel],
      chainType: stepModalLabel.toLowerCase(),
      dueDate: stepModalDueDate || undefined,
      duration: durationVal,
    });
    setActiveStepModalTask(null);
  };

  const handleDeleteStepModal = async () => {
    if (!activeStepModalTask) return;
    await deleteTask(activeStepModalTask.id);
    setActiveStepModalTask(null);
  };

  const openChainModal = (chainId: string, currentTitle: string, chainTasks: Task[]) => {
    setActiveChainModalId(chainId);
    setActiveChainModalTitle(currentTitle);
    setActiveChainModalTasks(chainTasks);
    setIsDeletingChain(false);
  };

  const handleSaveChainTitle = async () => {
    if (!activeChainModalId) return;
    const trimmed = activeChainModalTitle.trim();
    if (trimmed) {
      await updateChainTitle(
        activeChainModalId,
        trimmed,
        activeChainModalTasks.map((t) => t.id),
      );
    }
    setActiveChainModalId(null);
  };

  const handleDeleteChain = async () => {
    if (!activeChainModalId) return;
    await deleteConnectedChain(
      activeChainModalId,
      activeChainModalTasks.map((t) => t.id),
    );
    setActiveChainModalId(null);
  };

  const handleCreateChain = async (e: Event) => {
    e.preventDefault();
    if (!newChainLectureTitle.trim()) return;
    if (selectedChainLabels.length === 0) return;
    await addConnectedChain({
      subjectId,
      chapterId,
      lectureTitle: newChainLectureTitle.trim(),
      chainTitle: newChainLectureTitle.trim(),
      duration: newChainDuration.trim() || undefined,
      selectedLabels: selectedChainLabels,
    });
    setNewChainLectureTitle('');
    setNewChainDuration('');
    isAddChainModalOpen.value = false;
  };

  return (
    <div class={styles.flowContainer}>

      {/* Chains Canvas */}
      {filteredChains.length === 0 ? null : (
        <div class={styles.chainsList}>
          {filteredChains.map((chain, chainIdx) => {
            const isChainComplete = chain.every((t) => t.completed);
            const firstTask = chain[0];
            const lectureTask =
              chain.find((t) => t.chainType === 'lecture' || t.tags.includes('Lecture')) || firstTask;
            const rawChainLabel =
              firstTask?.chainTitle || lectureTask?.chainTitle || lectureTask?.title || `Chain #${chainIdx + 1}`;
            const chainLabel = rawChainLabel.replace(/\s*\|\|\s*/g, ' • ').trim();
            const chainDate = lectureTask?.lectureDate;

            return (
              <div key={firstTask.chainId || firstTask.id} class={styles.chainRow}>
                <div class={styles.chainHeader}>
                  <div class={styles.chainTitleGroup}>
                    <span class={styles.chainTitle} title={chainLabel}>
                      {chainLabel}
                    </span>
                    {chainDate && (
                      <span class={styles.chainDateBadge}>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          width="12"
                          height="12"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {chainDate}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isChainComplete && (
                      <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>
                        ✓ COMPLETED
                      </span>
                    )}
                    <button
                      type="button"
                      class={styles.chainMenuBtn}
                      aria-label={`Options for ${chainLabel}`}
                      onClick={() =>
                        openChainModal(firstTask.chainId || firstTask.id, chainLabel, chain)
                      }
                      title="Study chain settings"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <circle cx="5" cy="12" r="2.2" />
                        <circle cx="12" cy="12" r="2.2" />
                        <circle cx="19" cy="12" r="2.2" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class={styles.chainScrollArea}>
                  {chain.map((task, idx) => {
                    const isLast = idx === chain.length - 1;
                    const prevTask = idx > 0 ? chain[idx - 1] : null;
                    const isPrevCompleted = prevTask ? prevTask.completed : true;
                    const isUpNext = !task.completed && isPrevCompleted;

                    const matchingTag = customTags.value.find(
                      (t) =>
                        t.name.toLowerCase() ===
                        (task.tags[0] || task.chainType || '').toLowerCase(),
                    );

                    let typeClass = styles.typeCustom;
                    let typeLabel = task.tags[0] || task.chainType || 'Task';
                    let displayTitle = task.title;
                    let customBadgeStyle: Record<string, string> | undefined = undefined;
                    let labelColor = '#ec4899';

                    if (matchingTag) {
                      typeLabel = matchingTag.name;
                      labelColor = matchingTag.color;
                      customBadgeStyle = {
                        backgroundColor: `${matchingTag.color}1c`,
                        color: matchingTag.color,
                        border: `1px solid ${matchingTag.color}40`,
                      };
                    } else if (task.chainType === 'lecture' || task.tags.includes('Lecture')) {
                      typeClass = styles.typeLecture;
                      typeLabel = 'Lecture';
                      labelColor = '#6366f1';
                    } else if (task.chainType === 'dpp' || task.tags.includes('DPP')) {
                      typeClass = styles.typeDpp;
                      typeLabel = 'DPP';
                      labelColor = '#10b981';
                    } else if (task.chainType === 'notes' || task.tags.includes('Notes')) {
                      typeClass = styles.typeNotes;
                      typeLabel = 'Notes';
                      labelColor = '#a855f7';
                    } else if (task.chainType === 'revision' || task.tags.includes('Revision')) {
                      typeClass = styles.typeRevision;
                      typeLabel = 'Revision';
                      labelColor = '#d97706';
                    }

                    let cardText = '';
                    if (task.description && task.description.trim()) {
                      cardText = task.description.trim();
                    } else if (typeLabel.toLowerCase() === 'dpp') {
                      const dppMatch = (task.description || task.title || '').match(/(?:dpp|\b)\s*0?(\d+)/i);
                      cardText = dppMatch ? `DPP ${dppMatch[1]}` : 'DPP Practice';
                    }

                    return (
                      <div key={task.id} class={styles.nodeWrapper}>
                        {/* Node Card */}
                        <div
                          class={`${styles.nodeCard} ${
                            task.completed ? styles.nodeCardDone : ''
                          }`}
                        >
                          <div class={styles.nodeHeader}>
                            <div class={styles.nodeHeaderLeft}>
                              {/* Mark Done button */}
                              <button
                                class={`${styles.nodeCheckBtn} ${
                                  task.completed ? styles.nodeCheckBtnDone : ''
                                }`}
                                style={
                                  !task.completed ? { borderColor: labelColor } : undefined
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTask(task.id);
                                }}
                                title={task.completed ? 'Mark pending' : 'Mark done'}
                              >
                                {task.completed && (
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={3.5}
                                    width="12"
                                    height="12"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </button>

                              {/* Label badge */}
                              <span
                                class={`${styles.nodeTypeBadge} ${typeClass}`}
                                style={customBadgeStyle}
                              >
                                {typeLabel}
                              </span>
                            </div>

                            {/* Three-dot menu button */}
                            <button
                              type="button"
                              class={styles.nodeMenuBtn}
                              aria-label={`Options for ${task.title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                openStepModal(task);
                              }}
                              title="Task settings"
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <circle cx="5" cy="12" r="2.2" />
                                <circle cx="12" cy="12" r="2.2" />
                                <circle cx="19" cy="12" r="2.2" />
                              </svg>
                            </button>
                          </div>

                          <div
                            class={styles.nodeBody}
                            title={cardText}
                            onClick={() => openStepModal(task)}
                            style={{ cursor: 'pointer' }}
                          >
                            {cardText ? (
                              <p
                                class={`${styles.nodeDescription} ${
                                  task.completed ? styles.nodeDescriptionDone : ''
                                }`}
                                title={cardText}
                              >
                                {cardText}
                              </p>
                            ) : null}
                          </div>

                          <div class={styles.nodeFooter}>
                            {task.duration && task.duration.toLowerCase() !== 'video' ? (
                              <span class={styles.durationBadge}>
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2.2}
                                  width="12"
                                  height="12"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {task.duration}
                              </span>
                            ) : (
                              <span />
                            )}

                            {/* Scheduled date badge */}
                            <button
                              type="button"
                              class={task.dueDate ? styles.scheduledBadge : styles.scheduleAddBadge}
                              onClick={(e) => {
                                e.stopPropagation();
                                openStepModal(task);
                              }}
                              title={task.dueDate ? 'Scheduled date (Click to edit)' : 'Add scheduled date'}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                width="11"
                                height="11"
                              >
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              {formatScheduleDate(task.dueDate)}
                            </button>
                          </div>
                        </div>

                        {/* Connecting Line to Next Step */}
                        {!isLast && (
                          <div class={styles.connectorWrapper}>
                            <div class={styles.connectorLine} />
                          </div>
                        )}

                        {/* If last task, show '+' button to open Add Step modal */}
                        {isLast && (
                          <button
                            type="button"
                            class={styles.addStepBtn}
                            title="Add task to chain"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAddStepModal(task);
                            }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              width={16}
                              height={16}
                            >
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {chainIdx < filteredChains.length - 1 && (
                  <div class={styles.chainDivider} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to Create New Connected Study Chain */}
      {isAddChainModalOpen.value && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => {
            isAddChainModalOpen.value = false;
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '440px',
              boxShadow: 'var(--card-shadow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 16px',
                fontSize: '18px',
                color: 'var(--text-primary)',
                fontWeight: '700',
              }}
            >
              Create Connected Study Chain
            </h3>

            <form onSubmit={handleCreateChain}>
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  Study Chain Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electrostatics 01: Electric Charges and Fields"
                  value={newChainLectureTitle}
                  onInput={(e) => setNewChainLectureTitle((e.target as HTMLInputElement).value)}
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-control)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  Duration (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 45m, 1h 30m"
                  value={newChainDuration}
                  onInput={(e) => setNewChainDuration((e.target as HTMLInputElement).value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-control)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Include Chain Stages Selection */}
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  Include Chain Stages
                </label>
                <div class={styles.chainLabelsGroup}>
                  {customTags.value.map((tag) => {
                    const isChecked = selectedChainLabels.includes(tag.name);
                    return (
                      <label
                        key={tag.name}
                        class={`${styles.chainLabelCheckItem} ${
                          isChecked ? styles.chainLabelCheckItemActive : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (isChecked) {
                            setSelectedChainLabels(selectedChainLabels.filter((l) => l !== tag.name));
                          } else {
                            setSelectedChainLabels([...selectedChainLabels, tag.name]);
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          class={styles.chainLabelCheckbox}
                          checked={isChecked}
                          readOnly
                        />
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: tag.color,
                            flexShrink: 0,
                          }}
                        />
                        <span>{tag.name}</span>
                      </label>
                    );
                  })}
                </div>
                {selectedChainLabels.length === 0 && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>
                    Please select at least one stage for the chain.
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    isAddChainModalOpen.value = false;
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedChainLabels.length === 0}
                  style={{
                    padding: '8px 18px',
                    background: 'var(--accent-primary, #6366f1)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: selectedChainLabels.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: selectedChainLabels.length === 0 ? 0.5 : 1,
                  }}
                >
                  Create Chain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3-Dot Step Settings Modal (Todoist-style Two-Column) */}
      {activeStepModalTask && (
        <div
          class={styles.modalBackdrop}
          onClick={() => {
            if (activeStepModalTask) {
              updateTask(activeStepModalTask.id, { description: stepModalDescription.trim() || undefined });
            }
            setActiveStepModalTask(null);
          }}
        >
          <div
            class={styles.modalCardTwoColumn}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Breadcrumb and Close */}
            <div class={styles.twoColTopBar}>
              <div class={styles.twoColBreadcrumb}>
                <span style={{ color: 'var(--accent-primary, #6366f1)' }}>#</span>
                <span>{currentSubject?.name || 'Subject'}</span>
                <span style={{ opacity: 0.4 }}>/</span>
                <span>{currentChapter?.name || 'Chapter'}</span>
              </div>
              <button
                type="button"
                class={styles.modalCloseBtn}
                onClick={() => {
                  if (activeStepModalTask) {
                    updateTask(activeStepModalTask.id, { description: stepModalDescription.trim() || undefined });
                  }
                  setActiveStepModalTask(null);
                }}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Two Column Body */}
            <div class={styles.twoColBody}>
              {/* Left Column: Title & Description */}
              <div class={styles.twoColMain}>
                <div class={styles.twoColTitleRow}>
                  <button
                    type="button"
                    class={`${styles.nodeCheckBtn} ${styles.twoColCheckbox} ${
                      activeStepModalTask.completed ? styles.nodeCheckBtnDone : ''
                    }`}
                    onClick={() => {
                      toggleTask(activeStepModalTask.id);
                    }}
                    title={activeStepModalTask.completed ? 'Mark pending' : 'Mark done'}
                  >
                    {activeStepModalTask.completed && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3.5}
                        width="12"
                        height="12"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <h2 class={styles.twoColTitleText}>
                    {activeStepModalTask.chainTitle || activeStepModalTask.title}
                  </h2>
                </div>

                <div>
                  <label class={styles.twoColDescriptionLabel}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14">
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <line x1="4" y1="18" x2="14" y2="18" />
                    </svg>
                    <span>Description</span>
                  </label>
                  <textarea
                    rows={7}
                    class={styles.twoColDescriptionArea}
                    value={stepModalDescription}
                    onInput={(e) => {
                      const val = (e.target as HTMLTextAreaElement).value;
                      setStepModalDescription(val);
                      updateTask(activeStepModalTask.id, { description: val.trim() || undefined });
                    }}
                    placeholder="Add description or personal study notes..."
                  />
                </div>
              </div>

              {/* Right Column: Properties Sidebar */}
              <div class={styles.twoColSidebar}>
                {/* Project Origin */}
                <div class={styles.sidebarSection}>
                  <span class={styles.sidebarSectionTitle}>Project</span>
                  <div class={styles.sidebarOriginBadge}>
                    <span style={{ color: 'var(--accent-primary, #6366f1)' }}>#</span>
                    <span>{currentSubject?.name || 'Subject'} / {currentChapter?.name || 'Chapter'}</span>
                  </div>
                </div>

                {/* Task Label */}
                <div class={styles.sidebarSection}>
                  <span class={styles.sidebarSectionTitle}>Task Label</span>
                  <div class={styles.modalLabelsGrid}>
                    {customTags.value.map((tag) => {
                      const isSelected = stepModalLabel.toLowerCase() === tag.name.toLowerCase();
                      return (
                        <button
                          key={tag.name}
                          type="button"
                          class={`${styles.modalLabelPill} ${isSelected ? styles.modalLabelPillSelected : ''}`}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: `${tag.color}20`,
                                  borderColor: tag.color,
                                  color: tag.color,
                                }
                              : undefined
                          }
                          onClick={() => {
                            setStepModalLabel(tag.name);
                            if (tag.name.toLowerCase() !== 'lecture') {
                              setStepModalDurationHours('');
                              setStepModalDurationMinutes('');
                              updateTask(activeStepModalTask.id, {
                                tags: [tag.name],
                                chainType: tag.name.toLowerCase(),
                                duration: undefined,
                              });
                            } else {
                              updateTask(activeStepModalTask.id, {
                                tags: [tag.name],
                                chainType: tag.name.toLowerCase(),
                              });
                            }
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              backgroundColor: tag.color,
                            }}
                          />
                          <span>{tag.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Schedule Date */}
                <div class={styles.sidebarSection}>
                  <div class={styles.sidebarSectionHeader}>
                    <span class={styles.sidebarSectionTitle}>Schedule Date</span>
                    {stepModalDueDate && (
                      <button
                        type="button"
                        class={styles.modalClearDateTextBtn}
                        onClick={() => {
                          setStepModalDueDate(undefined);
                          updateTask(activeStepModalTask.id, { dueDate: undefined });
                        }}
                        title="Clear date"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="date"
                      class={styles.modalInput}
                      value={stepModalDueDate || ''}
                      onChange={(e) => {
                        const val = (e.target as HTMLInputElement).value || undefined;
                        setStepModalDueDate(val);
                        updateTask(activeStepModalTask.id, { dueDate: val });
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        class={`${styles.modalQuickDateBtnSmall} ${
                          stepModalDueDate === getTodayStr() ? styles.modalQuickDateBtnActive : ''
                        }`}
                        style={{ flex: 1 }}
                        onClick={() => {
                          const today = getTodayStr();
                          setStepModalDueDate(today);
                          updateTask(activeStepModalTask.id, { dueDate: today });
                        }}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        class={`${styles.modalQuickDateBtnSmall} ${
                          stepModalDueDate === getTomorrowStr() ? styles.modalQuickDateBtnActive : ''
                        }`}
                        style={{ flex: 1 }}
                        onClick={() => {
                          const tomorrow = getTomorrowStr();
                          setStepModalDueDate(tomorrow);
                          updateTask(activeStepModalTask.id, { dueDate: tomorrow });
                        }}
                      >
                        Tomorrow
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lecture Duration */}
                <div class={styles.sidebarSection}>
                  <span class={styles.sidebarSectionTitle}>Lecture Duration</span>
                  <div class={styles.durationInputGroup}>
                    <div class={styles.durationUnitBox}>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        class={`${styles.durationMiniInput} ${
                          stepModalLabel.toLowerCase() !== 'lecture' ? styles.modalInputDisabled : ''
                        }`}
                        disabled={stepModalLabel.toLowerCase() !== 'lecture'}
                        value={stepModalLabel.toLowerCase() === 'lecture' ? stepModalDurationHours : ''}
                        onInput={(e) => {
                          const h = (e.target as HTMLInputElement).value;
                          setStepModalDurationHours(h);
                          const m = stepModalDurationMinutes.trim();
                          let dur: string | undefined = undefined;
                          if (h.trim() && m) dur = `${h.trim()}h:${m}m`;
                          else if (h.trim()) dur = `${h.trim()}h`;
                          else if (m) dur = `${m}m`;
                          updateTask(activeStepModalTask.id, { duration: dur });
                        }}
                        placeholder={stepModalLabel.toLowerCase() === 'lecture' ? '0' : '—'}
                        title="Hours"
                      />
                      <span class={styles.durationUnitLabel}>h</span>
                    </div>
                    <div class={styles.durationUnitBox}>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        class={`${styles.durationMiniInput} ${
                          stepModalLabel.toLowerCase() !== 'lecture' ? styles.modalInputDisabled : ''
                        }`}
                        disabled={stepModalLabel.toLowerCase() !== 'lecture'}
                        value={stepModalLabel.toLowerCase() === 'lecture' ? stepModalDurationMinutes : ''}
                        onInput={(e) => {
                          const m = (e.target as HTMLInputElement).value;
                          setStepModalDurationMinutes(m);
                          const h = stepModalDurationHours.trim();
                          let dur: string | undefined = undefined;
                          if (h && m.trim()) dur = `${h}h:${m.trim()}m`;
                          else if (h) dur = `${h}h`;
                          else if (m.trim()) dur = `${m.trim()}m`;
                          updateTask(activeStepModalTask.id, { duration: dur });
                        }}
                        placeholder={stepModalLabel.toLowerCase() === 'lecture' ? '00' : '—'}
                        title="Minutes"
                      />
                      <span class={styles.durationUnitLabel}>m</span>
                    </div>
                  </div>
                </div>

                {/* Delete Task button */}
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                  {isDeletingStep ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>Confirm delete?</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          class={styles.modalDeleteBtn}
                          style={{ backgroundColor: '#ef4444', color: '#ffffff', borderColor: '#ef4444', flex: 1 }}
                          onClick={handleDeleteStepModal}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          class={styles.modalCancelBtn}
                          style={{ flex: 1 }}
                          onClick={() => setIsDeletingStep(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      class={styles.modalDeleteBtn}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => setIsDeletingStep(true)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="13" height="13">
                        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                      Delete Task
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Step Modal (opened via '+' button at end of chain) */}
      {addStepModalParentTask && (
        <div
          class={styles.modalBackdrop}
          onClick={() => setAddStepModalParentTask(null)}
        >
          <div
            class={styles.modalCardTwoColumn}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar: Breadcrumb + Close Button */}
            <div class={styles.twoColTopBar}>
              <div class={styles.twoColBreadcrumb}>
                <span style={{ color: 'var(--accent-primary, #6366f1)', fontWeight: 'bold' }}>#</span>
                <span>{currentSubject?.name || 'Subject'}</span>
                <span style={{ opacity: 0.4 }}>/</span>
                <span>{currentChapter?.name || 'Chapter'}</span>
              </div>
              <button
                type="button"
                class={styles.modalCloseBtn}
                onClick={() => setAddStepModalParentTask(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Two Column Body */}
            <div class={styles.twoColBody}>
              {/* Left Column: Title & Description */}
              <div class={styles.twoColMain}>
                <div class={styles.twoColTitleRow}>
                  <div
                    class={`${styles.nodeCheckBtn} ${styles.twoColCheckbox}`}
                    style={{ opacity: 0.4, cursor: 'default' }}
                    title="New task"
                  />
                  <h2 class={styles.twoColTitleText}>
                    {addStepModalParentTask.chainTitle || addStepModalParentTask.title}
                  </h2>
                </div>

                <div>
                  <label class={styles.twoColDescriptionLabel}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14">
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <line x1="4" y1="18" x2="14" y2="18" />
                    </svg>
                    <span>Description</span>
                  </label>
                  <textarea
                    rows={7}
                    class={styles.twoColDescriptionArea}
                    value={addStepModalDescription}
                    onInput={(e) => setAddStepModalDescription((e.target as HTMLTextAreaElement).value)}
                    placeholder="Add description or personal study notes..."
                  />
                </div>
              </div>

              {/* Right Column: Properties Sidebar */}
              <div class={styles.twoColSidebar}>
                {/* Project Origin */}
                <div class={styles.sidebarSection}>
                  <span class={styles.sidebarSectionTitle}>Project</span>
                  <div class={styles.sidebarOriginBadge}>
                    <span style={{ color: 'var(--accent-primary, #6366f1)' }}>#</span>
                    <span>{currentSubject?.name || 'Subject'} / {currentChapter?.name || 'Chapter'}</span>
                  </div>
                </div>

                {/* Task Label */}
                <div class={styles.sidebarSection}>
                  <span class={styles.sidebarSectionTitle}>Task Label</span>
                  <div class={styles.modalLabelsGrid}>
                    {customTags.value.map((tag) => {
                      const isSelected = addStepModalLabel.toLowerCase() === tag.name.toLowerCase();
                      return (
                        <button
                          key={tag.name}
                          type="button"
                          class={`${styles.modalLabelPill} ${isSelected ? styles.modalLabelPillSelected : ''}`}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: `${tag.color}20`,
                                  borderColor: tag.color,
                                  color: tag.color,
                                }
                              : undefined
                          }
                          onClick={() => {
                            setAddStepModalLabel(tag.name);
                            if (tag.name.toLowerCase() !== 'lecture') {
                              setAddStepModalDurationHours('');
                              setAddStepModalDurationMinutes('');
                            }
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              backgroundColor: tag.color,
                            }}
                          />
                          <span>{tag.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Schedule Date */}
                <div class={styles.sidebarSection}>
                  <div class={styles.sidebarSectionHeader}>
                    <span class={styles.sidebarSectionTitle}>Schedule Date</span>
                    {addStepModalDueDate && (
                      <button
                        type="button"
                        class={styles.modalClearDateTextBtn}
                        onClick={() => setAddStepModalDueDate(undefined)}
                        title="Clear date"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="date"
                      class={styles.modalInput}
                      value={addStepModalDueDate || ''}
                      onChange={(e) =>
                        setAddStepModalDueDate((e.target as HTMLInputElement).value || undefined)
                      }
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        class={`${styles.modalQuickDateBtnSmall} ${
                          addStepModalDueDate === getTodayStr() ? styles.modalQuickDateBtnActive : ''
                        }`}
                        style={{ flex: 1 }}
                        onClick={() => setAddStepModalDueDate(getTodayStr())}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        class={`${styles.modalQuickDateBtnSmall} ${
                          addStepModalDueDate === getTomorrowStr() ? styles.modalQuickDateBtnActive : ''
                        }`}
                        style={{ flex: 1 }}
                        onClick={() => setAddStepModalDueDate(getTomorrowStr())}
                      >
                        Tomorrow
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lecture Duration */}
                <div class={styles.sidebarSection}>
                  <span class={styles.sidebarSectionTitle}>Lecture Duration</span>
                  <div class={styles.durationInputGroup}>
                    <div class={styles.durationUnitBox}>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        class={`${styles.durationMiniInput} ${
                          addStepModalLabel.toLowerCase() !== 'lecture' ? styles.modalInputDisabled : ''
                        }`}
                        disabled={addStepModalLabel.toLowerCase() !== 'lecture'}
                        value={addStepModalLabel.toLowerCase() === 'lecture' ? addStepModalDurationHours : ''}
                        onInput={(e) => setAddStepModalDurationHours((e.target as HTMLInputElement).value)}
                        placeholder={addStepModalLabel.toLowerCase() === 'lecture' ? '0' : '—'}
                        title="Hours"
                      />
                      <span class={styles.durationUnitLabel}>h</span>
                    </div>
                    <div class={styles.durationUnitBox}>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        class={`${styles.durationMiniInput} ${
                          addStepModalLabel.toLowerCase() !== 'lecture' ? styles.modalInputDisabled : ''
                        }`}
                        disabled={addStepModalLabel.toLowerCase() !== 'lecture'}
                        value={addStepModalLabel.toLowerCase() === 'lecture' ? addStepModalDurationMinutes : ''}
                        onInput={(e) => setAddStepModalDurationMinutes((e.target as HTMLInputElement).value)}
                        placeholder={addStepModalLabel.toLowerCase() === 'lecture' ? '00' : '—'}
                        title="Minutes"
                      />
                      <span class={styles.durationUnitLabel}>m</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Add Task and Cancel */}
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    class={styles.modalCancelBtn}
                    style={{ flex: 1 }}
                    onClick={() => setAddStepModalParentTask(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class={styles.modalSaveBtn}
                    style={{ flex: 1.5, ...(!addStepModalLabel.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
                    disabled={!addStepModalLabel.trim()}
                    onClick={handleSaveAddStep}
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Study Chain Settings Modal */}
      {activeChainModalId && (
        <div
          class={styles.modalBackdrop}
          onClick={() => setActiveChainModalId(null)}
        >
          <div
            class={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div class={styles.modalHeader}>
              <h3 class={styles.modalTitle}>Study Chain Settings</h3>
              <button
                type="button"
                class={styles.modalCloseBtn}
                onClick={() => setActiveChainModalId(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Chain Title Input */}
            <div class={styles.modalField}>
              <label class={styles.modalFieldLabel}>Study Chain Title</label>
              <input
                type="text"
                class={styles.modalInput}
                value={activeChainModalTitle}
                onInput={(e) => setActiveChainModalTitle((e.target as HTMLInputElement).value)}
                placeholder="Enter study chain title..."
                autoFocus
              />
            </div>

            {/* Chain Stats Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
                color: 'var(--text-muted)',
                padding: '8px 12px',
                background: 'var(--bg-control)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                Contains {activeChainModalTasks.length} task{activeChainModalTasks.length === 1 ? '' : 's'} (
                {activeChainModalTasks.filter((t) => t.completed).length} completed)
              </span>
            </div>

            {/* Modal Actions */}
            <div class={styles.modalFooter}>
              {isDeletingChain ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>
                    Delete all {activeChainModalTasks.length} tasks?
                  </span>
                  <button
                    type="button"
                    class={styles.modalDeleteBtn}
                    style={{ backgroundColor: '#ef4444', color: '#ffffff', borderColor: '#ef4444' }}
                    onClick={handleDeleteChain}
                  >
                    Yes, Delete Chain
                  </button>
                  <button
                    type="button"
                    class={styles.modalCancelBtn}
                    onClick={() => setIsDeletingChain(false)}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  class={styles.modalDeleteBtn}
                  onClick={() => setIsDeletingChain(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="13" height="13">
                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Delete Chain
                </button>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  class={styles.modalCancelBtn}
                  onClick={() => setActiveChainModalId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class={styles.modalSaveBtn}
                  onClick={handleSaveChainTitle}
                >
                  Save Title
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
