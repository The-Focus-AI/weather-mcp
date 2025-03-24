#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { setupWeatherServer } from "./weather-service.js";

// Create server instance
const server = new McpServer({
  name: "weather",
  version: "1.0.0",
});

// Set up weather tools
setupWeatherServer(server);

export function createSSEServer(mcpServer: McpServer) {
  const app = express();

  const transportMap = new Map<string, SSEServerTransport>();

  app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport("/messages", res);
    transportMap.set(transport.sessionId, transport);
    await mcpServer.connect(transport);
  });

  app.post("/messages", (req, res) => {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      console.error("Message received without sessionId");
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    const transport = transportMap.get(sessionId);

    if (transport) {
      transport.handlePostMessage(req, res);
    }
  });

  return app;
}

const app = createSSEServer(server);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Weather MCP Server running on http://localhost:${PORT}`);
});
