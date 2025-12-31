import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Schema for project context passed from frontend
const projectContextSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  activities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    overview: z.string(),
    tasks: z.array(z.object({
      id: z.string(),
      name: z.string(),
      goal: z.string(),
      operations: z.array(z.object({
        id: z.string(),
        name: z.string(),
        detail: z.string(),
      })),
    })),
  })),
});

// Tool to get current project context (passed in message)
export const getProjectContextTool = createTool({
  id: 'get-project-context',
  description: 'Get the current project context including all activities, tasks, and operations. Always call this first to understand what already exists.',
  inputSchema: z.object({
    context: projectContextSchema.optional().describe('Current project context passed from frontend'),
  }),
  outputSchema: z.object({
    action: z.literal('getContext'),
    context: projectContextSchema.nullable(),
  }),
  execute: async ({ context }) => {
    console.log('[TOOL] get-project-context called');
    console.log('[TOOL] Context:', JSON.stringify(context, null, 2));
    return {
      action: 'getContext' as const,
      context: context || null,
    };
  },
});

// Add Activity Tool
export const addActivityTool = createTool({
  id: 'add-activity',
  description: 'Add a new activity to the current project. Activities are high-level work areas like "User Authentication", "Database Setup", etc.',
  inputSchema: z.object({
    name: z.string().describe('Name of the activity'),
    overview: z.string().optional().describe('Brief description of what this activity encompasses'),
  }),
  outputSchema: z.object({
    action: z.literal('addActivity'),
    payload: z.object({
      name: z.string(),
      overview: z.string(),
    }),
  }),
  execute: async ({ name, overview }) => {
    console.log('[TOOL] add-activity:', { name, overview });
    return {
      action: 'addActivity' as const,
      payload: {
        name,
        overview: overview || '',
      },
    };
  },
});

// Add Task Tool
export const addTaskTool = createTool({
  id: 'add-task',
  description: 'Add a new task to an existing activity. Tasks are specific objectives like "Implement login form", "Write unit tests", etc.',
  inputSchema: z.object({
    activityId: z.string().describe('ID of the activity to add the task to'),
    name: z.string().describe('Name of the task'),
    goal: z.string().optional().describe('The specific goal or outcome of this task'),
  }),
  outputSchema: z.object({
    action: z.literal('addTask'),
    payload: z.object({
      activityId: z.string(),
      name: z.string(),
      goal: z.string(),
    }),
  }),
  execute: async ({ activityId, name, goal }) => {
    console.log('[TOOL] add-task:', { activityId, name, goal });
    return {
      action: 'addTask' as const,
      payload: {
        activityId,
        name,
        goal: goal || '',
      },
    };
  },
});

// Add Operation Tool
export const addOperationTool = createTool({
  id: 'add-operation',
  description: 'Add a new operation to an existing task. Operations are granular steps like "Add email validation", "Create database migration", etc.',
  inputSchema: z.object({
    activityId: z.string().describe('ID of the parent activity'),
    taskId: z.string().describe('ID of the task to add the operation to'),
    name: z.string().describe('Name of the operation'),
    detail: z.string().optional().describe('Detailed description of the operation'),
  }),
  outputSchema: z.object({
    action: z.literal('addOperation'),
    payload: z.object({
      activityId: z.string(),
      taskId: z.string(),
      name: z.string(),
      detail: z.string(),
    }),
  }),
  execute: async ({ activityId, taskId, name, detail }) => {
    console.log('[TOOL] add-operation:', { activityId, taskId, name, detail });
    return {
      action: 'addOperation' as const,
      payload: {
        activityId,
        taskId,
        name,
        detail: detail || '',
      },
    };
  },
});

// Edit Activity Tool
export const editActivityTool = createTool({
  id: 'edit-activity',
  description: 'Edit an existing activity name or overview',
  inputSchema: z.object({
    activityId: z.string().describe('ID of the activity to edit'),
    name: z.string().optional().describe('New name for the activity'),
    overview: z.string().optional().describe('New overview for the activity'),
  }),
  outputSchema: z.object({
    action: z.literal('editActivity'),
    payload: z.object({
      activityId: z.string(),
      name: z.string().optional(),
      overview: z.string().optional(),
    }),
  }),
  execute: async ({ activityId, name, overview }) => {
    console.log('[TOOL] edit-activity:', { activityId, name, overview });
    return {
      action: 'editActivity' as const,
      payload: {
        activityId,
        name,
        overview,
      },
    };
  },
});

// Edit Task Tool
export const editTaskTool = createTool({
  id: 'edit-task',
  description: 'Edit an existing task name or goal',
  inputSchema: z.object({
    activityId: z.string().describe('ID of the parent activity'),
    taskId: z.string().describe('ID of the task to edit'),
    name: z.string().optional().describe('New name for the task'),
    goal: z.string().optional().describe('New goal for the task'),
  }),
  outputSchema: z.object({
    action: z.literal('editTask'),
    payload: z.object({
      activityId: z.string(),
      taskId: z.string(),
      name: z.string().optional(),
      goal: z.string().optional(),
    }),
  }),
  execute: async ({ activityId, taskId, name, goal }) => {
    console.log('[TOOL] edit-task:', { activityId, taskId, name, goal });
    return {
      action: 'editTask' as const,
      payload: {
        activityId,
        taskId,
        name,
        goal,
      },
    };
  },
});

// Edit Operation Tool
export const editOperationTool = createTool({
  id: 'edit-operation',
  description: 'Edit an existing operation name or detail',
  inputSchema: z.object({
    activityId: z.string().describe('ID of the parent activity'),
    taskId: z.string().describe('ID of the parent task'),
    operationId: z.string().describe('ID of the operation to edit'),
    name: z.string().optional().describe('New name for the operation'),
    detail: z.string().optional().describe('New detail for the operation'),
  }),
  outputSchema: z.object({
    action: z.literal('editOperation'),
    payload: z.object({
      activityId: z.string(),
      taskId: z.string(),
      operationId: z.string(),
      name: z.string().optional(),
      detail: z.string().optional(),
    }),
  }),
  execute: async ({ activityId, taskId, operationId, name, detail }) => {
    console.log('[TOOL] edit-operation:', { activityId, taskId, operationId, name, detail });
    return {
      action: 'editOperation' as const,
      payload: {
        activityId,
        taskId,
        operationId,
        name,
        detail,
      },
    };
  },
});

// Delete Activity Tool
export const deleteActivityTool = createTool({
  id: 'delete-activity',
  description: 'Delete an activity and all its tasks and operations',
  inputSchema: z.object({
    activityId: z.string().describe('ID of the activity to delete'),
  }),
  outputSchema: z.object({
    action: z.literal('deleteActivity'),
    payload: z.object({
      activityId: z.string(),
    }),
  }),
  execute: async ({ activityId }) => {
    console.log('[TOOL] delete-activity:', { activityId });
    return {
      action: 'deleteActivity' as const,
      payload: { activityId },
    };
  },
});

// Delete Task Tool
export const deleteTaskTool = createTool({
  id: 'delete-task',
  description: 'Delete a task and all its operations',
  inputSchema: z.object({
    activityId: z.string().describe('ID of the parent activity'),
    taskId: z.string().describe('ID of the task to delete'),
  }),
  outputSchema: z.object({
    action: z.literal('deleteTask'),
    payload: z.object({
      activityId: z.string(),
      taskId: z.string(),
    }),
  }),
  execute: async ({ activityId, taskId }) => {
    console.log('[TOOL] delete-task:', { activityId, taskId });
    return {
      action: 'deleteTask' as const,
      payload: { activityId, taskId },
    };
  },
});

// Delete Operation Tool
export const deleteOperationTool = createTool({
  id: 'delete-operation',
  description: 'Delete an operation',
  inputSchema: z.object({
    activityId: z.string().describe('ID of the parent activity'),
    taskId: z.string().describe('ID of the parent task'),
    operationId: z.string().describe('ID of the operation to delete'),
  }),
  outputSchema: z.object({
    action: z.literal('deleteOperation'),
    payload: z.object({
      activityId: z.string(),
      taskId: z.string(),
      operationId: z.string(),
    }),
  }),
  execute: async ({ activityId, taskId, operationId }) => {
    console.log('[TOOL] delete-operation:', { activityId, taskId, operationId });
    return {
      action: 'deleteOperation' as const,
      payload: { activityId, taskId, operationId },
    };
  },
});

// Bulk add tool for creating multiple items at once
export const bulkAddTool = createTool({
  id: 'bulk-add',
  description: 'Add multiple activities, tasks, and operations at once. Use this when the user describes a complex workflow that involves multiple items.',
  inputSchema: z.object({
    items: z.array(z.discriminatedUnion('type', [
      z.object({
        type: z.literal('activity'),
        name: z.string(),
        overview: z.string().optional(),
        tasks: z.array(z.object({
          name: z.string(),
          goal: z.string().optional(),
          operations: z.array(z.object({
            name: z.string(),
            detail: z.string().optional(),
          })).optional(),
        })).optional(),
      }),
      z.object({
        type: z.literal('task'),
        activityId: z.string(),
        name: z.string(),
        goal: z.string().optional(),
        operations: z.array(z.object({
          name: z.string(),
          detail: z.string().optional(),
        })).optional(),
      }),
      z.object({
        type: z.literal('operation'),
        activityId: z.string(),
        taskId: z.string(),
        name: z.string(),
        detail: z.string().optional(),
      }),
    ])),
  }),
  outputSchema: z.object({
    action: z.literal('bulkAdd'),
    payload: z.object({
      items: z.array(z.any()),
    }),
  }),
  execute: async ({ items }) => {
    console.log('[TOOL] bulk-add:', JSON.stringify(items, null, 2));
    return {
      action: 'bulkAdd' as const,
      payload: { items },
    };
  },
});

export const tools = {
  getProjectContextTool,
  addActivityTool,
  addTaskTool,
  addOperationTool,
  editActivityTool,
  editTaskTool,
  editOperationTool,
  deleteActivityTool,
  deleteTaskTool,
  deleteOperationTool,
  bulkAddTool,
};
