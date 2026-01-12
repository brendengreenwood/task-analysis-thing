import { Hono } from 'hono';
import { db } from '../db/index';
import { operations } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// GET /api/tasks/:taskId/operations - List operations
app.get('/tasks/:taskId/operations', async (c) => {
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
app.post('/tasks/:taskId/operations', async (c) => {
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

// GET /api/operations/:id - Get single operation
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const operation = await db
      .select()
      .from(operations)
      .where(eq(operations.id, id))
      .get();

    if (!operation) {
      return c.json({ error: 'Operation not found' }, 404);
    }

    return c.json(operation);
  } catch (error) {
    console.error('Error fetching operation:', error);
    return c.json({ error: 'Failed to fetch operation' }, 500);
  }
});

// PUT /api/operations/:id - Update operation
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(operations)
      .where(eq(operations.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Operation not found' }, 404);
    }

    const updated = {
      name: body.name ?? existing.name,
      details: body.details ?? existing.details,
      toolsUsed: body.toolsUsed ?? existing.toolsUsed,
      order: body.order ?? existing.order,
    };

    await db.update(operations).set(updated).where(eq(operations.id, id));

    return c.json({ ...existing, ...updated });
  } catch (error) {
    console.error('Error updating operation:', error);
    return c.json({ error: 'Failed to update operation' }, 500);
  }
});

// DELETE /api/operations/:id - Delete operation
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const existing = await db
      .select()
      .from(operations)
      .where(eq(operations.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Operation not found' }, 404);
    }

    await db.delete(operations).where(eq(operations.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting operation:', error);
    return c.json({ error: 'Failed to delete operation' }, 500);
  }
});

export default app;
