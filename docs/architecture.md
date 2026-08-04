# Zynx MCP Architecture

## Phase 1 Scope

Start with a development profile while keeping the runtime shape compatible with staging and production.

- Runtime: TypeScript MCP server over stdio
- Data: Supabase for projects, tasks, memory, documents, vectors, and audit logs
- Files: local filesystem tools scoped by `ZYNX_WORKSPACE_ROOTS`
- AI tools: exposed through MCP tool calling; model/provider integration can be added behind the same tool boundary
- Repo: personal GitHub repository first
- Deferred: Google Drive ingestion and sync

## Environments

Use one `.env` file per environment and never commit real secrets.

- Development: one existing Supabase project is acceptable, with `environment = development` in rows
- Staging: separate keys and ideally a separate Supabase project before external testing
- Production: separate project, restricted server-side key or RPC-only access, smaller limits, audit enabled

The code reads `ZYNX_ENV` and includes it in health responses. Tables include an `environment` column so data can be separated even before projects are split.

## Agent Responsibilities

- Project orchestration: `zynx_projects`, `zynx_project_tasks`
- Memory/RAG: `zynx_memory`, `zynx_documents`, `zynx_vectors`
- Research: memory + document records now; web/search connectors later
- Coding: filesystem list/read tools now; write/patch tools should be added only with explicit guardrails
- Automation: `zynx_tool_runs` plus audit logs
- Tool calling: MCP tools provide the stable interface

## Initial Scale

Target scale is 1-3 users and 100-1,000 tool calls per day.

This supports simple Supabase tables, narrow query limits, and append-only audit/tool-run logging. Add queues only when tool calls become long-running or concurrent execution starts to matter.

## Security Boundaries

- Keep `SUPABASE_KEY` server-side only.
- Keep `ZYNX_ALLOWED_TABLES` narrow.
- Keep filesystem access restricted to `ZYNX_WORKSPACE_ROOTS`.
- Enable RLS on all public tables.
- Prefer read-only/RPC access in production instead of broad service role access.
- Do not add Google Drive until local file indexing and memory behavior are stable.
