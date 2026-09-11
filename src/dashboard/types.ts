export type Priority = 'low' | 'medium' | 'high';

export interface TagItem {
  name: string;
  color: string;
}

export type ChainStage = 'lecture' | 'dpp' | 'notes' | 'revision' | 'custom' | string;

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority?: Priority;
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
  duration?: string;
  lectureDate?: string;
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

export type ViewType = 'today' | 'upcoming' | 'chapter' | 'settings';
export type DisplayMode = 'list' | 'flow';

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
}
