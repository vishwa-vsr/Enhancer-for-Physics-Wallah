import { signal, computed } from '@preact/signals';
import {
  Task,
  Chapter,
  Subject,
  ActiveView,
  StudyPlannerData,
  TagItem,
  LayoutMode,
  GroupByMode,
  ViewDisplaySettings,
  TaskGroup,
} from './types';

const STORAGE_KEY = 'pw_study_planner_data';

export const DEFAULT_TAGS: TagItem[] = [
  { name: 'Lecture', color: '#6b7fd7' },
  { name: 'DPP', color: '#10b981' },
  { name: 'Revision', color: '#f59e0b' },
  { name: 'Notes', color: '#8b5cf6' },
  { name: 'NCERT', color: '#06b6d4' },
  { name: 'Test', color: '#ec4899' },
];

export const subjects = signal<Subject[]>([]);
export const chapters = signal<Chapter[]>([]);
export const tasks = signal<Task[]>([]);
export const customTags = signal<TagItem[]>(DEFAULT_TAGS);
export const activeView = signal<ActiveView>({ type: 'today' });
export const expandedSubjects = signal<Record<string, boolean>>({});
export const displaySettings = signal<Record<string, ViewDisplaySettings>>({});
export const isLoaded = signal<boolean>(false);

const SIDEBAR_COLLAPSED_KEY = 'pw_sidebar_collapsed';
const savedSidebarCollapsed =
  typeof localStorage !== 'undefined'
    ? localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    : false;

export const isSidebarCollapsed = signal<boolean>(savedSidebarCollapsed);

export function toggleSidebarCollapsed(): void {
  const nextVal = !isSidebarCollapsed.value;
  isSidebarCollapsed.value = nextVal;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(nextVal));
    }
  } catch {
    // Ignore localStorage error
  }
}

export function setSidebarCollapsed(collapsed: boolean): void {
  isSidebarCollapsed.value = collapsed;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    }
  } catch {
    // Ignore localStorage error
  }
}

export function toggleSubjectExpanded(subjectId: string): void {
  expandedSubjects.value = {
    ...expandedSubjects.value,
    [subjectId]: !expandedSubjects.value[subjectId],
  };
}

let storageListenerRegistered = false;

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
      if (loadedData.tags && loadedData.tags.length > 0) {
        customTags.value = loadedData.tags;
      }

      const validTagNames = new Set(
        customTags.value.map((t) => t.name.toLowerCase()),
      );

      subjects.value = (loadedData.subjects || []).map((s) => ({
        ...s,
        icon: s.icon || 'book',
      }));
      chapters.value = (loadedData.chapters || []).map((c) => ({
        ...c,
        icon: c.icon || 'file-text',
      }));

      let hadGhostTags = false;
      tasks.value = (loadedData.tasks || []).map((t) => {
        if (!t.tags || t.tags.length === 0) return t;
        const cleanedTags = t.tags.filter((tag) =>
          validTagNames.has(tag.toLowerCase()),
        );
        if (cleanedTags.length !== t.tags.length) {
          hadGhostTags = true;
          return { ...t, tags: cleanedTags };
        }
        return t;
      });

      if (loadedData.displaySettings) {
        displaySettings.value = loadedData.displaySettings;
      }

      if (hadGhostTags) {
        await persistData();
      }
    }

    // Auto-update dashboard if synced from popup or another tab
    if (
      !storageListenerRegistered &&
      typeof chrome !== 'undefined' &&
      chrome.storage?.onChanged
    ) {
      storageListenerRegistered = true;
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes[STORAGE_KEY]?.newValue) {
          const updated = changes[STORAGE_KEY].newValue as StudyPlannerData;
          if (updated.subjects) subjects.value = updated.subjects;
          if (updated.chapters) chapters.value = updated.chapters;
          if (updated.tasks) tasks.value = updated.tasks;
          if (updated.tags) customTags.value = updated.tags;
          if (updated.displaySettings) displaySettings.value = updated.displaySettings;
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
    displaySettings: displaySettings.value,
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

export async function deleteSubject(id: string): Promise<void> {
  const chapterIdsToDelete = chapters.value.filter((c) => c.subjectId === id).map((c) => c.id);
  subjects.value = subjects.value.filter((s) => s.id !== id);
  chapters.value = chapters.value.filter((c) => c.subjectId !== id);
  tasks.value = tasks.value.filter(
    (t) => t.subjectId !== id && !chapterIdsToDelete.includes(t.chapterId),
  );

  const nextDisplay = { ...displaySettings.value };
  delete nextDisplay[`subject_${id}`];
  for (const chapId of chapterIdsToDelete) {
    delete nextDisplay[`chapter_${chapId}`];
  }
  displaySettings.value = nextDisplay;

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

export async function deleteChapter(id: string): Promise<void> {
  chapters.value = chapters.value.filter((c) => c.id !== id);
  tasks.value = tasks.value.filter((t) => t.chapterId !== id);

  const nextDisplay = { ...displaySettings.value };
  delete nextDisplay[`chapter_${id}`];
  displaySettings.value = nextDisplay;

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
  const targetLower = name.trim().toLowerCase();
  customTags.value = customTags.value.filter((t) => t.name.toLowerCase() !== targetLower);
  tasks.value = tasks.value.map((t) =>
    t.tags?.some((tag) => tag.toLowerCase() === targetLower)
      ? { ...t, tags: t.tags.filter((tag) => tag.toLowerCase() !== targetLower) }
      : t,
  );
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
  } else if (view.type === 'inbox') {
    // Inbox: all tasks that do not have both a subject and a chapter assigned
    list = list.filter((t) => !t.subjectId || !t.chapterId);
  } else if (view.type === 'today') {
    const todayStr = getLocalDateStr();
    // Today: tasks scheduled for today, Subject/Chapter tasks without a due date,
    // incomplete tasks from earlier dates (overdue), OR overdue tasks completed today.
    // Dateless Inbox tasks stay cleanly inside Inbox.
    list = list.filter((t) => {
      const isInbox = !t.subjectId || !t.chapterId;
      if (!t.dueDate) return !isInbox && (!t.completed || t.completedDate === todayStr);
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

  // Always keep unfinished tasks at the top and move completed tasks to the bottom
  return [...list].sort((a, b) => Number(a.completed) - Number(b.completed));
});

export const DEFAULT_DISPLAY_SETTINGS: ViewDisplaySettings = {
  layout: 'list',
  groupBy: 'none',
};

export function getViewKey(view: ActiveView = activeView.value): string {
  if (view.type === 'chapter') {
    return view.chapterId ? `chapter_${view.chapterId}` : `subject_${view.subjectId || 'default'}`;
  }
  return view.type;
}

export const currentDisplaySettings = computed<ViewDisplaySettings>(() => {
  const key = getViewKey(activeView.value);
  return displaySettings.value[key] || DEFAULT_DISPLAY_SETTINGS;
});

export async function setViewLayout(layout: LayoutMode): Promise<void> {
  const key = getViewKey(activeView.value);
  const current = displaySettings.value[key] || DEFAULT_DISPLAY_SETTINGS;
  let nextGroupBy = current.groupBy;

  // Board layout needs columns: auto-switch from 'none' to 'date' (in Upcoming) or 'label'
  if (layout === 'board' && nextGroupBy === 'none') {
    nextGroupBy = activeView.value.type === 'upcoming' ? 'date' : 'label';
  }

  displaySettings.value = {
    ...displaySettings.value,
    [key]: { layout, groupBy: nextGroupBy },
  };
  await persistData();
}

export async function setViewGroupBy(groupBy: GroupByMode): Promise<void> {
  const key = getViewKey(activeView.value);
  const current = displaySettings.value[key] || DEFAULT_DISPLAY_SETTINGS;
  let nextLayout = current.layout;

  // If user switches back to 'none' (Normal) while in Board view, return to List layout
  if (groupBy === 'none' && nextLayout === 'board') {
    nextLayout = 'list';
  }

  displaySettings.value = {
    ...displaySettings.value,
    [key]: { layout: nextLayout, groupBy },
  };
  await persistData();
}

function formatDateGroupHeader(dateStr: string, todayStr: string, tomorrowStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    const nowYear = new Date().getFullYear();

    const shortMonthDay = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    if (dateStr === todayStr) {
      return `Today • ${shortMonthDay}`;
    }
    if (dateStr === tomorrowStr) {
      return `Tomorrow • ${shortMonthDay}`;
    }

    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    if (year !== nowYear) {
      return `${shortMonthDay}, ${year}`;
    }
    return `${weekday}, ${shortMonthDay}`;
  } catch {
    return dateStr;
  }
}

export const groupedTasks = computed<TaskGroup[]>(() => {
  const list = filteredTasks.value;
  const { groupBy } = currentDisplaySettings.value;

  if (groupBy === 'none') {
    return [{ id: 'all', title: '', tasks: list }];
  }

  if (groupBy === 'label') {
    const groupsMap = new Map<string, TaskGroup>();
    const knownTags = customTags.value;

    // Seed groups in the user's configured Study Label order
    for (const tag of knownTags) {
      groupsMap.set(tag.name.toLowerCase(), {
        id: `label_${tag.name}`,
        title: tag.name,
        color: tag.color || '#6366f1',
        tasks: [],
      });
    }

    const noLabelTasks: Task[] = [];

    for (const task of list) {
      const primaryTag = task.tags?.[0]?.trim();
      if (!primaryTag) {
        noLabelTasks.push(task);
        continue;
      }

      const key = primaryTag.toLowerCase();
      let group = groupsMap.get(key);
      if (!group) {
        group = {
          id: `label_${primaryTag}`,
          title: primaryTag,
          color: '#6366f1',
          tasks: [],
        };
        groupsMap.set(key, group);
      }
      group.tasks.push(task);
    }

    const result: TaskGroup[] = [];
    for (const group of groupsMap.values()) {
      if (group.tasks.length > 0) {
        result.push(group);
      }
    }

    if (noLabelTasks.length > 0) {
      result.push({
        id: '__no_label__',
        title: 'No Label',
        color: '#8e9bb0',
        tasks: noLabelTasks,
      });
    }

    return result;
  }

  // Group by Date ('date')
  const todayStr = getLocalDateStr();
  const tomorrowStr = getLocalTomorrowStr();
  const overdueTasks: Task[] = [];
  const noDateTasks: Task[] = [];
  const dateBuckets = new Map<string, Task[]>();

  for (const task of list) {
    if (!task.dueDate) {
      noDateTasks.push(task);
    } else if (task.dueDate < todayStr) {
      overdueTasks.push(task);
    } else {
      const bucket = dateBuckets.get(task.dueDate) || [];
      bucket.push(task);
      dateBuckets.set(task.dueDate, bucket);
    }
  }

  const result: TaskGroup[] = [];

  if (overdueTasks.length > 0) {
    result.push({
      id: '__overdue__',
      title: 'Overdue',
      color: '#ef4444',
      tasks: overdueTasks,
    });
  }

  const sortedDates = Array.from(dateBuckets.keys()).sort((a, b) => a.localeCompare(b));
  for (const dateStr of sortedDates) {
    const bucketTasks = dateBuckets.get(dateStr) || [];
    if (bucketTasks.length > 0) {
      const color =
        dateStr === todayStr
          ? '#10b981'
          : dateStr === tomorrowStr
          ? '#f59e0b'
          : '#6366f1';
      result.push({
        id: `date_${dateStr}`,
        title: formatDateGroupHeader(dateStr, todayStr, tomorrowStr),
        color,
        tasks: bucketTasks,
      });
    }
  }

  if (noDateTasks.length > 0) {
    result.push({
      id: '__no_date__',
      title: 'No Date',
      color: '#8e9bb0',
      tasks: noDateTasks,
    });
  }

  return result;
});

