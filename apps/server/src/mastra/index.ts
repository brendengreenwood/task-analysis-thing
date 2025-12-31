import { Mastra } from "@mastra/core/mastra";
import { chatRoute } from "@mastra/ai-sdk";
import { taskAnalysisAgent } from "./agents";
import { PinoLogger } from "@mastra/loggers";

export const mastra = new Mastra({
  agents: { taskAnalysisAgent },
  server: {
    apiRoutes: [
      chatRoute({
        path: "/chat/:agentId",
      }),
    ],
  },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
