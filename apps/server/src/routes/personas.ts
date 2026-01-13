import { Hono } from 'hono';
import { db } from '../db/index';
import { personas, personaActivities, activities, sessions, insights, tasks, operations } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';

const app = new Hono();

// GET /api/personas/:id/full - Get full persona with all linked data
app.get('/:id/full', async (c) => {
  try {
    const id = c.req.param('id');

    // Fetch the persona
    const persona = await db
      .select()
      .from(personas)
      .where(eq(personas.id, id))
      .get();

    if (!persona) {
      return c.json({ error: 'Persona not found' }, 404);
    }

    // Fetch linked activities
    const linkedActivities = await db
      .select({
        activity: activities,
      })
      .from(personaActivities)
      .innerJoin(activities, eq(personaActivities.activityId, activities.id))
      .where(eq(personaActivities.personaId, id))
      .all();

    const activityIds = linkedActivities.map(a => a.activity.id);

    // Fetch tasks and operations for these activities
    const activitiesWithDetails = await Promise.all(
      linkedActivities.map(async ({ activity }) => {
        const activityTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.activityId, activity.id))
          .all();

        const tasksWithOperations = await Promise.all(
          activityTasks.map(async (task) => {
            const taskOperations = await db
              .select()
              .from(operations)
              .where(eq(operations.taskId, task.id))
              .all();

            return {
              ...task,
              operations: taskOperations,
            };
          })
        );

        return {
          ...activity,
          tasks: tasksWithOperations,
        };
      })
    );

    // Fetch sessions where this persona was the participant
    const personaSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.personaId, id))
      .all();

    // Fetch all insights related to this persona
    // 1. Direct persona insights
    // 2. Insights linked to their activities, tasks, or operations
    const taskIds = activitiesWithDetails.flatMap(a => a.tasks.map(t => t.id));
    const operationIds = activitiesWithDetails.flatMap(a =>
      a.tasks.flatMap(t => t.operations.map(o => o.id))
    );

    // Build conditions array dynamically
    const conditions = [
      and(eq(insights.linkedEntityType, 'persona'), eq(insights.linkedEntityId, id))
    ];

    if (activityIds.length > 0) {
      conditions.push(
        and(
          eq(insights.linkedEntityType, 'activity'),
          or(...activityIds.map(aid => eq(insights.linkedEntityId, aid)))
        )
      );
    }

    if (taskIds.length > 0) {
      conditions.push(
        and(
          eq(insights.linkedEntityType, 'task'),
          or(...taskIds.map(tid => eq(insights.linkedEntityId, tid)))
        )
      );
    }

    if (operationIds.length > 0) {
      conditions.push(
        and(
          eq(insights.linkedEntityType, 'operation'),
          or(...operationIds.map(oid => eq(insights.linkedEntityId, oid)))
        )
      );
    }

    const relatedInsights = await db
      .select()
      .from(insights)
      .where(or(...conditions))
      .all();

    // Calculate pain summary
    const painPoints = relatedInsights.filter(i => i.type === 'pain_point');
    const painSummary = {
      total: painPoints.length,
      critical: painPoints.filter(p => p.severity === 'critical').length,
      high: painPoints.filter(p => p.severity === 'high').length,
      medium: painPoints.filter(p => p.severity === 'medium').length,
      low: painPoints.filter(p => p.severity === 'low').length,
      frictionScore:
        painPoints.filter(p => p.severity === 'critical').length * 4 +
        painPoints.filter(p => p.severity === 'high').length * 3 +
        painPoints.filter(p => p.severity === 'medium').length * 2 +
        painPoints.filter(p => p.severity === 'low').length * 1,
    };

    // Build the full persona response
    const fullPersona = {
      ...persona,
      activities: activitiesWithDetails,
      sessions: personaSessions,
      insights: relatedInsights,
      painSummary,
    };

    return c.json(fullPersona);
  } catch (error) {
    console.error('Error fetching full persona:', error);
    return c.json({ error: 'Failed to fetch persona details' }, 500);
  }
});

// PUT /api/personas/:id - Update persona
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(personas)
      .where(eq(personas.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Persona not found' }, 404);
    }

    const updated = {
      name: body.name ?? existing.name,
      role: body.role ?? existing.role,
      description: body.description ?? existing.description,
      goals: body.goals ?? existing.goals,
      frustrations: body.frustrations ?? existing.frustrations,
      tools: body.tools ?? existing.tools,
      quote: body.quote ?? existing.quote,
      avatarUrl: body.avatarUrl ?? existing.avatarUrl,
      skills: body.skills ?? existing.skills,
      environment: body.environment ?? existing.environment,
      experienceLevel: body.experienceLevel ?? existing.experienceLevel,
      usageFrequency: body.usageFrequency ?? existing.usageFrequency,
      influence: body.influence ?? existing.influence,
      updatedAt: new Date(),
    };

    await db.update(personas).set(updated).where(eq(personas.id, id));

    return c.json({ ...existing, ...updated });
  } catch (error) {
    console.error('Error updating persona:', error);
    return c.json({ error: 'Failed to update persona' }, 500);
  }
});

// DELETE /api/personas/:id - Delete persona
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const existing = await db
      .select()
      .from(personas)
      .where(eq(personas.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Persona not found' }, 404);
    }

    await db.delete(personas).where(eq(personas.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting persona:', error);
    return c.json({ error: 'Failed to delete persona' }, 500);
  }
});

// POST /api/personas/:id/activities - Link persona to activity
app.post('/:id/activities', async (c) => {
  try {
    const personaId = c.req.param('id');
    const body = await c.req.json();
    const activityId = body.activityId;

    if (!activityId) {
      return c.json({ error: 'activityId is required' }, 400);
    }

    // Verify persona exists
    const persona = await db
      .select()
      .from(personas)
      .where(eq(personas.id, personaId))
      .get();

    if (!persona) {
      return c.json({ error: 'Persona not found' }, 404);
    }

    // Check if link already exists
    const existing = await db
      .select()
      .from(personaActivities)
      .where(
        and(
          eq(personaActivities.personaId, personaId),
          eq(personaActivities.activityId, activityId)
        )
      )
      .get();

    if (existing) {
      return c.json({ message: 'Link already exists' });
    }

    await db.insert(personaActivities).values({
      personaId,
      activityId,
    });

    return c.json({ success: true }, 201);
  } catch (error) {
    console.error('Error linking persona to activity:', error);
    return c.json({ error: 'Failed to link persona to activity' }, 500);
  }
});

// DELETE /api/personas/:personaId/activities/:activityId - Unlink
app.delete('/:personaId/activities/:activityId', async (c) => {
  try {
    const personaId = c.req.param('personaId');
    const activityId = c.req.param('activityId');

    await db
      .delete(personaActivities)
      .where(
        and(
          eq(personaActivities.personaId, personaId),
          eq(personaActivities.activityId, activityId)
        )
      );

    return c.json({ success: true });
  } catch (error) {
    console.error('Error unlinking persona from activity:', error);
    return c.json({ error: 'Failed to unlink persona from activity' }, 500);
  }
});

export default app;
