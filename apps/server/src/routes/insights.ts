import { Hono } from 'hono';
import { db } from '../db/index';
import { insights } from '../db/schema';
import { eq, isNull } from 'drizzle-orm';

const app = new Hono();

// PUT /api/insights/:id - Update insight (including linking)
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(insights)
      .where(eq(insights.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Insight not found' }, 404);
    }

    const updated = {
      content: body.content ?? existing.content,
      type: body.type ?? existing.type,
      severity: body.severity ?? existing.severity,
      sessionId: body.sessionId ?? existing.sessionId,
      linkedEntityType: body.linkedEntityType ?? existing.linkedEntityType,
      linkedEntityId: body.linkedEntityId ?? existing.linkedEntityId,
    };

    await db.update(insights).set(updated).where(eq(insights.id, id));

    return c.json({ ...existing, ...updated });
  } catch (error) {
    console.error('Error updating insight:', error);
    return c.json({ error: 'Failed to update insight' }, 500);
  }
});

// DELETE /api/insights/:id - Delete insight
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const existing = await db
      .select()
      .from(insights)
      .where(eq(insights.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Insight not found' }, 404);
    }

    await db.delete(insights).where(eq(insights.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting insight:', error);
    return c.json({ error: 'Failed to delete insight' }, 500);
  }
});

// GET /api/insights/unlinked - Get insights not linked to any entity
app.get('/unlinked', async (c) => {
  try {
    const unlinkedInsights = await db
      .select()
      .from(insights)
      .where(isNull(insights.linkedEntityId));

    return c.json(unlinkedInsights);
  } catch (error) {
    console.error('Error fetching unlinked insights:', error);
    return c.json({ error: 'Failed to fetch unlinked insights' }, 500);
  }
});

export default app;
