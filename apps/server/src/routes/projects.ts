import { Hono } from 'hono';
import { db } from '../db/index';
import { projects, activities, tasks, operations, personas, sessions, insights, personaActivities, mentalModels } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// GET /api/projects/:projectId/personas - List personas
app.get('/:projectId/personas', async (c) => {
  try {
    const projectId = c.req.param('projectId');

    const projectPersonas = await db
      .select()
      .from(personas)
      .where(eq(personas.projectId, projectId));

    return c.json(projectPersonas);
  } catch (error) {
    console.error('Error fetching personas:', error);
    return c.json({ error: 'Failed to fetch personas' }, 500);
  }
});

// POST /api/projects/:projectId/personas - Create persona
app.post('/:projectId/personas', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const body = await c.req.json();

    // Verify project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const newPersona = {
      id: `persona-${Date.now()}`,
      projectId,
      name: body.name,
      role: body.role || null,
      description: body.description || null,
      goals: body.goals || [],
      frustrations: body.frustrations || [],
      tools: body.tools || [],
      quote: body.quote || null,
    };

    await db.insert(personas).values(newPersona);
    return c.json(newPersona, 201);
  } catch (error) {
    console.error('Error creating persona:', error);
    return c.json({ error: 'Failed to create persona' }, 500);
  }
});

// GET /api/projects/:projectId/sessions - List sessions
app.get('/:projectId/sessions', async (c) => {
  try {
    const projectId = c.req.param('projectId');

    const projectSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.projectId, projectId));

    return c.json(projectSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return c.json({ error: 'Failed to fetch sessions' }, 500);
  }
});

// POST /api/projects/:projectId/sessions - Create session
app.post('/:projectId/sessions', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const body = await c.req.json();

    // Verify project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const newSession = {
      id: `session-${Date.now()}`,
      projectId,
      type: body.type,
      date: body.date ? new Date(body.date) : new Date(),
      participantName: body.participantName || null,
      personaId: body.personaId || null,
      duration: body.duration || null,
      notes: body.notes || null,
      recordingUrl: body.recordingUrl || null,
    };

    await db.insert(sessions).values(newSession);
    return c.json(newSession, 201);
  } catch (error) {
    console.error('Error creating session:', error);
    return c.json({ error: 'Failed to create session' }, 500);
  }
});

// GET /api/projects/:projectId/insights - List all insights (filterable)
app.get('/:projectId/insights', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const type = c.req.query('type');
    const sessionId = c.req.query('sessionId');

    let projectInsights = await db
      .select()
      .from(insights)
      .where(eq(insights.projectId, projectId));

    if (type) {
      projectInsights = projectInsights.filter(i => i.type === type);
    }

    if (sessionId) {
      projectInsights = projectInsights.filter(i => i.sessionId === sessionId);
    }

    return c.json(projectInsights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    return c.json({ error: 'Failed to fetch insights' }, 500);
  }
});

// POST /api/projects/:projectId/insights - Create insight
app.post('/:projectId/insights', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const body = await c.req.json();

    // Verify project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const newInsight = {
      id: `insight-${Date.now()}`,
      projectId,
      sessionId: body.sessionId || null,
      content: body.content,
      type: body.type || 'observation',
      severity: body.severity || null,
      linkedEntityType: body.linkedEntityType || null,
      linkedEntityId: body.linkedEntityId || null,
      createdAt: new Date(),
    };

    await db.insert(insights).values(newInsight);
    return c.json(newInsight, 201);
  } catch (error) {
    console.error('Error creating insight:', error);
    return c.json({ error: 'Failed to create insight' }, 500);
  }
});

// GET /api/projects/:projectId/mental-models - List mental models
app.get('/:projectId/mental-models', async (c) => {
  try {
    const projectId = c.req.param('projectId');

    const projectMentalModels = await db
      .select()
      .from(mentalModels)
      .where(eq(mentalModels.projectId, projectId));

    return c.json(projectMentalModels);
  } catch (error) {
    console.error('Error fetching mental models:', error);
    return c.json({ error: 'Failed to fetch mental models' }, 500);
  }
});

// POST /api/projects/:projectId/mental-models - Create mental model
app.post('/:projectId/mental-models', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const body = await c.req.json();

    // Verify project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const newMentalModel = {
      id: `mental-model-${Date.now()}`,
      projectId,
      personaId: body.personaId || null,
      name: body.name,
      description: body.description || null,
      createdAt: new Date(),
    };

    await db.insert(mentalModels).values(newMentalModel);
    return c.json(newMentalModel, 201);
  } catch (error) {
    console.error('Error creating mental model:', error);
    return c.json({ error: 'Failed to create mental model' }, 500);
  }
});

// GET /api/projects/:projectId/activities - List activities
app.get('/:projectId/activities', async (c) => {
  try {
    const projectId = c.req.param('projectId');

    const projectActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.projectId, projectId));

    // Get persona links for each activity
    const activitiesWithPersonas = await Promise.all(
      projectActivities.map(async (activity) => {
        const links = await db
          .select()
          .from(personaActivities)
          .where(eq(personaActivities.activityId, activity.id));

        return {
          ...activity,
          personaIds: links.map(link => link.personaId),
        };
      })
    );

    return c.json(activitiesWithPersonas);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return c.json({ error: 'Failed to fetch activities' }, 500);
  }
});

// POST /api/projects/:projectId/activities - Create activity
app.post('/:projectId/activities', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const body = await c.req.json();

    const newActivity = {
      id: `activity-${Date.now()}`,
      projectId,
      name: body.name,
      overview: body.overview || null,
      frequency: body.frequency || null,
      importance: body.importance || null,
      order: body.order || 0,
    };

    await db.insert(activities).values(newActivity);
    return c.json({ ...newActivity, personaIds: [] }, 201);
  } catch (error) {
    console.error('Error creating activity:', error);
    return c.json({ error: 'Failed to create activity' }, 500);
  }
});

// GET /api/projects - List all projects
app.get('/', async (c) => {
  try {
    const allProjects = await db.select().from(projects);
    return c.json(allProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

// POST /api/projects - Create project
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const now = new Date();

    const newProject = {
      id: `proj-${Date.now()}`,
      name: body.name,
      description: body.description || null,
      phase: body.phase || 'discovery',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(projects).values(newProject);
    return c.json(newProject, 201);
  } catch (error) {
    console.error('Error creating project:', error);
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

// GET /api/projects/:id - Get project with all nested data
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Get project
    const project = await db.select().from(projects).where(eq(projects.id, id)).get();
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get all related data
    const projectPersonas = await db.select().from(personas).where(eq(personas.projectId, id));
    const projectSessions = await db.select().from(sessions).where(eq(sessions.projectId, id));
    const projectActivities = await db.select().from(activities).where(eq(activities.projectId, id));
    const projectInsights = await db.select().from(insights).where(eq(insights.projectId, id));

    // Get tasks for all activities
    const activityIds = projectActivities.map(a => a.id);
    const allTasks = activityIds.length > 0
      ? await db.select().from(tasks).where(eq(tasks.activityId, activityIds[0])) // TODO: fix for multiple activities
      : [];

    // Get operations for all tasks
    const taskIds = allTasks.map(t => t.id);
    const allOperations = taskIds.length > 0
      ? await db.select().from(operations).where(eq(operations.taskId, taskIds[0])) // TODO: fix for multiple tasks
      : [];

    // Get persona-activity links
    const personaActivityLinks = await db.select().from(personaActivities);

    // Build nested structure
    const activitiesWithTasks = projectActivities.map(activity => {
      const activityTasks = allTasks.filter(t => t.activityId === activity.id);
      const tasksWithOperations = activityTasks.map(task => {
        const taskOperations = allOperations.filter(op => op.taskId === task.id);
        return {
          ...task,
          operations: taskOperations,
        };
      });

      const linkedPersonaIds = personaActivityLinks
        .filter(link => link.activityId === activity.id)
        .map(link => link.personaId);

      return {
        ...activity,
        tasks: tasksWithOperations,
        personaIds: linkedPersonaIds,
      };
    });

    return c.json({
      ...project,
      personas: projectPersonas,
      sessions: projectSessions,
      activities: activitiesWithTasks,
      insights: projectInsights,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return c.json({ error: 'Failed to fetch project' }, 500);
  }
});

// PUT /api/projects/:id - Update project
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await db.select().from(projects).where(eq(projects.id, id)).get();
    if (!existing) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const updated = {
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      phase: body.phase ?? existing.phase,
      updatedAt: new Date(),
    };

    await db.update(projects).set(updated).where(eq(projects.id, id));

    return c.json({ ...existing, ...updated });
  } catch (error) {
    console.error('Error updating project:', error);
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

// DELETE /api/projects/:id - Delete project (cascades)
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const existing = await db.select().from(projects).where(eq(projects.id, id)).get();
    if (!existing) {
      return c.json({ error: 'Project not found' }, 404);
    }

    await db.delete(projects).where(eq(projects.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return c.json({ error: 'Failed to delete project' }, 500);
  }
});

// GET /api/projects/:id/export - Full JSON export for agent context
app.get('/:id/export', async (c) => {
  try {
    const id = c.req.param('id');

    // Get project with all nested data (reuse the logic from GET /:id)
    const project = await db.select().from(projects).where(eq(projects.id, id)).get();
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const projectPersonas = await db.select().from(personas).where(eq(personas.projectId, id));
    const projectSessions = await db.select().from(sessions).where(eq(sessions.projectId, id));
    const projectActivities = await db.select().from(activities).where(eq(activities.projectId, id));
    const projectInsights = await db.select().from(insights).where(eq(insights.projectId, id));

    // Get tasks and operations
    const activityIds = projectActivities.map(a => a.id);
    let allTasks: any[] = [];
    let allOperations: any[] = [];

    for (const activityId of activityIds) {
      const activityTasks = await db.select().from(tasks).where(eq(tasks.activityId, activityId));
      allTasks.push(...activityTasks);
    }

    const taskIds = allTasks.map(t => t.id);
    for (const taskId of taskIds) {
      const taskOps = await db.select().from(operations).where(eq(operations.taskId, taskId));
      allOperations.push(...taskOps);
    }

    const personaActivityLinks = await db.select().from(personaActivities);

    // Build export format matching the spec
    const exportData = {
      exportedAt: new Date().toISOString(),
      project: {
        id: project.id,
        name: project.name,
        phase: project.phase,
      },
      personas: projectPersonas.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        description: p.description,
        goals: p.goals || [],
        frustrations: p.frustrations || [],
        tools: p.tools || [],
        quote: p.quote,
        activities: personaActivityLinks
          .filter(link => link.personaId === p.id)
          .map(link => link.activityId),
      })),
      workflows: projectActivities.map(activity => {
        const activityTasks = allTasks.filter(t => t.activityId === activity.id);
        const linkedPersonaIds = personaActivityLinks
          .filter(link => link.activityId === activity.id)
          .map(link => link.personaId);

        return {
          activityId: activity.id,
          name: activity.name,
          overview: activity.overview,
          frequency: activity.frequency,
          importance: activity.importance,
          performedBy: linkedPersonaIds,
          tasks: activityTasks.map(task => {
            const taskOperations = allOperations.filter(op => op.taskId === task.id);
            return {
              taskId: task.id,
              name: task.name,
              goal: task.goal,
              operations: taskOperations.map(op => ({
                operationId: op.id,
                name: op.name,
                details: op.details,
                toolsUsed: op.toolsUsed || [],
              })),
            };
          }),
        };
      }),
      insights: projectInsights.map(i => ({
        id: i.id,
        content: i.content,
        type: i.type,
        severity: i.severity,
        linkedTo: i.linkedEntityType && i.linkedEntityId
          ? { type: i.linkedEntityType, id: i.linkedEntityId }
          : null,
      })),
      sessions: projectSessions.map(s => ({
        id: s.id,
        type: s.type,
        date: s.date,
        participantName: s.participantName,
        persona: s.personaId,
        insightCount: projectInsights.filter(i => i.sessionId === s.id).length,
      })),
    };

    return c.json(exportData);
  } catch (error) {
    console.error('Error exporting project:', error);
    return c.json({ error: 'Failed to export project' }, 500);
  }
});

export default app;
