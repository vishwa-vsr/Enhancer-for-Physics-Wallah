export type Priority = 'low' | 'medium' | 'high';

export interface TagItem {
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: Priority;
  tags: string[];
  subjectId: string;
  chapterId: string;
  createdAt: number;
}

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
  createdAt: number;
}

export interface Subject {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export type ViewType = 'today' | 'upcoming' | 'chapter' | 'settings';

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
}
