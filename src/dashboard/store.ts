import { signal, computed } from '@preact/signals';
import { Task, Chapter, Subject, ActiveView, StudyPlannerData, TagItem } from './types';

const STORAGE_KEY = 'pw_study_planner_data';

export const DEFAULT_TAGS: TagItem[] = [
  { name: 'Lecture', color: '#6b7fd7' },
  { name: 'DPP', color: '#10b981' },
  { name: 'Revision', color: '#f59e0b' },
  { name: 'Notes', color: '#8b5cf6' },
  { name: 'NCERT', color: '#06b6d4' },
  { name: 'Test', color: '#ec4899' },
  { name: 'Urgent', color: '#ef4444' },
];

const DEFAULT_SUBJECTS_DATA = [
  { name: 'Maths', color: '#6366f1', icon: 'calculator' },
  { name: 'Physics', color: '#3b82f6', icon: 'atom' },
  { name: 'Chemistry', color: '#10b981', icon: 'flask' },
  { name: 'Bio', color: '#ec4899', icon: 'dna' },
];

export const subjects = signal<Subject[]>([]);
export const chapters = signal<Chapter[]>([]);
export const tasks = signal<Task[]>([]);
export const customTags = signal<TagItem[]>(DEFAULT_TAGS);
export const userName = signal<string>('');
export const activeView = signal<ActiveView>({ type: 'today' });
export const expandedSubjects = signal<Record<string, boolean>>({});
export const isLoaded = signal<boolean>(false);

function initializeDefaultSubjects(): void {
  const defaultSubs: Subject[] = [];
  const defaultChaps: Chapter[] = [];
  const now = Date.now();

  DEFAULT_SUBJECTS_DATA.forEach((s, idx) => {
    const subId = `sub_default_${s.name.toLowerCase()}`;
    const chapId = `chap_default_${s.name.toLowerCase()}_1`;
    defaultSubs.push({
      id: subId,
      name: s.name,
      color: s.color,
      icon: s.icon,
      createdAt: now + idx,
    });
    defaultChaps.push({
      id: chapId,
      name: 'Chapter 1',
      subjectId: subId,
      icon: 'file-text',
      createdAt: now + idx,
    });
  });

  subjects.value = defaultSubs;
  chapters.value = defaultChaps;
  expandedSubjects.value = {
    [defaultSubs[0].id]: true,
  };
}

export function toggleSubjectExpanded(subjectId: string): void {
  expandedSubjects.value = {
    ...expandedSubjects.value,
    [subjectId]: !expandedSubjects.value[subjectId],
  };
}

// Storage persistence
export async function loadPlannerData(): Promise<void> {
  try {
    let loadedData: StudyPlannerData | undefined;

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const res = await chrome.storage.local.get(STORAGE_KEY);
      loadedData = res[STORAGE_KEY] as StudyPlannerData | undefined;
    } else {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        loadedData = JSON.parse(raw);
      }
    }

    if (loadedData) {
      subjects.value = (loadedData.subjects || []).map((s) => {
        if (!s.icon) {
          const match = DEFAULT_SUBJECTS_DATA.find(
            (d) => d.name.toLowerCase() === s.name.toLowerCase(),
          );
          return { ...s, icon: match ? match.icon : 'book' };
        }
        return s;
      });
      chapters.value = (loadedData.chapters || []).map((c) => ({
        ...c,
        icon: c.icon || 'file-text',
      }));
      tasks.value = loadedData.tasks || [];
      if (loadedData.tags && loadedData.tags.length > 0) {
        customTags.value = loadedData.tags;
      }
      if (loadedData.userName) {
        userName.value = loadedData.userName;
      }
    }

    // If no subjects exist, initialize with Maths, Physics, Chemistry, Bio + Chapter 1
    if (subjects.value.length === 0) {
      initializeDefaultSubjects();
      await persistData();
    }

    // Auto-update dashboard if synced from popup or another tab
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes[STORAGE_KEY]?.newValue) {
          const updated = changes[STORAGE_KEY].newValue as StudyPlannerData;
          if (updated.subjects) subjects.value = updated.subjects;
          if (updated.chapters) chapters.value = updated.chapters;
          if (updated.tasks) tasks.value = updated.tasks;
          if (updated.tags) customTags.value = updated.tags;
          if (updated.userName) userName.value = updated.userName;
        }
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load planner data:', err);
  } finally {
    isLoaded.value = true;
  }
}

async function persistData(): Promise<void> {
  const data: StudyPlannerData = {
    subjects: subjects.value,
    chapters: chapters.value,
    tasks: tasks.value,
    tags: customTags.value,
    userName: userName.value,
  };

  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [STORAGE_KEY]: data });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to save planner data:', err);
  }
}

// Subject actions
export async function addSubject(
  name: string,
  color?: string,
  icon?: string,
): Promise<Subject> {
  const newSubject: Subject = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    color: color || '#6366f1',
    icon: icon || 'book',
    createdAt: Date.now(),
  };
  subjects.value = [...subjects.value, newSubject];
  expandedSubjects.value = {
    ...expandedSubjects.value,
    [newSubject.id]: true,
  };
  await persistData();
  return newSubject;
}

export async function updateSubject(
  id: string,
  updates: { name?: string; color?: string; icon?: string },
): Promise<void> {
  subjects.value = subjects.value.map((s) =>
    s.id === id
      ? {
          ...s,
          name: updates.name !== undefined ? updates.name.trim() : s.name,
          color: updates.color !== undefined ? updates.color : s.color,
          icon: updates.icon !== undefined ? updates.icon : s.icon,
        }
      : s,
  );
  await persistData();
}

export async function renameSubject(id: string, newName: string): Promise<void> {
  await updateSubject(id, { name: newName });
}

export async function deleteSubject(id: string): Promise<void> {
  const chapterIdsToDelete = chapters.value.filter((c) => c.subjectId === id).map((c) => c.id);
  subjects.value = subjects.value.filter((s) => s.id !== id);
  chapters.value = chapters.value.filter((c) => c.subjectId !== id);
  tasks.value = tasks.value.filter(
    (t) => t.subjectId !== id && !chapterIdsToDelete.includes(t.chapterId),
  );

  if (
    activeView.value.subjectId === id ||
    (activeView.value.chapterId && chapterIdsToDelete.includes(activeView.value.chapterId))
  ) {
    activeView.value = { type: 'today' };
  }
  await persistData();
}

// Chapter actions
export async function addChapter(
  subjectId: string,
  name: string,
  icon?: string,
): Promise<Chapter> {
  const newChapter: Chapter = {
    id: 'chap_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    subjectId,
    icon: icon || 'file-text',
    createdAt: Date.now(),
  };
  chapters.value = [...chapters.value, newChapter];
  expandedSubjects.value = {
    ...expandedSubjects.value,
    [subjectId]: true,
  };
  activeView.value = {
    type: 'chapter',
    subjectId,
    chapterId: newChapter.id,
  };
  await persistData();
  return newChapter;
}

export async function updateChapter(
  id: string,
  updates: { name?: string; icon?: string },
): Promise<void> {
  chapters.value = chapters.value.map((c) =>
    c.id === id
      ? {
          ...c,
          name: updates.name !== undefined ? updates.name.trim() : c.name,
          icon: updates.icon !== undefined ? updates.icon : c.icon,
        }
      : c,
  );
  await persistData();
}

export async function renameChapter(id: string, newName: string): Promise<void> {
  await updateChapter(id, { name: newName });
}

export async function deleteChapter(id: string): Promise<void> {
  chapters.value = chapters.value.filter((c) => c.id !== id);
  tasks.value = tasks.value.filter((t) => t.chapterId !== id);

  if (activeView.value.chapterId === id) {
    activeView.value = { type: 'today' };
  }
  await persistData();
}

// Task actions
export async function addTask(taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  const newTask: Task = {
    ...taskData,
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: Date.now(),
  };
  tasks.value = [newTask, ...tasks.value];
  await persistData();
  return newTask;
}

export async function toggleTask(id: string): Promise<void> {
  tasks.value = tasks.value.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  await persistData();
}

export async function deleteTask(id: string): Promise<void> {
  tasks.value = tasks.value.filter((t) => t.id !== id);
  await persistData();
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  tasks.value = tasks.value.map((t) => (t.id === id ? { ...t, ...updates } : t));
  await persistData();
}

// Display Mode Actions (List vs Flow)
export function setDisplayMode(mode: 'list' | 'flow'): void {
  activeView.value = {
    ...activeView.value,
    displayMode: mode,
  };
}

// Connected Flow Chain Actions
export interface CreateChainParams {
  subjectId: string;
  chapterId: string;
  lectureTitle: string;
  duration?: string;
  hasDpp?: boolean;
  dppTitle?: string;
  hasNotes?: boolean;
  hasRevision?: boolean;
  dueDate?: string;
}

export async function addConnectedChain(params: CreateChainParams): Promise<Task[]> {
  const chainId = 'chain_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const now = Date.now();
  const createdTasks: Task[] = [];

  // 1. Lecture Task
  const lectureTask: Task = {
    id: 'task_' + now + '_lec_' + Math.random().toString(36).substring(2, 6),
    title: params.lectureTitle,
    completed: false,
    subjectId: params.subjectId,
    chapterId: params.chapterId,
    tags: ['Lecture'],
    createdAt: now,
    chainId,
    chainType: 'lecture',
    orderIndex: 0,
    dueDate: params.dueDate,
    duration: params.duration,
  };
  createdTasks.push(lectureTask);

  let prevTask = lectureTask;

  // 2. DPP Task (if applicable)
  if (params.hasDpp !== false) {
    const dppTask: Task = {
      id: 'task_' + (now + 1) + '_dpp_' + Math.random().toString(36).substring(2, 6),
      title: params.dppTitle || `${params.lectureTitle.replace(/lecture/i, 'DPP').trim() || 'DPP Practice'}`,
      completed: false,
      subjectId: params.subjectId,
      chapterId: params.chapterId,
      tags: ['DPP'],
      createdAt: now + 1,
      chainId,
      chainType: 'dpp',
      orderIndex: 1,
      prevTaskId: prevTask.id,
      dueDate: params.dueDate,
    };
    prevTask.nextTaskId = dppTask.id;
    createdTasks.push(dppTask);
    prevTask = dppTask;
  }

  // 3. Notes Task (if requested, default false for cleaner pipelines, or revision)
  if (params.hasNotes) {
    const notesTask: Task = {
      id: 'task_' + (now + 2) + '_notes_' + Math.random().toString(36).substring(2, 6),
      title: `Notes: ${params.lectureTitle}`,
      completed: false,
      subjectId: params.subjectId,
      chapterId: params.chapterId,
      tags: ['Notes'],
      createdAt: now + 2,
      chainId,
      chainType: 'notes',
      orderIndex: createdTasks.length,
      prevTaskId: prevTask.id,
    };
    prevTask.nextTaskId = notesTask.id;
    createdTasks.push(notesTask);
    prevTask = notesTask;
  }

  // 4. Revision Task (default connected to wrap up the learning loop)
  if (params.hasRevision !== false) {
    const revTask: Task = {
      id: 'task_' + (now + 3) + '_rev_' + Math.random().toString(36).substring(2, 6),
      title: `Revision: ${params.lectureTitle}`,
      completed: false,
      subjectId: params.subjectId,
      chapterId: params.chapterId,
      tags: ['Revision'],
      createdAt: now + 3,
      chainId,
      chainType: 'revision',
      orderIndex: createdTasks.length,
      prevTaskId: prevTask.id,
    };
    prevTask.nextTaskId = revTask.id;
    createdTasks.push(revTask);
  }

  tasks.value = [...createdTasks, ...tasks.value];
  await persistData();
  return createdTasks;
}

export async function addCustomFlowStep(parentTaskId: string, title: string): Promise<Task | null> {
  const parent = tasks.value.find((t) => t.id === parentTaskId);
  if (!parent) return null;

  const now = Date.now();
  const newTask: Task = {
    id: 'task_' + now + '_cust_' + Math.random().toString(36).substring(2, 6),
    title: title.trim(),
    completed: false,
    subjectId: parent.subjectId,
    chapterId: parent.chapterId,
    tags: ['Bonus'],
    createdAt: now,
    chainId: parent.chainId,
    chainType: 'custom',
    orderIndex: (parent.orderIndex || 0) + 1,
    prevTaskId: parent.id,
  };

  // Link parent to new task
  const oldNextId = parent.nextTaskId;
  parent.nextTaskId = newTask.id;
  if (oldNextId) {
    newTask.nextTaskId = oldNextId;
    const oldNext = tasks.value.find((t) => t.id === oldNextId);
    if (oldNext) oldNext.prevTaskId = newTask.id;
  }

  tasks.value = [newTask, ...tasks.value];
  await persistData();
  return newTask;
}

export async function connectTasks(fromTaskId: string, toTaskId: string): Promise<void> {
  tasks.value = tasks.value.map((t) => {
    if (t.id === fromTaskId) {
      return { ...t, nextTaskId: toTaskId };
    }
    if (t.id === toTaskId) {
      return { ...t, prevTaskId: fromTaskId };
    }
    return t;
  });
  await persistData();
}

export async function disconnectTasks(fromTaskId: string): Promise<void> {
  const fromTask = tasks.value.find((t) => t.id === fromTaskId);
  if (!fromTask || !fromTask.nextTaskId) return;

  const toTaskId = fromTask.nextTaskId;
  tasks.value = tasks.value.map((t) => {
    if (t.id === fromTaskId) {
      return { ...t, nextTaskId: undefined };
    }
    if (t.id === toTaskId) {
      return { ...t, prevTaskId: undefined };
    }
    return t;
  });
  await persistData();
}



// Tag Management (used in Settings)
export async function addCustomTag(name: string, color: string): Promise<boolean> {
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (customTags.value.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
    return false;
  }
  customTags.value = [...customTags.value, { name: trimmed, color: color || '#6b7fd7' }];
  await persistData();
  return true;
}

export async function deleteCustomTag(name: string): Promise<void> {
  customTags.value = customTags.value.filter((t) => t.name !== name);
  await persistData();
}

export async function setUserName(name: string): Promise<void> {
  userName.value = name.trim();
  await persistData();
}

// Computed helpers
export const filteredTasks = computed(() => {
  let list = tasks.value;
  const view = activeView.value;

  if (view.type === 'chapter' && view.chapterId) {
    list = list.filter((t) => t.chapterId === view.chapterId);
  } else if (view.type === 'today') {
    const todayStr = new Date().toISOString().split('T')[0];
    list = list.filter((t) => !t.completed || t.dueDate === todayStr);
  } else if (view.type === 'upcoming') {
    list = list.filter((t) => !t.completed);
  }

  return list;
});
