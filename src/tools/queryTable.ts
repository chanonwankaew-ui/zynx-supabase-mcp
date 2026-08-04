import { z } from "zod";
import { env } from "../lib/env.js";
import { supabase } from "../lib/supabase.js";
import { auditToolCall } from "../lib/audit.js";

export const QueryTableInputSchema = z.object({
  tableName: z.string().min(1).describe("Allowlisted Supabase table name."),
  select: z.string().default("*").describe("PostgREST select string. Default: *."),
  limit: z.number().int().min(1).optional().describe("Rows to return. Capped by ZYNX_MAX_LIMIT."),
  orderBy: z.string().optional().describe("Optional column for descending order."),
  filters: z
    .record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional()
    .describe("Simple equality filters: { column: value }.")
});

export type QueryTableInput = z.infer<typeof QueryTableInputSchema>;

function clampLimit(limit: number | undefined): number {
  const requested = limit ?? env.defaultLimit;
  return Math.min(Math.max(requested, 1), env.maxLimit);
}

function isUnsafeIdentifier(value: string): boolean {
  return /[;]|--|\/\*|\*\//.test(value);
}

export async function queryTable(input: QueryTableInput) {
  const parsed = QueryTableInputSchema.parse(input);
  const { tableName, select, orderBy, filters } = parsed;
  const limit = clampLimit(parsed.limit);

  if (!env.allowedTables.has(tableName)) {
    await auditToolCall({
      tool: "query_table",
      status: "denied",
      tableName,
      details: { reason: "table_not_allowlisted" }
    });

    return {
      success: false,
      error: `Table "${tableName}" is not allowlisted.`
    };
  }

  if (isUnsafeIdentifier(tableName) || isUnsafeIdentifier(select) || (orderBy && isUnsafeIdentifier(orderBy))) {
    await auditToolCall({
      tool: "query_table",
      status: "denied",
      tableName,
      details: { reason: "unsafe_identifier" }
    });

    return {
      success: false,
      error: "Rejected unsafe table/select/orderBy input."
    };
  }

  let query = supabase.from(tableName).select(select).limit(limit);

  if (orderBy) {
    query = query.order(orderBy, { ascending: false });
  }

  if (filters) {
    for (const [column, value] of Object.entries(filters)) {
      if (isUnsafeIdentifier(column)) {
        return {
          success: false,
          error: `Rejected unsafe filter column: ${column}`
        };
      }
      query = query.eq(column, value);
    }
  }

  const { data, error, count } = await query;

  if (error) {
    await auditToolCall({
      tool: "query_table",
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
    tool: "query_table",
    status: "success",
    tableName,
    details: { limit, select, filters: filters ?? null, orderBy: orderBy ?? null }
  });

  return {
    success: true,
    tableName,
    limit,
    count: count ?? (Array.isArray(data) ? data.length : null),
    rows: data
  };
}
