import { Hono } from 'hono';
import { db } from '../db/index';
import { tasks, operations } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// GET /api/tasks/:id - Get single task with operations
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const task = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .get();

    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const taskOperations = await db
      .select()
      .from(operations)
      .where(eq(operations.taskId, id));

    return c.json({
      ...task,
      operations: taskOperations,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return c.json({ error: 'Failed to fetch task' }, 500);
  }
});

// PUT /api/tasks/:id - Update task
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const updated = {
      name: body.name ?? existing.name,
      goal: body.goal ?? existing.goal,
      order: body.order ?? existing.order,
    };

    await db.update(tasks).set(updated).where(eq(tasks.id, id));

    return c.json({ ...existing, ...updated });
  } catch (error) {
    console.error('Error updating task:', error);
    return c.json({ error: 'Failed to update task' }, 500);
  }
});

// DELETE /api/tasks/:id - Delete task
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const existing = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Task not found' }, 404);
    }

    await db.delete(tasks).where(eq(tasks.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return c.json({ error: 'Failed to delete task' }, 500);
  }
});

// GET /api/tasks/:taskId/operations - List operations
app.get('/:taskId/operations', async (c) => {
  try {
    const taskId = c.req.param('taskId');

    const taskOperations = await db
      .select()
      .from(operations)
      .where(eq(operations.taskId, taskId));

    return c.json(taskOperations);
  } catch (error) {
    console.error('Error fetching operations:', error);
    return c.json({ error: 'Failed to fetch operations' }, 500);
  }
});

// POST /api/tasks/:taskId/operations - Create operation
app.post('/:taskId/operations', async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const body = await c.req.json();

    const newOperation = {
      id: `op-${Date.now()}`,
      taskId,
      name: body.name,
      details: body.details || null,
      toolsUsed: body.toolsUsed || [],
      order: body.order || 0,
    };

    await db.insert(operations).values(newOperation);
    return c.json(newOperation, 201);
  } catch (error) {
    console.error('Error creating operation:', error);
    return c.json({ error: 'Failed to create operation' }, 500);
  }
});

export default app;
