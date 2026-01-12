import { create } from 'zustand';
import { Activity, FocusItem, Operation, Project, Task } from '../types';
import { arrayMove } from '@dnd-kit/sortable';
import { api } from '../lib/api';

interface State {
  projects: Project[];
  currentProjectId: string | null;
  focusedItem: FocusItem | null;
  loading: boolean;
  initialized: boolean;

  // Initialization
  init: () => Promise<void>;

  // Project actions
  addProject: (name: string, description: string) => Promise<string>;
  setCurrentProject: (projectId: string) => void;
  editProject: (id: string, name: string, description: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;

  // Activity actions
  addActivity: (projectId: string, name: string) => Promise<void>;
  editActivity: (projectId: string, activityId: string, name: string) => Promise<void>;
  editActivityOverview: (projectId: string, activityId: string, overview: string) => Promise<void>;
  deleteActivity: (projectId: string, activityId: string) => Promise<void>;
  reorderActivities: (projectId: string, oldIndex: number, newIndex: number) => void;

  // Task actions
  addTask: (projectId: string, activityId: string, name: string) => Promise<void>;
  editTask: (projectId: string, activityId: string, taskId: string, name: string) => Promise<void>;
  editTaskGoal: (projectId: string, activityId: string, taskId: string, goal: string) => Promise<void>;
  deleteTask: (projectId: string, activityId: string, taskId: string) => Promise<void>;
  reorderTasks: (projectId: string, activityId: string, oldIndex: number, newIndex: number) => void;

  // Operation actions
  addOperation: (projectId: string, activityId: string, taskId: string, name: string) => Promise<void>;
  editOperation: (projectId: string, activityId: string, taskId: string, operationId: string, name: string) => Promise<void>;
  editOperationDetail: (projectId: string, activityId: string, taskId: string, operationId: string, detail: string) => Promise<void>;
  deleteOperation: (projectId: string, activityId: string, taskId: string, operationId: string) => Promise<void>;
  reorderOperations: (projectId: string, activityId: string, taskId: string, oldIndex: number, newIndex: number) => void;

  // UI state
  toggleExpanded: (id: string, level: 'activity' | 'task') => void;
  setFocusedItem: (item: FocusItem | null) => void;
  deleteItem: (item: { id: string; level: 'activity' | 'task' | 'operation'; parentId?: string }) => void;

  // Bulk expand/collapse
  expandAllActivities: () => void;
  collapseAllActivities: () => void;
  expandAllTasks: (activityId?: string) => void;
  collapseAllTasks: (activityId?: string) => void;
}

// Helper to transform API data to local format
const transformProjectData = (apiProject: any): Project => {
  return {
    id: apiProject.id,
    name: apiProject.name,
    description: apiProject.description || '',
    activities: (apiProject.activities || []).map((activity: any) => ({
      id: activity.id,
      name: activity.name,
      overview: activity.overview || '',
      expanded: false,
      personaIds: activity.personaIds || [],
      tasks: (activity.tasks || []).map((task: any) => ({
        id: task.id,
        name: task.name,
        goal: task.goal || '',
        expanded: false,
        operations: (task.operations || []).map((operation: any) => ({
          id: operation.id,
          name: operation.name,
          detail: operation.details || '',
        })),
      })),
    })),
  };
};

export const useStore = create<State>((set, get) => ({
  projects: [],
  currentProjectId: null,
  focusedItem: null,
  loading: false,
  initialized: false,

  // Initialization - load projects from API
  init: async () => {
    if (get().initialized) return;

    set({ loading: true });
    try {
      const projects = await api.getProjects();

      // Load full data for each project
      const fullProjects = await Promise.all(
        projects.map(async (p: any) => {
          const fullProject = await api.getProject(p.id);
          return transformProjectData(fullProject);
        })
      );

      set({
        projects: fullProjects,
        currentProjectId: fullProjects[0]?.id || null,
        initialized: true,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load projects:', error);
      set({ loading: false, initialized: true });
    }
  },

  loadProject: async (projectId: string) => {
    set({ loading: true });
    try {
      const fullProject = await api.getProject(projectId);
      const transformedProject = transformProjectData(fullProject);

      set((state) => ({
        projects: state.projects.map(p =>
          p.id === projectId ? transformedProject : p
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load project:', error);
      set({ loading: false });
    }
  },

  // Project actions
  addProject: async (name, description) => {
    try {
      const newProject = await api.createProject({ name, description });
      const transformedProject = transformProjectData(newProject);

      set((state) => ({
        projects: [...state.projects, transformedProject],
        currentProjectId: newProject.id,
      }));

      return newProject.id;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  },

  setCurrentProject: (projectId) => {
    set({ currentProjectId: projectId });
    get().loadProject(projectId);
  },

  editProject: async (id, name, description) => {
    try {
      await api.updateProject(id, { name, description });

      set((state) => ({
        projects: state.projects.map(project =>
          project.id === id ? { ...project, name, description } : project
        )
      }));
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      await api.deleteProject(id);

      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProjectId: state.currentProjectId === id ?
          (state.projects.length > 1 ? state.projects.find(p => p.id !== id)?.id ?? null : null) :
          state.currentProjectId
      }));
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  },

  addActivity: async (projectId, name) => {
    try {
      const newActivity = await api.createActivity(projectId, { name });

      set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: [
                  ...project.activities,
                  {
                    id: newActivity.id,
                    name: newActivity.name,
                    overview: newActivity.overview || '',
                    expanded: false,
                    tasks: []
                  }
                ]
              }
            : project
        )
      }));
    } catch (error) {
      console.error('Failed to create activity:', error);
      throw error;
    }
  },

  editActivity: async (projectId, activityId, name) => {
    try {
      await api.updateActivity(activityId, { name });

      set((state) => ({
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
      }));
    } catch (error) {
      console.error('Failed to update activity:', error);
      throw error;
    }
  },

  editActivityOverview: async (projectId, activityId, overview) => {
    try {
      await api.updateActivity(activityId, { overview });

      set((state) => ({
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
      }));
    } catch (error) {
      console.error('Failed to update activity overview:', error);
      throw error;
    }
  },

  deleteActivity: async (projectId, activityId) => {
    try {
      await api.deleteActivity(activityId);

      set((state) => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                activities: project.activities.filter(a => a.id !== activityId)
              }
            : project
        )
      }));
    } catch (error) {
      console.error('Failed to delete activity:', error);
      throw error;
    }
  },

  reorderActivities: (projectId, oldIndex, newIndex) => {
    set((state) => ({
      projects: state.projects.map(project =>
        project.id === projectId
          ? {
              ...project,
              activities: arrayMove(project.activities, oldIndex, newIndex)
            }
          : project
      )
    }));
    // TODO: Persist order to API
  },

  addTask: async (projectId, activityId, name) => {
    try {
      const newTask = await api.createTask(activityId, { name });

      set((state) => ({
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
                            id: newTask.id,
                            name: newTask.name,
                            goal: newTask.goal || '',
                            expanded: false,
                            operations: []
                          }
                        ]
                      }
                    : activity
                )
              }
            : project
        )
      }));
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  },

  editTask: async (projectId, activityId, taskId, name) => {
    try {
      await api.updateTask(taskId, { name });

      set((state) => ({
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
      }));
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  },

  editTaskGoal: async (projectId, activityId, taskId, goal) => {
    try {
      await api.updateTask(taskId, { goal });

      set((state) => ({
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
      }));
    } catch (error) {
      console.error('Failed to update task goal:', error);
      throw error;
    }
  },

  deleteTask: async (projectId, activityId, taskId) => {
    try {
      await api.deleteTask(taskId);

      set((state) => ({
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
      }));
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  },

  reorderTasks: (projectId, activityId, oldIndex, newIndex) => {
    set((state) => ({
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
    }));
    // TODO: Persist order to API
  },

  addOperation: async (projectId, activityId, taskId, name) => {
    try {
      const newOperation = await api.createOperation(taskId, { name });

      set((state) => ({
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
                                    id: newOperation.id,
                                    name: newOperation.name,
                                    detail: newOperation.details || ''
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
      }));
    } catch (error) {
      console.error('Failed to create operation:', error);
      throw error;
    }
  },

  editOperation: async (projectId, activityId, taskId, operationId, name) => {
    try {
      await api.updateOperation(operationId, { name });

      set((state) => ({
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
      }));
    } catch (error) {
      console.error('Failed to update operation:', error);
      throw error;
    }
  },

  editOperationDetail: async (projectId, activityId, taskId, operationId, detail) => {
    try {
      await api.updateOperation(operationId, { details: detail });

      set((state) => ({
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
      }));
    } catch (error) {
      console.error('Failed to update operation detail:', error);
      throw error;
    }
  },

  deleteOperation: async (projectId, activityId, taskId, operationId) => {
    try {
      await api.deleteOperation(operationId);

      set((state) => ({
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
      }));
    } catch (error) {
      console.error('Failed to delete operation:', error);
      throw error;
    }
  },

  reorderOperations: (projectId, activityId, taskId, oldIndex, newIndex) => {
    set((state) => ({
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
    }));
    // TODO: Persist order to API
  },

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
  },

  expandAllActivities: () => set((state) => ({
    projects: state.projects.map(project =>
      project.id === state.currentProjectId
        ? {
            ...project,
            activities: project.activities.map(activity => ({
              ...activity,
              expanded: true
            }))
          }
        : project
    )
  })),

  collapseAllActivities: () => set((state) => ({
    projects: state.projects.map(project =>
      project.id === state.currentProjectId
        ? {
            ...project,
            activities: project.activities.map(activity => ({
              ...activity,
              expanded: false
            }))
          }
        : project
    )
  })),

  expandAllTasks: (activityId) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === state.currentProjectId
        ? {
            ...project,
            activities: project.activities.map(activity =>
              !activityId || activity.id === activityId
                ? {
                    ...activity,
                    tasks: activity.tasks.map(task => ({
                      ...task,
                      expanded: true
                    }))
                  }
                : activity
            )
          }
        : project
    )
  })),

  collapseAllTasks: (activityId) => set((state) => ({
    projects: state.projects.map(project =>
      project.id === state.currentProjectId
        ? {
            ...project,
            activities: project.activities.map(activity =>
              !activityId || activity.id === activityId
                ? {
                    ...activity,
                    tasks: activity.tasks.map(task => ({
                      ...task,
                      expanded: false
                    }))
                  }
                : activity
            )
          }
        : project
    )
  }))
}));
