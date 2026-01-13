import { Hono } from 'hono';
import { db } from '../db/index';
import { beliefs } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// PUT /api/beliefs/:id - Update belief
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(beliefs)
      .where(eq(beliefs.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Belief not found' }, 404);
    }

    const updated = {
      content: body.content ?? existing.content,
      reality: body.reality ?? existing.reality,
      isMismatch: body.isMismatch ?? existing.isMismatch,
      severity: body.severity ?? existing.severity,
      insightIds: body.insightIds ?? existing.insightIds,
    };

    await db.update(beliefs).set(updated).where(eq(beliefs.id, id));

    return c.json({ ...existing, ...updated });
  } catch (error) {
    console.error('Error updating belief:', error);
    return c.json({ error: 'Failed to update belief' }, 500);
  }
});

// DELETE /api/beliefs/:id - Delete belief
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const existing = await db
      .select()
      .from(beliefs)
      .where(eq(beliefs.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Belief not found' }, 404);
    }

    await db.delete(beliefs).where(eq(beliefs.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting belief:', error);
    return c.json({ error: 'Failed to delete belief' }, 500);
  }
});

export default app;
