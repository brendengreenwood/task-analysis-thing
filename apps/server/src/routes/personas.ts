import { Hono } from 'hono';
import { db } from '../db/index';
import { personas, personaActivities } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const app = new Hono();

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
