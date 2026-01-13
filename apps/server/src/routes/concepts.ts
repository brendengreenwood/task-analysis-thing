import { Hono } from 'hono';
import { db } from '../db/index';
import { concepts } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// PUT /api/concepts/:id - Update concept
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(concepts)
      .where(eq(concepts.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Concept not found' }, 404);
    }

    const updated = {
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      userLanguage: body.userLanguage ?? existing.userLanguage,
      systemEquivalent: body.systemEquivalent ?? existing.systemEquivalent,
      x: body.x ?? existing.x,
      y: body.y ?? existing.y,
    };

    await db.update(concepts).set(updated).where(eq(concepts.id, id));

    return c.json({ ...existing, ...updated });
  } catch (error) {
    console.error('Error updating concept:', error);
    return c.json({ error: 'Failed to update concept' }, 500);
  }
});

// DELETE /api/concepts/:id - Delete concept
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const existing = await db
      .select()
      .from(concepts)
      .where(eq(concepts.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Concept not found' }, 404);
    }

    await db.delete(concepts).where(eq(concepts.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting concept:', error);
    return c.json({ error: 'Failed to delete concept' }, 500);
  }
});

export default app;
