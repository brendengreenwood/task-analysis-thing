import { Hono } from 'hono';
import { db } from '../db/index';
import { conceptRelationships } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// PUT /api/relationships/:id - Update relationship
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(conceptRelationships)
      .where(eq(conceptRelationships.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Relationship not found' }, 404);
    }

    const updated = {
      fromConceptId: body.fromConceptId ?? existing.fromConceptId,
      toConceptId: body.toConceptId ?? existing.toConceptId,
      relationshipType: body.relationshipType ?? existing.relationshipType,
      label: body.label ?? existing.label,
    };

    await db.update(conceptRelationships).set(updated).where(eq(conceptRelationships.id, id));

    return c.json({ ...existing, ...updated });
  } catch (error) {
    console.error('Error updating relationship:', error);
    return c.json({ error: 'Failed to update relationship' }, 500);
  }
});

// DELETE /api/relationships/:id - Delete relationship
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const existing = await db
      .select()
      .from(conceptRelationships)
      .where(eq(conceptRelationships.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Relationship not found' }, 404);
    }

    await db.delete(conceptRelationships).where(eq(conceptRelationships.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting relationship:', error);
    return c.json({ error: 'Failed to delete relationship' }, 500);
  }
});

export default app;
