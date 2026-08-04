import { z } from "zod";
import { auditToolCall } from "../lib/audit.js";
import { env } from "../lib/env.js";
import { supabase } from "../lib/supabase.js";

const PROJECTS_TABLE = "zynx_projects";

export const CreateProjectInputSchema = z.object({
  name: z.string().min(1).describe("Project name."),
  description: z.string().optional().describe("Optional project description."),
  status: z.string().default("active").describe("Project status, usually active/paused/archived."),
  metadata: z.record(z.unknown()).default({})
});

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

export async function createProject(input: CreateProjectInput) {
  const parsed = CreateProjectInputSchema.parse(input);

  if (!env.allowedTables.has(PROJECTS_TABLE)) {
    await auditToolCall({
      tool: "create_project",
      status: "denied",
      tableName: PROJECTS_TABLE,
      details: { reason: "table_not_allowlisted" }
    });

    return { success: false, error: `Table "${PROJECTS_TABLE}" is not allowlisted.` };
  }

  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .insert({
      environment: env.zynxEnv,
      name: parsed.name,
      description: parsed.description ?? null,
      status: parsed.status,
      metadata: parsed.metadata
    })
    .select("*")
    .single();

  if (error) {
    await auditToolCall({
      tool: "create_project",
      status: "error",
      tableName: PROJECTS_TABLE,
      details: { error: error.message }
    });

    return { success: false, error: error.message };
  }

  await auditToolCall({
    tool: "create_project",
    status: "success",
    tableName: PROJECTS_TABLE,
    details: { projectId: data.id, name: parsed.name, status: parsed.status }
  });

  return { success: true, row: data };
}
