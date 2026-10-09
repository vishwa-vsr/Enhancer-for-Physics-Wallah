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
      // Filter out any default dummy subjects and their chapters/tasks
      const rawSubjects = (loadedData.subjects || []).filter(
        (s) => !s.id.startsWith('sub_default_'),
      );
      const rawChapters = (loadedData.chapters || []).filter(
        (c) =>
          !c.id.startsWith('chap_default_') &&
          !c.subjectId.startsWith('sub_default_'),
      );
      const rawTasks = (loadedData.tasks || []).filter(
        (t) =>
          !t.subjectId.startsWith('sub_default_') &&
          !t.chapterId.startsWith('chap_default_'),
      );

      const hadDefaults =
        rawSubjects.length !== (loadedData.subjects || []).length ||
        rawChapters.length !== (loadedData.chapters || []).length;

      subjects.value = rawSubjects.map((s) => {
        if (!s.icon) {
          const match = DEFAULT_SUBJECTS_DATA.find(
            (d) => d.name.toLowerCase() === s.name.toLowerCase(),
          );
          return { ...s, icon: match ? match.icon : 'book' };
        }
        return s;
      });
      chapters.value = rawChapters.map((c) => ({
        ...c,
        icon: c.icon || 'file-text',
      }));
      tasks.value = rawTasks;
      if (loadedData.tags && loadedData.tags.length > 0) {
        customTags.value = loadedData.tags;
      }
      if (loadedData.userName) {
        userName.value = loadedData.userName;
      }

      // If we cleaned out legacy defaults, update storage
      if (hadDefaults) {
        await persistData();
      }
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
  const todayStr = getLocalDateStr();
  tasks.value = tasks.value.map((t) => {
    if (t.id === id) {
      const nextCompleted = !t.completed;
      return {
        ...t,
        completed: nextCompleted,
        completedDate: nextCompleted ? todayStr : undefined,
      };
    }
    return t;
  });
  await persistData();
}

export function getLocalDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalTomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return getLocalDateStr(d);
}

export async function deleteTask(id: string): Promise<void> {
  const taskToDelete = tasks.value.find((t) => t.id === id);
  let updated = tasks.value.filter((t) => t.id !== id);

  if (taskToDelete) {
    const prevId = taskToDelete.prevTaskId;
    const nextId = taskToDelete.nextTaskId;
    updated = updated.map((t) => {
      if (prevId && t.id === prevId) {
        return { ...t, nextTaskId: nextId };
      }
      if (nextId && t.id === nextId) {
        return { ...t, prevTaskId: prevId };
      }
      return t;
    });
  }

  tasks.value = updated;
  await persistData();
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  tasks.value = tasks.value.map((t) => (t.id === id ? { ...t, ...updates } : t));
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

  if (view.type === 'chapter') {
    if (view.chapterId) {
      list = list.filter((t) => t.chapterId === view.chapterId);
    } else {
      // If subject has no chapters or chapterId is empty, return empty list to prevent leaking database
      return [];
    }
  } else if (view.type === 'today') {
    const todayStr = getLocalDateStr();
    // Today: tasks scheduled for today, OR incomplete tasks from earlier dates (overdue),
    // OR overdue tasks that were completed today so the user can see their accomplishment
    list = list.filter((t) => {
      if (t.dueDate === todayStr) return true;
      if (!t.completed && t.dueDate && t.dueDate < todayStr) return true;
      if (t.completed && t.dueDate && t.dueDate < todayStr && t.completedDate === todayStr) return true;
      return false;
    });
  } else if (view.type === 'upcoming') {
    const todayStr = getLocalDateStr();
    // Upcoming: incomplete tasks scheduled for future dates
    list = list.filter((t) => !t.completed && t.dueDate && t.dueDate > todayStr);
  }

  return list;
});
