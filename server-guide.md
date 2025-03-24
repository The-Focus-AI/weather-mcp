# MCP Server Implementation Guide

## 1. Project Setup

### Base Configuration

```json
{
  "name": "your-mcp-server",
  "version": "1.0.0",
  "type": "module", // Use ES modules
  "bin": {
    "your-stdio": "./dist/mcp-stdio.js",
    "your-sse": "./dist/mcp-sse.js"
  }
}
```

### Required Dependencies

- Core: `@modelcontextprotocol/sdk` (^1.7.0 or later)
- For SSE server:
  - `express` (^4.18.2 or later)
  - `cors` (^2.8.5 or later)
- For validation: `zod` (^3.22.4 or later)

### Development Dependencies

```json
{
  "@types/express": "^4.17.21",
  "@types/node": "^20.11.0",
  "tsx": "^4.7.1",
  "typescript": "^5.3.3"
}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

## 2. Project Structure

```
src/
├── mcp-stdio.ts    # STDIO server implementation
├── mcp-sse.ts      # SSE server implementation
└── service.ts      # Core service implementation
dist/               # Compiled JavaScript
package.json
tsconfig.json
```

## 3. Implementation Guidelines

### 3.1 Core Server Setup

Create a base server instance that can be shared between STDIO and SSE:

```typescript
const server = new McpServer({
  name: "your-service",
  version: "1.0.0",
});
```

### 3.2 Tool Implementation

1. Define interfaces for your data structures
2. Implement helper functions for external API calls
3. Register tools using the server.tool() method with:
   - Unique name
   - Description
   - Zod schema for parameters
   - Async handler function

Example structure:

```typescript
export function setupTools(server: McpServer) {
  server.tool(
    "tool-name",
    "Tool description",
    {
      param1: z.string().describe("Parameter description"),
      param2: z.number().describe("Parameter description"),
    },
    async ({ param1, param2 }) => {
      // Implementation
      return {
        content: [
          {
            type: "text",
            text: "Response",
          },
        ],
      };
    }
  );
}
```

### 3.3 STDIO Implementation (mcp-stdio.ts)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

### 3.4 SSE Implementation (mcp-sse.ts)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";

function createSSEServer(mcpServer: McpServer) {
  const app = express();
  const transportMap = new Map<string, SSEServerTransport>();

  app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport("/messages", res);
    transportMap.set(transport.sessionId, transport);
    await mcpServer.connect(transport);
  });

  app.post("/messages", (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transportMap.get(sessionId);
    if (transport) {
      transport.handlePostMessage(req, res);
    }
  });

  return app;
}
```

## 4. Scripts Configuration

Add these scripts to package.json:

```json
{
  "scripts": {
    "build": "tsc",
    "start:stdio": "node dist/mcp-stdio.js",
    "start:sse": "node dist/mcp-sse.js",
    "dev:stdio": "tsx src/mcp-stdio.ts",
    "dev:sse": "tsx src/mcp-sse.ts",
    "inspect:stdio": "npx @modelcontextprotocol/inspector node dist/mcp-stdio.js",
    "inspect:sse": "npx @modelcontextprotocol/inspector node dist/mcp-sse.js"
  }
}
```

## 5. Best Practices

1. **Error Handling**

   - Implement comprehensive error handling for external API calls
   - Return meaningful error messages to clients
   - Log errors appropriately

2. **Type Safety**

   - Use TypeScript interfaces for all data structures
   - Implement Zod schemas for parameter validation
   - Maintain strict TypeScript configuration

3. **Response Format**

   - Support multiple output formats (e.g., text and JSON)
   - Provide consistent response structures
   - Include appropriate content types

4. **Transport Management**

   - Maintain clean session management for SSE
   - Handle connection cleanup properly
   - Implement proper error handling for transport issues

5. **Development Workflow**
   - Use development scripts with `tsx` for quick iterations
   - Implement inspection capabilities for debugging
   - Maintain separate production and development configurations

## 6. Testing

1. Use the MCP Inspector for manual testing:

```bash
npx @modelcontextprotocol/inspector node dist/mcp-stdio.js
```

2. Test both transport methods:
   - STDIO for CLI usage
   - SSE for web integration

This specification provides a solid foundation for building MCP servers that can run both locally via STDIO and over the web via SSE. The implementation is type-safe, maintainable, and follows modern JavaScript/TypeScript practices.
