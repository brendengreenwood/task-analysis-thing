import { Hono } from 'hono';
import { db } from '../db/index';
import { activities, tasks, operations, personaActivities } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// GET /api/activities/:id - Get single activity with nested tasks
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const activity = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id))
      .get();

    if (!activity) {
      return c.json({ error: 'Activity not found' }, 404);
    }

    // Get tasks for this activity
    const activityTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.activityId, id));

    // Get operations for all tasks
    const tasksWithOperations = await Promise.all(
      activityTasks.map(async (task) => {
        const taskOps = await db
          .select()
          .from(operations)
          .where(eq(operations.taskId, task.id));

        return {
          ...task,
          operations: taskOps,
        };
      })
    );

    // Get persona links
    const links = await db
      .select()
      .from(personaActivities)
      .where(eq(personaActivities.activityId, id));

    return c.json({
      ...activity,
      tasks: tasksWithOperations,
      personaIds: links.map(link => link.personaId),
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return c.json({ error: 'Failed to fetch activity' }, 500);
  }
});

// PUT /api/activities/:id - Update activity
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Activity not found' }, 404);
    }

    const updated = {
      name: body.name ?? existing.name,
      overview: body.overview ?? existing.overview,
      frequency: body.frequency ?? existing.frequency,
      importance: body.importance ?? existing.importance,
      order: body.order ?? existing.order,
    };

    await db.update(activities).set(updated).where(eq(activities.id, id));

    // Get persona links
    const links = await db
      .select()
      .from(personaActivities)
      .where(eq(personaActivities.activityId, id));

    return c.json({
      ...existing,
      ...updated,
      personaIds: links.map(link => link.personaId),
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    return c.json({ error: 'Failed to update activity' }, 500);
  }
});

// DELETE /api/activities/:id - Delete activity
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const existing = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Activity not found' }, 404);
    }

    await db.delete(activities).where(eq(activities.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return c.json({ error: 'Failed to delete activity' }, 500);
  }
});

// GET /api/activities/:activityId/tasks - List tasks
app.get('/:activityId/tasks', async (c) => {
  try {
    const activityId = c.req.param('activityId');

    const activityTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.activityId, activityId));

    return c.json(activityTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

// POST /api/activities/:activityId/tasks - Create task
app.post('/:activityId/tasks', async (c) => {
  try {
    const activityId = c.req.param('activityId');
    const body = await c.req.json();

    const newTask = {
      id: `task-${Date.now()}`,
      activityId,
      name: body.name,
      goal: body.goal || null,
      order: body.order || 0,
    };

    await db.insert(tasks).values(newTask);
    return c.json(newTask, 201);
  } catch (error) {
    console.error('Error creating task:', error);
    return c.json({ error: 'Failed to create task' }, 500);
  }
});

export default app;
