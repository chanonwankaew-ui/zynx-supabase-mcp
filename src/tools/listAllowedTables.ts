import { env } from "../lib/env.js";

export function listAllowedTables() {
  return {
    success: true,
    environment: env.zynxEnv,
    allowedTables: [...env.allowedTables].sort(),
    defaultLimit: env.defaultLimit,
    maxLimit: env.maxLimit,
    auditEnabled: env.enableAudit,
    auditTable: env.auditTable,
    workspaceRoots: env.workspaceRoots
  };
}
