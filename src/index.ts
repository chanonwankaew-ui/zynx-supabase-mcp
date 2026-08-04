#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getHealth } from "./tools/health.js";
import { listAllowedTables } from "./tools/listAllowedTables.js";
import { queryTable, QueryTableInputSchema } from "./tools/queryTable.js";
import { searchMemory, SearchMemoryInputSchema } from "./tools/searchMemory.js";
import { addMemory, AddMemoryInputSchema } from "./tools/addMemory.js";
import { listWorkspaceFiles, ListWorkspaceFilesInputSchema } from "./tools/listWorkspaceFiles.js";
import { readWorkspaceFile, ReadWorkspaceFileInputSchema } from "./tools/readWorkspaceFile.js";

function textResult(payload: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(payload, null, 2)
      }
    ]
  };
}

const server = new McpServer({
  name: "zynx-supabase-mcp",
  version: "1.0.0"
});

server.registerTool(
  "get_agent_health",
  {
    title: "Get Zynx MCP Health",
    description: "Check whether the Zynx Supabase MCP server is alive and configured.",
    inputSchema: {}
  },
  async () => textResult(getHealth())
);

server.registerTool(
  "list_allowed_tables",
  {
    title: "List Allowed Supabase Tables",
    description: "List Supabase tables this MCP server is allowed to read.",
    inputSchema: {}
  },
  async () => textResult(listAllowedTables())
);

server.registerTool(
  "query_table",
  {
    title: "Query Supabase Table",
    description: "Read rows from an allowlisted Supabase table with optional equality filters.",
    inputSchema: QueryTableInputSchema.shape
  },
  async (input) => textResult(await queryTable(input))
);

server.registerTool(
  "search_memory",
  {
    title: "Search Zynx Memory",
    description: "Keyword search over an allowlisted Zynx memory table using ilike.",
    inputSchema: SearchMemoryInputSchema.shape
  },
  async (input) => textResult(await searchMemory(input))
);

server.registerTool(
  "add_memory",
  {
    title: "Add Zynx Memory",
    description: "Persist project, research, coding, or automation memory in an allowlisted Supabase table.",
    inputSchema: AddMemoryInputSchema.shape
  },
  async (input) => textResult(await addMemory(input))
);

server.registerTool(
  "list_workspace_files",
  {
    title: "List Workspace Files",
    description: "List files inside configured Zynx workspace roots for coding and automation tasks.",
    inputSchema: ListWorkspaceFilesInputSchema.shape
  },
  async (input) => textResult(await listWorkspaceFiles(input))
);

server.registerTool(
  "read_workspace_file",
  {
    title: "Read Workspace File",
    description: "Read a small text file inside configured Zynx workspace roots.",
    inputSchema: ReadWorkspaceFileInputSchema.shape
  },
  async (input) => textResult(await readWorkspaceFile(input))
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Zynx Supabase MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Zynx Supabase MCP Server failed:", error);
  process.exit(1);
});
