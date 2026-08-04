import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function numberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (!raw) return fallback;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

function listEnv(name: string, fallback: string[] = []): string[] {
  return (process.env[name] ?? fallback.join(","))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

const zynxEnv = process.env.ZYNX_ENV?.trim() || "development";

export const env = {
  zynxEnv,
  supabaseUrl: required("SUPABASE_URL"),
  supabaseKey: required("SUPABASE_KEY"),
  allowedTables: new Set(listEnv("ZYNX_ALLOWED_TABLES")),
  defaultLimit: numberEnv("ZYNX_DEFAULT_LIMIT", 10),
  maxLimit: numberEnv("ZYNX_MAX_LIMIT", 100),
  auditTable: process.env.ZYNX_AUDIT_TABLE?.trim() || "zynx_audit_logs",
  enableAudit: boolEnv("ZYNX_ENABLE_AUDIT", true),
  workspaceRoots: listEnv("ZYNX_WORKSPACE_ROOTS", [process.cwd()]),
  maxFileBytes: numberEnv("ZYNX_MAX_FILE_BYTES", 200_000)
};

if (env.allowedTables.size === 0) {
  throw new Error("ZYNX_ALLOWED_TABLES must contain at least one table name.");
}
