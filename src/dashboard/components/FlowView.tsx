import { useState, useEffect } from 'preact/hooks';
import { Task } from '../types';
import {
  tasks,
  toggleTask,
  updateTask,
  addCustomFlowStep,
  addConnectedChain,
} from '../store';
import styles from './FlowView.module.css';

interface FlowViewProps {
  chapterId: string;
  subjectId: string;
}

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

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
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [addingStepForTaskId, setAddingStepForTaskId] = useState<string | null>(null);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [schedulingTaskId, setSchedulingTaskId] = useState<string | null>(null);
  const [showAddChainModal, setShowAddChainModal] = useState(false);
  const [newChainLectureTitle, setNewChainLectureTitle] = useState('');
  const [newChainDuration, setNewChainDuration] = useState('');
  const [newChainIncludeDpp, setNewChainIncludeDpp] = useState(true);

  // Close scheduling popover on click outside
  useEffect(() => {
    const handleGlobalClick = () => setSchedulingTaskId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Filter tasks belonging to this chapter
  const chapterTasks = tasks.value.filter((t) => t.chapterId === chapterId);

  // Group tasks into chains
  const chainsMap: Record<string, Task[]> = {};
  const standaloneTasks: Task[] = [];

  chapterTasks.forEach((t) => {
    if (t.chainId) {
      if (!chainsMap[t.chainId]) {
        chainsMap[t.chainId] = [];
      }
      chainsMap[t.chainId].push(t);
    } else {
      standaloneTasks.push(t);
    }
  });

  // Sort tasks within each chain by graph sequence: start at head (no prevTaskId), follow nextTaskId
  const chainRows: Task[][] = Object.values(chainsMap).map((chainList) => {
    const head =
      chainList.find(
        (t) => !t.prevTaskId || !chainList.some((other) => other.id === t.prevTaskId),
      ) || chainList[0];
    const ordered: Task[] = [];
    const visited = new Set<string>();

    let current: Task | undefined = head;
    while (current && !visited.has(current.id)) {
      ordered.push(current);
      visited.add(current.id);
      const nextId: string | undefined = current.nextTaskId;
      current = nextId ? chainList.find((t) => t.id === nextId) : undefined;
    }

    // Add any remaining unlinked items in the chain
    chainList.forEach((t) => {
      if (!visited.has(t.id)) {
        ordered.push(t);
        visited.add(t.id);
      }
    });

    return ordered;
  });

  // Also add standalone tasks as single-item chains
  standaloneTasks.forEach((task) => {
    chainRows.push([task]);
  });

  // Apply filters
  const filteredChains = chainRows.filter((chain) => {
    const isCompleted = chain.length > 0 && chain.every((t) => t.completed);
    if (filter === 'completed') return isCompleted;
    if (filter === 'pending') return !isCompleted;
    return true;
  });

  // Stats calculation
  const totalChains = chainRows.length;
  const completedChains = chainRows.filter(
    (chain) => chain.length > 0 && chain.every((t) => t.completed),
  ).length;

  const handleAddCustomStep = async (parentTaskId: string) => {
    if (!newStepTitle.trim()) {
      setAddingStepForTaskId(null);
      return;
    }
    await addCustomFlowStep(parentTaskId, newStepTitle);
    setNewStepTitle('');
    setAddingStepForTaskId(null);
  };

  const handleCreateChain = async (e: Event) => {
    e.preventDefault();
    if (!newChainLectureTitle.trim()) return;
    await addConnectedChain({
      subjectId,
      chapterId,
      lectureTitle: newChainLectureTitle.trim(),
      duration: newChainDuration.trim() || undefined,
      hasDpp: newChainIncludeDpp,
      hasRevision: true,
    });
    setNewChainLectureTitle('');
    setNewChainDuration('');
    setShowAddChainModal(false);
  };

  const handleScheduleStep = async (taskId: string, dateStr?: string) => {
    await updateTask(taskId, { dueDate: dateStr });
    setSchedulingTaskId(null);
  };

  return (
    <div class={styles.flowContainer}>
      {/* Top Toolbar */}
      <div class={styles.flowToolbar}>
        <div class={styles.toolbarLeft}>
          <span class={styles.statsText}>
            Progress:{' '}
            <span class={styles.statsHighlight}>
              {completedChains} / {totalChains} Chains Done
            </span>{' '}
            ({totalChains > 0 ? Math.round((completedChains / totalChains) * 100) : 0}%)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div class={styles.filterGroup}>
            <button
              class={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({totalChains})
            </button>
            <button
              class={`${styles.filterBtn} ${filter === 'pending' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({totalChains - completedChains})
            </button>
            <button
              class={`${styles.filterBtn} ${filter === 'completed' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({completedChains})
            </button>
          </div>

          <button class={styles.addChainBtn} onClick={() => setShowAddChainModal(true)}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              width={14}
              height={14}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            + New Study Chain
          </button>
        </div>
      </div>

      {/* Chains Canvas */}
      {filteredChains.length === 0 ? (
        <div class={styles.emptyFlowState}>
          <h3 class={styles.emptyTitle}>No Study Chains Found</h3>
          <p class={styles.emptyDesc}>
            Add a study chain to start your Lecture ➔ DPP ➔ Revision roadmap, or sync directly from PW!
          </p>
          <button
            class={styles.addChainBtn}
            style={{ margin: '0 auto' }}
            onClick={() => setShowAddChainModal(true)}
          >
            Create First Study Chain
          </button>
        </div>
      ) : (
        <div class={styles.chainsList}>
          {filteredChains.map((chain, chainIdx) => {
            const isChainComplete = chain.every((t) => t.completed);
            const firstTask = chain[0];
            const lectureTask =
              chain.find((t) => t.chainType === 'lecture' || t.tags.includes('Lecture')) || firstTask;
            const chainLabel = lectureTask?.title || `Chain #${chainIdx + 1}`;
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
                  {isChainComplete && (
                    <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>
                      ✓ COMPLETED
                    </span>
                  )}
                </div>

                <div class={styles.chainScrollArea}>
                  {chain.map((task, idx) => {
                    const isLast = idx === chain.length - 1;
                    const prevTask = idx > 0 ? chain[idx - 1] : null;
                    const isPrevCompleted = prevTask ? prevTask.completed : true;
                    const isUpNext = !task.completed && isPrevCompleted;

                    let typeClass = styles.typeCustom;
                    let typeLabel = task.chainType || 'Step';
                    let displayTitle = task.title;

                    if (task.chainType === 'lecture' || task.tags.includes('Lecture')) {
                      typeClass = styles.typeLecture;
                      typeLabel = 'Lecture';
                    } else if (task.chainType === 'dpp' || task.tags.includes('DPP')) {
                      typeClass = styles.typeDpp;
                      typeLabel = 'DPP';
                      const dppMatch = task.title.match(/(?:dpp|\b)\s*0?(\d+)/i);
                      displayTitle = dppMatch ? `DPP ${dppMatch[1]}` : 'DPP Practice';
                    } else if (task.chainType === 'notes' || task.tags.includes('Notes')) {
                      typeClass = styles.typeNotes;
                      typeLabel = 'Notes';
                      displayTitle = 'Notes & Formulas';
                    } else if (task.chainType === 'revision' || task.tags.includes('Revision')) {
                      typeClass = styles.typeRevision;
                      typeLabel = 'Revision';
                      displayTitle = 'Revision';
                    }

                    return (
                      <div key={task.id} class={styles.nodeWrapper}>
                        {/* Node Card */}
                        <div class={styles.nodeCard}>
                          <div class={styles.nodeHeader}>
                            <span class={`${styles.nodeTypeBadge} ${typeClass}`}>
                              {typeLabel}
                            </span>
                            <button
                              class={`${styles.nodeCheckBtn} ${
                                task.completed ? styles.nodeCheckBtnDone : ''
                              }`}
                              onClick={() => toggleTask(task.id)}
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
                          </div>

                          {task.chainType === 'lecture' || task.tags.includes('Lecture') ? (
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
                                {task.duration || 'Video'}
                              </span>
                            </div>
                          ) : (
                            <p
                              class={`${styles.nodeTitle} ${
                                task.completed ? styles.nodeTitleDone : ''
                              }`}
                              title={task.title}
                            >
                              {displayTitle}
                            </p>
                          )}

                          <div class={styles.nodeFooter}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span class={styles.stepLabel}>Step {idx + 1}</span>
                              {isUpNext && <span class={styles.upNextTag}>Up Next</span>}
                            </div>

                            {/* Schedule Step Button with Interactive Popover */}
                            <div style={{ position: 'relative' }}>
                              <button
                                class={`${styles.scheduleBtn} ${
                                  task.dueDate ? styles.scheduleBtnHasDate : ''
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSchedulingTaskId(
                                    schedulingTaskId === task.id ? null : task.id,
                                  );
                                }}
                                title="Schedule this step"
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

                              {schedulingTaskId === task.id && (
                                <div
                                  class={styles.datePopover}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="date"
                                    class={styles.dateInput}
                                    value={task.dueDate || ''}
                                    onChange={(e) =>
                                      handleScheduleStep(
                                        task.id,
                                        (e.target as HTMLInputElement).value || undefined,
                                      )
                                    }
                                  />
                                  <div class={styles.quickDatesRow}>
                                    <button
                                      type="button"
                                      class={styles.quickDateBtn}
                                      onClick={() => handleScheduleStep(task.id, getTodayStr())}
                                    >
                                      Today
                                    </button>
                                    <button
                                      type="button"
                                      class={styles.quickDateBtn}
                                      onClick={() => handleScheduleStep(task.id, getTomorrowStr())}
                                    >
                                      Tomorrow
                                    </button>
                                    <button
                                      type="button"
                                      class={styles.quickDateBtn}
                                      onClick={() => handleScheduleStep(task.id, undefined)}
                                    >
                                      Clear
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
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
                              >
                                <input
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
                                  autoFocus
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
                                onClick={() => {
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
      {showAddChainModal && (
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
          onClick={() => setShowAddChainModal(false)}
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
                margin: '0 0 8px',
                fontSize: '18px',
                color: 'var(--text-primary)',
                fontWeight: '700',
              }}
            >
              Create Connected Study Chain
            </h3>
            <p
              style={{
                margin: '0 0 16px',
                fontSize: '13px',
                color: 'var(--text-muted)',
                lineHeight: '1.4',
              }}
            >
              This automatically links [Lecture] ➔ [DPP] ➔ [Revision] into a connected study
              pipeline.
            </p>

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

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                }}
              >
                <input
                  type="checkbox"
                  id="includeDpp"
                  checked={newChainIncludeDpp}
                  onChange={(e) =>
                    setNewChainIncludeDpp((e.target as HTMLInputElement).checked)
                  }
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: '#6366f1',
                  }}
                />
                <label
                  htmlFor="includeDpp"
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  Attach Daily Practice Problem (DPP) step
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddChainModal(false)}
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
                  style={{
                    padding: '8px 18px',
                    background: 'var(--accent-primary, #6366f1)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Create Chain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
