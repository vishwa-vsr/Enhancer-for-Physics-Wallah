import { signal, computed } from '@preact/signals';
import { Task, Chapter, Subject, ActiveView, StudyPlannerData } from './types';

const STORAGE_KEY = 'pw_study_planner_data';

export const subjects = signal<Subject[]>([]);
export const chapters = signal<Chapter[]>([]);
export const tasks = signal<Task[]>([]);
export const activeView = signal<ActiveView>({ type: 'today' });
export const selectedTags = signal<string[]>([]);
export const expandedSubjects = signal<Record<string, boolean>>({});
export const isLoaded = signal<boolean>(false);

// Auto-expand newly created subjects or first subject
export function toggleSubjectExpanded(subjectId: string): void {
  expandedSubjects.value = {
    ...expandedSubjects.value,
    [subjectId]: !expandedSubjects.value[subjectId],
  };
}

// Storage persistence
export async function loadPlannerData(): Promise<void> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const res = await chrome.storage.local.get(STORAGE_KEY);
      const data = res[STORAGE_KEY] as StudyPlannerData | undefined;
      if (data) {
        subjects.value = data.subjects || [];
        chapters.value = data.chapters || [];
        tasks.value = data.tasks || [];
      }
    } else {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: StudyPlannerData = JSON.parse(raw);
        subjects.value = data.subjects || [];
        chapters.value = data.chapters || [];
        tasks.value = data.tasks || [];
      }
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
  // Auto-expand this subject
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
  // Delete subject, all its chapters, and all associated tasks
  const chapterIdsToDelete = chapters.value.filter((c) => c.subjectId === id).map((c) => c.id);
  subjects.value = subjects.value.filter((s) => s.id !== id);
  chapters.value = chapters.value.filter((c) => c.subjectId !== id);
  tasks.value = tasks.value.filter(
    (t) => t.subjectId !== id && !chapterIdsToDelete.includes(t.chapterId),
  );

  // If active view was this subject or one of its chapters, reset to 'today'
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
  // Make sure parent subject is expanded
  expandedSubjects.value = {
    ...expandedSubjects.value,
    [subjectId]: true,
  };
  // Automatically select this chapter
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

// Tag filtering
export function toggleTag(tag: string): void {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag);
  } else {
    selectedTags.value = [...selectedTags.value, tag];
  }
}

export function clearSelectedTags(): void {
  selectedTags.value = [];
}

// Computed helpers
export const availableTags = computed(() => {
  const set = new Set<string>();
  tasks.value.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
  return Array.from(set).sort();
});

export const filteredTasks = computed(() => {
  let list = tasks.value;
  const view = activeView.value;

  if (view.type === 'chapter' && view.chapterId) {
    list = list.filter((t) => t.chapterId === view.chapterId);
  } else if (view.type === 'completed') {
    list = list.filter((t) => t.completed);
  } else if (view.type === 'today') {
    // Today: Active tasks or tasks marked today
    const todayStr = new Date().toISOString().split('T')[0];
    list = list.filter((t) => !t.completed || t.dueDate === todayStr);
  } else if (view.type === 'upcoming') {
    list = list.filter((t) => !t.completed);
  }
  // 'all' includes everything

  if (selectedTags.value.length > 0) {
    list = list.filter((t) => selectedTags.value.some((tag) => t.tags.includes(tag)));
  }

  return list;
});
