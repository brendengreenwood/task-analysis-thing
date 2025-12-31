import { Mastra } from '@mastra/core/mastra';
import { taskAnalysisAgent } from './agents';

export const mastra = new Mastra({
  agents: { taskAnalysisAgent },
});
