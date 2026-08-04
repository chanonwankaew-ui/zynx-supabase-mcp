import { env } from "../lib/env.js";

export function getHealth() {
  return {
    success: true,
    server: "zynx-supabase-mcp",
    version: "1.0.0",
    environment: env.zynxEnv,
    transport: "stdio",
    supabaseUrlConfigured: Boolean(env.supabaseUrl),
    allowedTableCount: env.allowedTables.size,
    workspaceRootCount: env.workspaceRoots.length,
    auditEnabled: env.enableAudit,
    timestamp: new Date().toISOString()
  };
}
