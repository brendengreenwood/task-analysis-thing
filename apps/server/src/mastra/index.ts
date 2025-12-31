import { Mastra } from '@mastra/core/mastra';
import { chatRoute } from '@mastra/ai-sdk';
import { taskAnalysisAgent } from './agents';

export const mastra = new Mastra({
  agents: { taskAnalysisAgent },
  server: {
    apiRoutes: [
      chatRoute({
        path: '/chat/:agentId',
      }),
    ],
  },
});
