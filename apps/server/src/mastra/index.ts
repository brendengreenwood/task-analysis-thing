import { Mastra } from "@mastra/core/mastra";
import { chatRoute } from "@mastra/ai-sdk";
import { NetlifyDeployer } from "@mastra/deployer-netlify";
import { taskAnalysisAgent } from "./agents";
import { PinoLogger } from "@mastra/loggers";

// Allow your Netlify frontend domain and localhost for dev
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL, // Set this in Netlify env vars
].filter(Boolean) as string[];

export const mastra = new Mastra({
  agents: { taskAnalysisAgent },
  server: {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    apiRoutes: [
      chatRoute({
        path: "/chat/:agentId",
      }),
    ],
  },
  deployer: new NetlifyDeployer(),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
