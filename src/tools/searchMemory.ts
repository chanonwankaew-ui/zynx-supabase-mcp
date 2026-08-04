import { z } from "zod";
import { env } from "../lib/env.js";
import { supabase } from "../lib/supabase.js";
import { auditToolCall } from "../lib/audit.js";

export const SearchMemoryInputSchema = z.object({
  query: z.string().min(1).describe("Keyword to search in Zynx memory content."),
  tableName: z.string().default("zynx_memory").describe("Allowlisted memory table."),
  contentColumn: z.string().default("content").describe("Column containing searchable text."),
  limit: z.number().int().min(1).max(50).default(10)
});

export type SearchMemoryInput = z.infer<typeof SearchMemoryInputSchema>;

export async function searchMemory(input: SearchMemoryInput) {
  const parsed = SearchMemoryInputSchema.parse(input);
  const { tableName, contentColumn, query, limit } = parsed;

  if (!env.allowedTables.has(tableName)) {
    await auditToolCall({
      tool: "search_memory",
      status: "denied",
      tableName,
      details: { reason: "table_not_allowlisted" }
    });

    return {
      success: false,
      error: `Table "${tableName}" is not allowlisted.`
    };
  }

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .ilike(contentColumn, `%${query}%`)
    .limit(limit);

  if (error) {
    await auditToolCall({
      tool: "search_memory",
      status: "error",
      tableName,
      details: { error: error.message }
    });

    return {
      success: false,
      error: error.message
    };
  }

  await auditToolCall({
    tool: "search_memory",
    status: "success",
    tableName,
    details: { query, contentColumn, limit }
  });

  return {
    success: true,
    tableName,
    query,
    limit,
    rows: data
  };
}
