import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HonoBindings, HonoVariables, MastraServer } from '@mastra/hono';
import { toAISdkStream } from '@mastra/ai-sdk';

import { mastra } from './mastra';
import projectsRouter from './routes/projects';
import personasRouter from './routes/personas';
import sessionsRouter from './routes/sessions';
import insightsRouter from './routes/insights';
import activitiesRouter from './routes/activities';
import tasksRouter from './routes/tasks';
import operationsRouter from './routes/operations';

const app = new Hono<{ Bindings: HonoBindings; Variables: HonoVariables }>();

// Enable CORS for frontend (allow any localhost port in development)
app.use('*', cors({
  origin: (origin) => {
    if (!origin || origin.startsWith('http://localhost:')) {
      return origin || '*';
    }
    return null;
  },
  credentials: true,
}));

const server = new MastraServer({ app, mastra });

await server.init();

// Mount API routes
app.route('/api/projects', projectsRouter);
app.route('/api/personas', personasRouter);
app.route('/api/sessions', sessionsRouter);
app.route('/api/insights', insightsRouter);
app.route('/api/activities', activitiesRouter);
app.route('/api/tasks', tasksRouter);
app.route('/api/operations', operationsRouter);

// Chat endpoint for AI SDK streaming
app.post('/chat/:agentId', async (c) => {
  const agentId = c.req.param('agentId');
  const { messages } = await c.req.json();

  const agent = mastra.getAgent(agentId);
  if (!agent) {
    return c.json({ error: `Agent ${agentId} not found` }, 404);
  }

  const agentStream = await agent.stream(messages);

  // Convert Mastra stream to AI SDK format
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const part of toAISdkStream(agentStream, { from: 'agent' })) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(part) + '\n'));
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});

// Health check endpoint
app.get('/health', (c) => {
  const mastraInstance = c.get('mastra');
  const agents = Object.keys(mastraInstance.listAgents());
  return c.json({ status: 'ok', agents });
});

const port = 4111;

serve({ fetch: app.fetch, port }, () => {
  console.log(`Mastra server running on http://localhost:${port}`);
  console.log(`Agent API: http://localhost:${port}/api/agents`);
  console.log(`Health: http://localhost:${port}/health`);
});
