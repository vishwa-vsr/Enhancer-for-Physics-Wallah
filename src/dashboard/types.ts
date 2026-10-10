export interface TagItem {
  name: string;
  color: string;
}

export type ChainStage = 'lecture' | 'dpp' | 'notes' | 'revision' | 'custom' | string;

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  tags: string[];
  subjectId: string;
  chapterId: string;
  createdAt: number;
  chainId?: string;
  chainTitle?: string;
  chainType?: ChainStage;
  nextTaskId?: string;
  prevTaskId?: string;
  orderIndex?: number;
  lectureDate?: string;
  completedDate?: string;
}

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
  icon?: string;
  createdAt: number;
}

export interface Subject {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: number;
}

export type ViewType = 'today' | 'upcoming' | 'inbox' | 'chapter' | 'settings';
export type DisplayMode = 'list' | 'flow';

export type LayoutMode = 'list' | 'board';
export type GroupByMode = 'none' | 'date' | 'label';

export interface ViewDisplaySettings {
  layout: LayoutMode;
  groupBy: GroupByMode;
}

export interface TaskGroup {
  id: string;
  title: string;
  color?: string;
  tasks: Task[];
}

export interface ActiveView {
  type: ViewType;
  subjectId?: string;
  chapterId?: string;
  displayMode?: DisplayMode;
}

export interface StudyPlannerData {
  subjects: Subject[];
  chapters: Chapter[];
  tasks: Task[];
  tags?: TagItem[];
  userName?: string;
  displaySettings?: Record<string, ViewDisplaySettings>;
}

