import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Activity, FocusItem, Operation, Project, Task } from '../types';
import { arrayMove } from '@dnd-kit/sortable';

interface State {
  projects: Project[];
  currentProjectId: string | null;
  focusedItem: FocusItem | null;
  
  // Project actions
  addProject: (name: string, description: string) => string;
  setCurrentProject: (projectId: string) => void;
  editProject: (id: string, name: string, description: string) => void;
  deleteProject: (id: string) => void;
  
  // Activity actions
  addActivity: (projectId: string, name: string) => void;
  editActivity: (projectId: string, activityId: string, name: string) => void;
  editActivityOverview: (projectId: string, activityId: string, overview: string) => void;
  deleteActivity: (projectId: string, activityId: string) => void;
  reorderActivities: (projectId: string, oldIndex: number, newIndex: number) => void;
  
  // Task actions
  addTask: (projectId: string, activityId: string, name: string) => void;
  editTask: (projectId: string, activityId: string, taskId: string, name: string) => void;
  editTaskGoal: (projectId: string, activityId: string, taskId: string, goal: string) => void;
  deleteTask: (projectId: string, activityId: string, taskId: string) => void;
  reorderTasks: (projectId: string, activityId: string, oldIndex: number, newIndex: number) => void;
  
  // Operation actions
  addOperation: (projectId: string, activityId: string, taskId: string, name: string) => void;
  editOperation: (projectId: string, activityId: string, taskId: string, operationId: string, name: string) => void;
  editOperationDetail: (projectId: string, activityId: string, taskId: string, operationId: string, detail: string) => void;
  deleteOperation: (projectId: string, activityId: string, taskId: string, operationId: string) => void;
  reorderOperations: (projectId: string, activityId: string, taskId: string, oldIndex: number, newIndex: number) => void;
  
  // UI state
  toggleExpanded: (id: string, level: 'activity' | 'task') => void;
  setFocusedItem: (item: FocusItem | null) => void;
  deleteItem: (item: { id: string; level: 'activity' | 'task' | 'operation'; parentId?: string }) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      focusedItem: null,

      // Project actions
      addProject: (name, description) => {
        const newId = generateId();
        set((state) => ({
          projects: [...state.projects, {
            id: newId,
            name,
            description,
            activities: []
          }],
          currentProjectId: newId
        }));
        return newId;
      },

      setCurrentProject: (projectId) => set({ currentProjectId: projectId }),

      editProject: (id, name, description) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === id ? { ...project, name, description } : project
        )
      })),

      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProjectId: state.currentProjectId === id ? 
          (state.projects.length > 1 ? state.projects.find(p => p.id !== id)?.id ?? null : null) : 
          state.currentProjectId
      })),

      addActivity: (projectId, name) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: [
                  ...project.activities,
                  {
                    id: generateId(),
                    name,
                    overview: '',
                    expanded: true,
                    tasks: []
                  }
                ]
              }
            : project
        )
      })),

      editActivity: (projectId, activityId, name) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.map(activity =>
                  activity.id === activityId
                    ? { ...activity, name }
                    : activity
                )
              }
            : project
        )
      })),

      editActivityOverview: (projectId, activityId, overview) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.map(activity =>
                  activity.id === activityId
                    ? { ...activity, overview }
                    : activity
                )
              }
            : project
        )
      })),

      deleteActivity: (projectId, activityId) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.filter(a => a.id !== activityId)
              }
            : project
        )
      })),

      reorderActivities: (projectId, oldIndex, newIndex) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: arrayMove(project.activities, oldIndex, newIndex)
              }
            : project
        )
      })),

      addTask: (projectId, activityId, name) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.map(activity =>
                  activity.id === activityId
                    ? {
                        ...activity,
                        tasks: [
                          ...activity.tasks,
                          {
                            id: generateId(),
                            name,
                            goal: '',
                            expanded: true,
                            operations: []
                          }
                        ]
                      }
                    : activity
                )
              }
            : project
        )
      })),

      editTask: (projectId, activityId, taskId, name) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.map(activity =>
                  activity.id === activityId
                    ? {
                        ...activity,
                        tasks: activity.tasks.map(task =>
                          task.id === taskId
                            ? { ...task, name }
                            : task
                        )
                      }
                    : activity
                )
              }
            : project
        )
      })),

      editTaskGoal: (projectId, activityId, taskId, goal) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.map(activity =>
                  activity.id === activityId
                    ? {
                        ...activity,
                        tasks: activity.tasks.map(task =>
                          task.id === taskId
                            ? { ...task, goal }
                            : task
                        )
                      }
                    : activity
                )
              }
            : project
        )
      })),

      deleteTask: (projectId, activityId, taskId) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.map(activity =>
                  activity.id === activityId
                    ? {
                        ...activity,
                        tasks: activity.tasks.filter(t => t.id !== taskId)
                      }
                    : activity
                )
              }
            : project
        )
      })),

      reorderTasks: (projectId, activityId, oldIndex, newIndex) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.map(activity =>
                  activity.id === activityId
                    ? {
                        ...activity,
                        tasks: arrayMove(activity.tasks, oldIndex, newIndex)
                      }
                    : activity
                )
              }
            : project
        )
      })),

      addOperation: (projectId, activityId, taskId, name) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.map(activity =>
                  activity.id === activityId
                    ? {
                        ...activity,
                        tasks: activity.tasks.map(task =>
                          task.id === taskId
                            ? {
                                ...task,
                                operations: [
                                  ...task.operations,
                                  {
                                    id: generateId(),
                                    name,
                                    detail: ''
                                  }
                                ]
                              }
                            : task
                        )
                      }
                    : activity
                )
              }
            : project
        )
      })),

      editOperation: (projectId, activityId, taskId, operationId, name) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.map(activity =>
                  activity.id === activityId
                    ? {
                        ...activity,
                        tasks: activity.tasks.map(task =>
                          task.id === taskId
                            ? {
                                ...task,
                                operations: task.operations.map(operation =>
                                  operation.id === operationId
                                    ? { ...operation, name }
                                    : operation
                                )
                              }
                            : task
                        )
                      }
                    : activity
                )
              }
            : project
        )
      })),

      editOperationDetail: (projectId, activityId, taskId, operationId, detail) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.map(activity =>
                  activity.id === activityId
                    ? {
                        ...activity,
                        tasks: activity.tasks.map(task =>
                          task.id === taskId
                            ? {
                                ...task,
                                operations: task.operations.map(operation =>
                                  operation.id === operationId
                                    ? { ...operation, detail }
                                    : operation
                                )
                              }
                            : task
                        )
                      }
                    : activity
                )
              }
            : project
        )
      })),

      deleteOperation: (projectId, activityId, taskId, operationId) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.map(activity =>
                  activity.id === activityId
                    ? {
                        ...activity,
                        tasks: activity.tasks.map(task =>
                          task.id === taskId
                            ? {
                                ...task,
                                operations: task.operations.filter(o => o.id !== operationId)
                              }
                            : task
                        )
                      }
                    : activity
                )
              }
            : project
        )
      })),

      reorderOperations: (projectId, activityId, taskId, oldIndex, newIndex) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.map(activity =>
                  activity.id === activityId
                    ? {
                        ...activity,
                        tasks: activity.tasks.map(task =>
                          task.id === taskId
                            ? {
                                ...task,
                                operations: arrayMove(task.operations, oldIndex, newIndex)
                              }
                            : task
                        )
                      }
                    : activity
                )
              }
            : project
        )
      })),

      toggleExpanded: (id, level) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === state.currentProjectId
            ? {
                ...project,
                activities: project.activities.map(activity =>
                  level === 'activity' && activity.id === id
                    ? { ...activity, expanded: !activity.expanded }
                    : level === 'task'
                      ? {
                          ...activity,
                          tasks: activity.tasks.map(task =>
                            task.id === id
                              ? { ...task, expanded: !task.expanded }
                              : task
                          )
                        }
                      : activity
                )
              }
            : project
        )
      })),

      setFocusedItem: (item) => set({ focusedItem: item }),

      deleteItem: (item) => {
        const state = get();
        const currentProject = state.projects.find(p => p.id === state.currentProjectId);
        if (!currentProject) return;

        switch (item.level) {
          case 'activity':
            get().deleteActivity(currentProject.id, item.id);
            break;
          case 'task':
            const activity = currentProject.activities.find(a => a.tasks.some(t => t.id === item.id));
            if (activity) {
              get().deleteTask(currentProject.id, activity.id, item.id);
            }
            break;
          case 'operation':
            if (item.parentId) {
              const activity = currentProject.activities.find(a => 
                a.tasks.some(t => t.id === item.parentId)
              );
              if (activity) {
                const task = activity.tasks.find(t => t.id === item.parentId);
                if (task) {
                  get().deleteOperation(currentProject.id, activity.id, task.id, item.id);
                }
              }
            }
            break;
        }
      }
    }),
    {
      name: 'activity-storage',
      partialize: (state) => ({ 
        projects: state.projects,
        currentProjectId: state.currentProjectId 
      }),
    }
  )
);