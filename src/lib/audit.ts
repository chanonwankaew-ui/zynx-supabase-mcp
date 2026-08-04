import { env } from "./env.js";
import { supabase } from "./supabase.js";

export type AuditStatus = "success" | "error" | "denied";

export async function auditToolCall(input: {
  tool: string;
  status: AuditStatus;
  tableName?: string;
  details?: Record<string, unknown>;
}) {
  if (!env.enableAudit) return;
  if (!env.allowedTables.has(env.auditTable)) return;

  try {
    await supabase.from(env.auditTable).insert({
      environment: env.zynxEnv,
      event_type: "mcp_tool_call",
      tool_name: input.tool,
      status: input.status,
      table_name: input.tableName ?? null,
      details: input.details ?? {},
      created_at: new Date().toISOString()
    });
  } catch {
    // Never break a tool call because audit logging failed.
  }
}
