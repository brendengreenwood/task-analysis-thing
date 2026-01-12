import { Hono } from 'hono';
import { db } from '../db/index';
import { sessions, insights } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// GET /api/sessions/:id - Get session with insights
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .get();

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    // Get insights linked to this session
    const sessionInsights = await db
      .select()
      .from(insights)
      .where(eq(insights.sessionId, id))
      .all();

    return c.json({
      ...session,
      insights: sessionInsights,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return c.json({ error: 'Failed to fetch session' }, 500);
  }
});

// PUT /api/sessions/:id - Update session
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Session not found' }, 404);
    }

    const updated = {
      type: body.type ?? existing.type,
      date: body.date ? new Date(body.date) : existing.date,
      participantName: body.participantName ?? existing.participantName,
      personaId: body.personaId ?? existing.personaId,
      duration: body.duration ?? existing.duration,
      notes: body.notes ?? existing.notes,
      transcript: body.transcript ?? existing.transcript,
      recordingUrl: body.recordingUrl ?? existing.recordingUrl,
    };

    await db.update(sessions).set(updated).where(eq(sessions.id, id));

    return c.json({ ...existing, ...updated });
  } catch (error) {
    console.error('Error updating session:', error);
    return c.json({ error: 'Failed to update session' }, 500);
  }
});

// DELETE /api/sessions/:id - Delete session
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const existing = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Session not found' }, 404);
    }

    await db.delete(sessions).where(eq(sessions.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return c.json({ error: 'Failed to delete session' }, 500);
  }
});

export default app;
