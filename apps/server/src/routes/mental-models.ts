import { Hono } from 'hono';
import { db } from '../db/index';
import { mentalModels, concepts, beliefs, conceptRelationships, projects } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// GET /api/mental-models/:id - Get mental model with all data
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const mentalModel = await db
      .select()
      .from(mentalModels)
      .where(eq(mentalModels.id, id))
      .get();

    if (!mentalModel) {
      return c.json({ error: 'Mental model not found' }, 404);
    }

    // Get all related data
    const modelConcepts = await db
      .select()
      .from(concepts)
      .where(eq(concepts.mentalModelId, id));

    const modelBeliefs = await db
      .select()
      .from(beliefs)
      .where(eq(beliefs.mentalModelId, id));

    const modelRelationships = await db
      .select()
      .from(conceptRelationships)
      .where(eq(conceptRelationships.mentalModelId, id));

    return c.json({
      ...mentalModel,
      concepts: modelConcepts,
      beliefs: modelBeliefs,
      relationships: modelRelationships,
    });
  } catch (error) {
    console.error('Error fetching mental model:', error);
    return c.json({ error: 'Failed to fetch mental model' }, 500);
  }
});

// PUT /api/mental-models/:id - Update mental model
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(mentalModels)
      .where(eq(mentalModels.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Mental model not found' }, 404);
    }

    const updated = {
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      personaId: body.personaId ?? existing.personaId,
    };

    await db.update(mentalModels).set(updated).where(eq(mentalModels.id, id));

    return c.json({ ...existing, ...updated });
  } catch (error) {
    console.error('Error updating mental model:', error);
    return c.json({ error: 'Failed to update mental model' }, 500);
  }
});

// DELETE /api/mental-models/:id - Delete mental model
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const existing = await db
      .select()
      .from(mentalModels)
      .where(eq(mentalModels.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Mental model not found' }, 404);
    }

    await db.delete(mentalModels).where(eq(mentalModels.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting mental model:', error);
    return c.json({ error: 'Failed to delete mental model' }, 500);
  }
});

// POST /api/mental-models/:id/concepts - Create concept
app.post('/:id/concepts', async (c) => {
  try {
    const mentalModelId = c.req.param('id');
    const body = await c.req.json();

    // Verify mental model exists
    const mentalModel = await db
      .select()
      .from(mentalModels)
      .where(eq(mentalModels.id, mentalModelId))
      .get();

    if (!mentalModel) {
      return c.json({ error: 'Mental model not found' }, 404);
    }

    const newConcept = {
      id: `concept-${Date.now()}`,
      mentalModelId,
      name: body.name,
      description: body.description || null,
      userLanguage: body.userLanguage || null,
      systemEquivalent: body.systemEquivalent || null,
      x: body.x || 0,
      y: body.y || 0,
    };

    await db.insert(concepts).values(newConcept);
    return c.json(newConcept, 201);
  } catch (error) {
    console.error('Error creating concept:', error);
    return c.json({ error: 'Failed to create concept' }, 500);
  }
});

// POST /api/mental-models/:id/beliefs - Create belief
app.post('/:id/beliefs', async (c) => {
  try {
    const mentalModelId = c.req.param('id');
    const body = await c.req.json();

    // Verify mental model exists
    const mentalModel = await db
      .select()
      .from(mentalModels)
      .where(eq(mentalModels.id, mentalModelId))
      .get();

    if (!mentalModel) {
      return c.json({ error: 'Mental model not found' }, 404);
    }

    const newBelief = {
      id: `belief-${Date.now()}`,
      mentalModelId,
      content: body.content,
      reality: body.reality || null,
      isMismatch: body.isMismatch || false,
      severity: body.severity || null,
      insightIds: body.insightIds || [],
    };

    await db.insert(beliefs).values(newBelief);
    return c.json(newBelief, 201);
  } catch (error) {
    console.error('Error creating belief:', error);
    return c.json({ error: 'Failed to create belief' }, 500);
  }
});

// POST /api/mental-models/:id/relationships - Create relationship
app.post('/:id/relationships', async (c) => {
  try {
    const mentalModelId = c.req.param('id');
    const body = await c.req.json();

    // Verify mental model exists
    const mentalModel = await db
      .select()
      .from(mentalModels)
      .where(eq(mentalModels.id, mentalModelId))
      .get();

    if (!mentalModel) {
      return c.json({ error: 'Mental model not found' }, 404);
    }

    const newRelationship = {
      id: `relationship-${Date.now()}`,
      mentalModelId,
      fromConceptId: body.fromConceptId,
      toConceptId: body.toConceptId,
      relationshipType: body.relationshipType || null,
      label: body.label || null,
    };

    await db.insert(conceptRelationships).values(newRelationship);
    return c.json(newRelationship, 201);
  } catch (error) {
    console.error('Error creating relationship:', error);
    return c.json({ error: 'Failed to create relationship' }, 500);
  }
});

export default app;
