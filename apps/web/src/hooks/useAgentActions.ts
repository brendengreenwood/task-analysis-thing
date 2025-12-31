import { useCallback } from 'react';
import { useStore } from '../store/useStore';

// Types for agent action payloads
interface AddActivityPayload {
  name: string;
  overview: string;
}

interface AddTaskPayload {
  activityId: string;
  name: string;
  goal: string;
}

interface AddOperationPayload {
  activityId: string;
  taskId: string;
  name: string;
  detail: string;
}

interface EditActivityPayload {
  activityId: string;
  name?: string;
  overview?: string;
}

interface EditTaskPayload {
  activityId: string;
  taskId: string;
  name?: string;
  goal?: string;
}

interface EditOperationPayload {
  activityId: string;
  taskId: string;
  operationId: string;
  name?: string;
  detail?: string;
}

interface DeleteActivityPayload {
  activityId: string;
}

interface DeleteTaskPayload {
  activityId: string;
  taskId: string;
}

interface DeleteOperationPayload {
  activityId: string;
  taskId: string;
  operationId: string;
}

interface BulkAddItem {
  type: 'activity' | 'task' | 'operation';
  name: string;
  overview?: string;
  goal?: string;
  detail?: string;
  activityId?: string;
  taskId?: string;
  tasks?: Array<{
    name: string;
    goal?: string;
    operations?: Array<{
      name: string;
      detail?: string;
    }>;
  }>;
  operations?: Array<{
    name: string;
    detail?: string;
  }>;
}

interface BulkAddPayload {
  items: BulkAddItem[];
}

type AgentAction =
  | { action: 'addActivity'; payload: AddActivityPayload }
  | { action: 'addTask'; payload: AddTaskPayload }
  | { action: 'addOperation'; payload: AddOperationPayload }
  | { action: 'editActivity'; payload: EditActivityPayload }
  | { action: 'editTask'; payload: EditTaskPayload }
  | { action: 'editOperation'; payload: EditOperationPayload }
  | { action: 'deleteActivity'; payload: DeleteActivityPayload }
  | { action: 'deleteTask'; payload: DeleteTaskPayload }
  | { action: 'deleteOperation'; payload: DeleteOperationPayload }
  | { action: 'bulkAdd'; payload: BulkAddPayload }
  | { action: 'getContext'; context: unknown };

export function useAgentActions() {
  const {
    currentProjectId,
    projects,
    addActivity,
    addTask,
    addOperation,
    editActivity,
    editActivityOverview,
    editTask,
    editTaskGoal,
    editOperation,
    editOperationDetail,
    deleteActivity,
    deleteTask,
    deleteOperation,
  } = useStore();

  const getCurrentProject = useCallback(() => {
    if (!currentProjectId) return null;
    return projects.find((p) => p.id === currentProjectId) || null;
  }, [currentProjectId, projects]);

  const getProjectContext = useCallback(() => {
    const project = getCurrentProject();
    if (!project) return null;

    return {
      projectId: project.id,
      projectName: project.name,
      activities: project.activities.map((activity) => ({
        id: activity.id,
        name: activity.name,
        overview: activity.overview,
        tasks: activity.tasks.map((task) => ({
          id: task.id,
          name: task.name,
          goal: task.goal,
          operations: task.operations.map((op) => ({
            id: op.id,
            name: op.name,
            detail: op.detail,
          })),
        })),
      })),
    };
  }, [getCurrentProject]);

  const dispatchAction = useCallback(
    (actionData: AgentAction): boolean => {
      const project = getCurrentProject();
      if (!project && actionData.action !== 'getContext') {
        console.warn('No current project selected');
        return false;
      }

      const projectId = project?.id || '';

      switch (actionData.action) {
        case 'getContext':
          // This is just for the agent to understand context, no store action needed
          return true;

        case 'addActivity': {
          const { name, overview } = actionData.payload;
          addActivity(projectId, name);
          // Find the newly added activity and update its overview if provided
          if (overview) {
            const updatedProject = projects.find((p) => p.id === projectId);
            const newActivity = updatedProject?.activities[updatedProject.activities.length - 1];
            if (newActivity) {
              editActivityOverview(projectId, newActivity.id, overview);
            }
          }
          return true;
        }

        case 'addTask': {
          const { activityId, name, goal } = actionData.payload;
          addTask(projectId, activityId, name);
          // Find the newly added task and update its goal if provided
          if (goal) {
            const updatedProject = projects.find((p) => p.id === projectId);
            const activity = updatedProject?.activities.find((a) => a.id === activityId);
            const newTask = activity?.tasks[activity.tasks.length - 1];
            if (newTask) {
              editTaskGoal(projectId, activityId, newTask.id, goal);
            }
          }
          return true;
        }

        case 'addOperation': {
          const { activityId, taskId, name, detail } = actionData.payload;
          addOperation(projectId, activityId, taskId, name);
          // Find the newly added operation and update its detail if provided
          if (detail) {
            const updatedProject = projects.find((p) => p.id === projectId);
            const activity = updatedProject?.activities.find((a) => a.id === activityId);
            const task = activity?.tasks.find((t) => t.id === taskId);
            const newOp = task?.operations[task.operations.length - 1];
            if (newOp) {
              editOperationDetail(projectId, activityId, taskId, newOp.id, detail);
            }
          }
          return true;
        }

        case 'editActivity': {
          const { activityId, name, overview } = actionData.payload;
          if (name) {
            editActivity(projectId, activityId, name);
          }
          if (overview !== undefined) {
            editActivityOverview(projectId, activityId, overview);
          }
          return true;
        }

        case 'editTask': {
          const { activityId, taskId, name, goal } = actionData.payload;
          if (name) {
            editTask(projectId, activityId, taskId, name);
          }
          if (goal !== undefined) {
            editTaskGoal(projectId, activityId, taskId, goal);
          }
          return true;
        }

        case 'editOperation': {
          const { activityId, taskId, operationId, name, detail } = actionData.payload;
          if (name) {
            editOperation(projectId, activityId, taskId, operationId, name);
          }
          if (detail !== undefined) {
            editOperationDetail(projectId, activityId, taskId, operationId, detail);
          }
          return true;
        }

        case 'deleteActivity': {
          const { activityId } = actionData.payload;
          deleteActivity(projectId, activityId);
          return true;
        }

        case 'deleteTask': {
          const { activityId, taskId } = actionData.payload;
          deleteTask(projectId, activityId, taskId);
          return true;
        }

        case 'deleteOperation': {
          const { activityId, taskId, operationId } = actionData.payload;
          deleteOperation(projectId, activityId, taskId, operationId);
          return true;
        }

        case 'bulkAdd': {
          const { items } = actionData.payload;

          // Helper to get fresh state after mutations
          const getState = () => useStore.getState();

          // Track created IDs for nested items
          const createdActivityIds: Map<number, string> = new Map();
          const createdTaskIds: Map<string, string> = new Map();

          items.forEach((item, index) => {
            if (item.type === 'activity') {
              addActivity(projectId, item.name);

              // Get the newly created activity from fresh state
              const updatedProject = getState().projects.find((p) => p.id === projectId);
              const newActivity = updatedProject?.activities[updatedProject.activities.length - 1];

              if (newActivity) {
                createdActivityIds.set(index, newActivity.id);

                if (item.overview) {
                  editActivityOverview(projectId, newActivity.id, item.overview);
                }

                // Add nested tasks
                if (item.tasks) {
                  item.tasks.forEach((taskData, taskIndex) => {
                    addTask(projectId, newActivity.id, taskData.name);

                    const refreshedProject = getState().projects.find((p) => p.id === projectId);
                    const refreshedActivity = refreshedProject?.activities.find(
                      (a) => a.id === newActivity.id
                    );
                    const newTask = refreshedActivity?.tasks[refreshedActivity.tasks.length - 1];

                    if (newTask) {
                      createdTaskIds.set(`${index}-${taskIndex}`, newTask.id);

                      if (taskData.goal) {
                        editTaskGoal(projectId, newActivity.id, newTask.id, taskData.goal);
                      }

                      // Add nested operations
                      if (taskData.operations) {
                        taskData.operations.forEach((opData, opIndex) => {
                          const beforeTask = getState().projects
                            .find((p) => p.id === projectId)
                            ?.activities.find((a) => a.id === newActivity.id)
                            ?.tasks.find((t) => t.id === newTask.id);
                          const opCountBefore = beforeTask?.operations.length || 0;

                          addOperation(projectId, newActivity.id, newTask.id, opData.name);

                          if (opData.detail) {
                            const refProject = getState().projects.find((p) => p.id === projectId);
                            const refActivity = refProject?.activities.find(
                              (a) => a.id === newActivity.id
                            );
                            const refTask = refActivity?.tasks.find((t) => t.id === newTask.id);
                            const newOp = refTask?.operations[opCountBefore];
                            console.log(`[BULK-ADD activity] Op ${opIndex}: before=${opCountBefore}, after=${refTask?.operations.length}, newOp=`, newOp?.id);
                            if (newOp) {
                              editOperationDetail(
                                projectId,
                                newActivity.id,
                                newTask.id,
                                newOp.id,
                                opData.detail
                              );
                            }
                          }
                        });
                      }
                    }
                  });
                }
              }
            } else if (item.type === 'task' && item.activityId) {
              addTask(projectId, item.activityId, item.name);

              const updatedProject = getState().projects.find((p) => p.id === projectId);
              const activity = updatedProject?.activities.find((a) => a.id === item.activityId);
              const newTask = activity?.tasks[activity.tasks.length - 1];

              if (newTask) {
                if (item.goal) {
                  editTaskGoal(projectId, item.activityId, newTask.id, item.goal);
                }

                // Add nested operations
                if (item.operations) {
                  item.operations.forEach((opData, opIndex) => {
                    const beforeState = getState();
                    const beforeTask = beforeState.projects
                      .find((p) => p.id === projectId)
                      ?.activities.find((a) => a.id === item.activityId)
                      ?.tasks.find((t) => t.id === newTask.id);
                    const opCountBefore = beforeTask?.operations.length || 0;

                    addOperation(projectId, item.activityId!, newTask.id, opData.name);

                    if (opData.detail) {
                      const refProject = getState().projects.find((p) => p.id === projectId);
                      const refActivity = refProject?.activities.find(
                        (a) => a.id === item.activityId
                      );
                      const refTask = refActivity?.tasks.find((t) => t.id === newTask.id);

                      // Find the operation we just added (should be the one at opCountBefore index)
                      const newOp = refTask?.operations[opCountBefore];
                      console.log(`[BULK-ADD] Op ${opIndex}: before=${opCountBefore}, after=${refTask?.operations.length}, newOp=`, newOp?.id, 'detail=', opData.detail);

                      if (newOp) {
                        editOperationDetail(
                          projectId,
                          item.activityId!,
                          newTask.id,
                          newOp.id,
                          opData.detail
                        );
                      }
                    }
                  });
                }
              }
            } else if (item.type === 'operation' && item.activityId && item.taskId) {
              const beforeTask = getState().projects
                .find((p) => p.id === projectId)
                ?.activities.find((a) => a.id === item.activityId)
                ?.tasks.find((t) => t.id === item.taskId);
              const opCountBefore = beforeTask?.operations.length || 0;

              addOperation(projectId, item.activityId, item.taskId, item.name);

              if (item.detail) {
                const updatedProject = getState().projects.find((p) => p.id === projectId);
                const activity = updatedProject?.activities.find((a) => a.id === item.activityId);
                const task = activity?.tasks.find((t) => t.id === item.taskId);
                const newOp = task?.operations[opCountBefore];
                if (newOp) {
                  editOperationDetail(
                    projectId,
                    item.activityId,
                    item.taskId,
                    newOp.id,
                    item.detail
                  );
                }
              }
            }
          });

          return true;
        }

        default:
          console.warn('Unknown action:', actionData);
          return false;
      }
    },
    [
      getCurrentProject,
      projects,
      addActivity,
      addTask,
      addOperation,
      editActivity,
      editActivityOverview,
      editTask,
      editTaskGoal,
      editOperation,
      editOperationDetail,
      deleteActivity,
      deleteTask,
      deleteOperation,
    ]
  );

  return {
    dispatchAction,
    getProjectContext,
    getCurrentProject,
  };
}
