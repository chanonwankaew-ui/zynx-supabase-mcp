import { z } from "zod";
import { auditToolCall } from "../lib/audit.js";
import { env } from "../lib/env.js";
import { supabase } from "../lib/supabase.js";

export const AddMemoryInputSchema = z.object({
  content: z.string().min(1).describe("Memory text to persist."),
  tableName: z.string().default("zynx_memory").describe("Allowlisted memory table."),
  projectId: z.string().uuid().optional(),
  kind: z.string().default("note"),
  metadata: z.record(z.unknown()).default({})
});

export type AddMemoryInput = z.infer<typeof AddMemoryInputSchema>;

export async function addMemory(input: AddMemoryInput) {
  const parsed = AddMemoryInputSchema.parse(input);

  if (!env.allowedTables.has(parsed.tableName)) {
    await auditToolCall({
      tool: "add_memory",
      status: "denied",
      tableName: parsed.tableName,
      details: { reason: "table_not_allowlisted" }
    });

    return { success: false, error: `Table "${parsed.tableName}" is not allowlisted.` };
  }

  const { data, error } = await supabase
    .from(parsed.tableName)
    .insert({
      environment: env.zynxEnv,
      content: parsed.content,
      project_id: parsed.projectId ?? null,
      kind: parsed.kind,
      metadata: parsed.metadata
    })
    .select("*")
    .single();

  if (error) {
    await auditToolCall({
      tool: "add_memory",
      status: "error",
      tableName: parsed.tableName,
      details: { error: error.message }
    });

    return { success: false, error: error.message };
  }

  await auditToolCall({
    tool: "add_memory",
    status: "success",
    tableName: parsed.tableName,
    details: { kind: parsed.kind, projectId: parsed.projectId ?? null }
  });

  return { success: true, row: data };
}
