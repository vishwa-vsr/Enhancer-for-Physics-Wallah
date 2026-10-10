export interface TagItem {
  name: string;
  color: string;
}

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
}

export interface StudyPlannerData {
  subjects: Subject[];
  chapters: Chapter[];
  tasks: Task[];
  tags?: TagItem[];
  displaySettings?: Record<string, ViewDisplaySettings>;
}


