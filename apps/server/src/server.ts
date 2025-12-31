import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HonoBindings, HonoVariables, MastraServer } from '@mastra/hono';

import { mastra } from './mastra';

const app = new Hono<{ Bindings: HonoBindings; Variables: HonoVariables }>();

// Enable CORS for frontend
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));

const server = new MastraServer({ app, mastra });

await server.init();

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
