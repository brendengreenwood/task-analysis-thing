export interface Operation {
  id: string;
  name: string;
  detail: string;
}

export interface Task {
  id: string;
  name: string;
  goal: string;
  expanded: boolean;
  operations: Operation[];
}

export interface Activity {
  id: string;
  name: string;
  overview: string;
  expanded: boolean;
  personaIds?: string[];
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  activities: Activity[];
}

export type FocusLevel = 'activity' | 'task' | 'operation';
export type FocusItem = {
  id: string;
  level: FocusLevel;
  parentId?: string;
};