import { useState } from 'preact/hooks';
import { Task } from '../types';
import {
  tasks,
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
  const [addingStepForTaskId, setAddingStepForTaskId] = useState<string | null>(null);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [newChainLectureTitle, setNewChainLectureTitle] = useState('');
  const [newChainDuration, setNewChainDuration] = useState('');
  const [selectedChainLabels, setSelectedChainLabels] = useState<string[]>(['Lecture', 'DPP', 'Revision']);

  // 3-Dot Step Settings Modal State
  const [activeStepModalTask, setActiveStepModalTask] = useState<Task | null>(null);
  const [stepModalTitle, setStepModalTitle] = useState('');
  const [stepModalLabel, setStepModalLabel] = useState('');
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

  // Sort chain rows by first task's creation timestamp so Lecture 01 appears before Lecture 02
  chainRows.sort((a, b) => (a[0]?.createdAt || 0) - (b[0]?.createdAt || 0));

  const filteredChains = chainRows;

  const handleAddCustomStep = async (parentTaskId: string) => {
    const trimmed = newStepTitle.trim();
    if (!trimmed) {
      setAddingStepForTaskId(null);
      return;
    }
    await addCustomFlowStep(parentTaskId, trimmed);
    setNewStepTitle('');
    setAddingStepForTaskId(null);
  };

  const handleStartRename = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleSaveRename = async (taskId: string) => {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      await updateTask(taskId, { title: trimmed });
    }
    setEditingTaskId(null);
  };

  const openStepModal = (task: Task) => {
    setActiveStepModalTask(task);
    setStepModalTitle(task.title);
    setStepModalLabel(task.tags[0] || task.chainType || 'Lecture');
    setStepModalDueDate(task.dueDate);
    setIsDeletingStep(false);
  };

  const handleSaveStepModal = async () => {
    if (!activeStepModalTask) return;
    const trimmed = stepModalTitle.trim() || activeStepModalTask.title;
    await updateTask(activeStepModalTask.id, {
      title: trimmed,
      tags: [stepModalLabel],
      chainType: stepModalLabel.toLowerCase(),
      dueDate: stepModalDueDate || undefined,
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
      await updateChainTitle(activeChainModalId, trimmed);
    }
    setActiveChainModalId(null);
  };

  const handleDeleteChain = async () => {
    if (!activeChainModalId) return;
    await deleteConnectedChain(activeChainModalId);
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
                    let typeLabel = task.tags[0] || task.chainType || 'Step';
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

                    if (typeLabel.toLowerCase() === 'dpp') {
                      const dppMatch = task.title.match(/(?:dpp|\b)\s*0?(\d+)/i);
                      displayTitle = dppMatch ? `DPP ${dppMatch[1]}` : (task.title || 'DPP Practice');
                    } else if (typeLabel.toLowerCase() === 'notes') {
                      displayTitle =
                        task.title && !/^notes(\s*:.*)?$/i.test(task.title.trim())
                          ? task.title
                          : 'Notes & Formulas';
                    } else if (typeLabel.toLowerCase() === 'revision') {
                      if (!task.title || /^revision(\s*:.*)?$/i.test(task.title.trim())) {
                        displayTitle = 'Formulas & Key Notes';
                      } else {
                        displayTitle = task.title;
                      }
                    } else {
                      displayTitle = task.title || typeLabel;
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
                              title="Step settings"
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <circle cx="5" cy="12" r="2.2" />
                                <circle cx="12" cy="12" r="2.2" />
                                <circle cx="19" cy="12" r="2.2" />
                              </svg>
                            </button>
                          </div>

                          {editingTaskId === task.id ? (
                            <div style={{ margin: '4px 0' }} onClick={(e) => e.stopPropagation()}>
                              <input
                                ref={(el) => {
                                  if (el) el.focus();
                                }}
                                type="text"
                                class={styles.editTitleInput}
                                value={editingTitle}
                                onInput={(e) =>
                                  setEditingTitle((e.target as HTMLInputElement).value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRename(task.id);
                                  if (e.key === 'Escape') setEditingTaskId(null);
                                }}
                                onBlur={() => handleSaveRename(task.id)}
                              />
                            </div>
                          ) : (
                            <div class={styles.nodeBody}>
                              {displayTitle && (
                                <p
                                  class={`${styles.nodeTitle} ${
                                    task.completed ? styles.nodeTitleDone : ''
                                  }`}
                                  title="Double click to rename"
                                  onDblClick={(e) => {
                                    e.stopPropagation();
                                    handleStartRename(task);
                                  }}
                                >
                                  {displayTitle}
                                </p>
                              )}
                              {task.duration && task.duration.toLowerCase() !== 'video' && (
                                <div class={styles.lectureBody}>
                                  <span class={styles.durationBadge}>
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2.2}
                                      width="13"
                                      height="13"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {task.duration}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          <div class={styles.nodeFooter}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span class={styles.stepLabel}>Step {idx + 1}</span>
                              {isUpNext && <span class={styles.upNextTag}>Up Next</span>}
                            </div>

                            {/* Scheduled date badge */}
                            {task.dueDate && (
                              <button
                                type="button"
                                class={styles.scheduledBadge}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openStepModal(task);
                                }}
                                title="Scheduled date (Click to edit)"
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
                            )}
                          </div>
                        </div>

                        {/* Connecting Line to Next Step */}
                        {!isLast && (
                          <div class={styles.connectorWrapper}>
                            <div class={styles.connectorLine} />
                          </div>
                        )}

                        {/* If last task, show '+' button to branch/add bonus step */}
                        {isLast && (
                          <>
                            {addingStepForTaskId === task.id ? (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  marginLeft: '10px',
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  ref={(el) => {
                                    if (el) el.focus();
                                  }}
                                  type="text"
                                  placeholder="Step name (e.g. Formula revision)"
                                  value={newStepTitle}
                                  onInput={(e) =>
                                    setNewStepTitle((e.target as HTMLInputElement).value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddCustomStep(task.id);
                                    if (e.key === 'Escape') setAddingStepForTaskId(null);
                                  }}
                                  style={{
                                    padding: '7px 10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--accent-primary, #6366f1)',
                                    background: 'var(--bg-control)',
                                    color: 'var(--text-primary)',
                                    fontSize: '12px',
                                    width: '180px',
                                  }}
                                />
                                <button
                                  onClick={() => handleAddCustomStep(task.id)}
                                  style={{
                                    padding: '7px 12px',
                                    background: 'var(--accent-primary, #6366f1)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() => setAddingStepForTaskId(null)}
                                  style={{
                                    padding: '7px 8px',
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    border: 'none',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                class={styles.addStepBtn}
                                title="Attach next bonus step"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddingStepForTaskId(task.id);
                                  setNewStepTitle('');
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
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                  Lecture Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lecture 01: Electric Charges and Fields"
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

      {/* 3-Dot Step Settings Modal */}
      {activeStepModalTask && (
        <div
          class={styles.modalBackdrop}
          onClick={() => setActiveStepModalTask(null)}
        >
          <div
            class={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div class={styles.modalHeader}>
              <h3 class={styles.modalTitle}>Step Settings</h3>
              <button
                type="button"
                class={styles.modalCloseBtn}
                onClick={() => setActiveStepModalTask(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Step Title Input */}
            <div class={styles.modalField}>
              <label class={styles.modalFieldLabel}>Step Title</label>
              <input
                type="text"
                class={styles.modalInput}
                value={stepModalTitle}
                onInput={(e) => setStepModalTitle((e.target as HTMLInputElement).value)}
                placeholder="Enter step title..."
              />
            </div>

            {/* Change Label */}
            <div class={styles.modalField}>
              <label class={styles.modalFieldLabel}>Step Label</label>
              <div class={styles.modalLabelsGrid}>
                {customTags.value.map((tag) => {
                  const isSelected = stepModalLabel.toLowerCase() === tag.name.toLowerCase();
                  return (
                    <button
                      key={tag.name}
                      type="button"
                      class={`${styles.modalLabelPill} ${
                        isSelected ? styles.modalLabelPillSelected : ''
                      }`}
                      style={
                        isSelected
                          ? {
                              backgroundColor: `${tag.color}20`,
                              borderColor: tag.color,
                              color: tag.color,
                            }
                          : undefined
                      }
                      onClick={() => setStepModalLabel(tag.name)}
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

            {/* Schedule Task */}
            <div class={styles.modalField}>
              <label class={styles.modalFieldLabel}>Schedule Date</label>
              <div class={styles.modalDateActions}>
                <button
                  type="button"
                  class={`${styles.modalQuickDateBtn} ${
                    stepModalDueDate === getTodayStr() ? styles.modalQuickDateBtnActive : ''
                  }`}
                  onClick={() => setStepModalDueDate(getTodayStr())}
                >
                  Today
                </button>
                <button
                  type="button"
                  class={`${styles.modalQuickDateBtn} ${
                    stepModalDueDate === getTomorrowStr() ? styles.modalQuickDateBtnActive : ''
                  }`}
                  onClick={() => setStepModalDueDate(getTomorrowStr())}
                >
                  Tomorrow
                </button>
                <input
                  type="date"
                  class={styles.modalInput}
                  style={{ width: 'auto', flex: 1, minWidth: '130px' }}
                  value={stepModalDueDate || ''}
                  onChange={(e) =>
                    setStepModalDueDate((e.target as HTMLInputElement).value || undefined)
                  }
                />
                {stepModalDueDate && (
                  <button
                    type="button"
                    class={styles.modalClearDateBtn}
                    onClick={() => setStepModalDueDate(undefined)}
                  >
                    Clear Date
                  </button>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div class={styles.modalFooter}>
              {isDeletingStep ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>Confirm delete?</span>
                  <button
                    type="button"
                    class={styles.modalDeleteBtn}
                    style={{ backgroundColor: '#ef4444', color: '#ffffff', borderColor: '#ef4444' }}
                    onClick={handleDeleteStepModal}
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    class={styles.modalCancelBtn}
                    onClick={() => setIsDeletingStep(false)}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  class={styles.modalDeleteBtn}
                  onClick={() => setIsDeletingStep(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="13" height="13">
                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Delete Step
                </button>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  class={styles.modalCancelBtn}
                  onClick={() => setActiveStepModalTask(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class={styles.modalSaveBtn}
                  onClick={handleSaveStepModal}
                >
                  Save Changes
                </button>
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
                Contains {activeChainModalTasks.length} step{activeChainModalTasks.length === 1 ? '' : 's'} (
                {activeChainModalTasks.filter((t) => t.completed).length} completed)
              </span>
            </div>

            {/* Modal Actions */}
            <div class={styles.modalFooter}>
              {isDeletingChain ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>
                    Delete all {activeChainModalTasks.length} steps?
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
