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
  { name: 'Maths', color: '#f59e0b' },
  { name: 'Physics', color: '#6b7fd7' },
  { name: 'Chemistry', color: '#10b981' },
  { name: 'Bio', color: '#ec4899' },
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
      createdAt: now + idx,
    });
    defaultChaps.push({
      id: chapId,
      name: 'Chapter 1',
      subjectId: subId,
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
      subjects.value = loadedData.subjects || [];
      chapters.value = loadedData.chapters || [];
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
export async function addSubject(name: string, color?: string): Promise<Subject> {
  const newSubject: Subject = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    color: color || '#6c63ff',
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

export async function renameSubject(id: string, newName: string): Promise<void> {
  subjects.value = subjects.value.map((s) => (s.id === id ? { ...s, name: newName.trim() } : s));
  await persistData();
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
export async function addChapter(subjectId: string, name: string): Promise<Chapter> {
  const newChapter: Chapter = {
    id: 'chap_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    subjectId,
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

export async function renameChapter(id: string, newName: string): Promise<void> {
  chapters.value = chapters.value.map((c) => (c.id === id ? { ...c, name: newName.trim() } : c));
  await persistData();
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
