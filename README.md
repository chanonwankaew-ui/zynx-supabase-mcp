# Zynx Supabase MCP Server

Real TypeScript MCP server for connecting Zynx agents to Supabase through safe, allowlisted tools.

## Tools

- `get_agent_health` — check MCP server health
- `list_allowed_tables` — show table allowlist and limits
- `query_table` — read rows from allowlisted Supabase tables
- `search_memory` — keyword search over Zynx memory table
- `add_memory` — persist project, research, coding, or automation memory
- `list_workspace_files` — list files under configured workspace roots
- `read_workspace_file` — read small text files under configured workspace roots

## Install

```bash
cd zynx-supabase-mcp
cp .env.example .env
npm install
npm run build
npm start
```

## Required `.env`

```env
ZYNX_ENV=development
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_SERVICE_ROLE_OR_SERVER_KEY
ZYNX_ALLOWED_TABLES=zynx_projects,zynx_project_tasks,zynx_memory,zynx_audit_logs,zynx_documents,zynx_vectors,zynx_tool_runs
ZYNX_DEFAULT_LIMIT=10
ZYNX_MAX_LIMIT=100
ZYNX_AUDIT_TABLE=zynx_audit_logs
ZYNX_ENABLE_AUDIT=true
ZYNX_WORKSPACE_ROOTS=/Users/kant/zynx-supabase-mcp
ZYNX_MAX_FILE_BYTES=200000
```

Use `.env.staging.example` and `.env.production.example` as profile templates when those environments are created.

## Gemini CLI registration

Option A: command line:

```bash
gemini mcp add zynx-supabase node /ABSOLUTE/PATH/TO/zynx-supabase-mcp/dist/index.js
```

Option B: copy `config/gemini-settings.example.json` into your Gemini CLI settings and replace values.

## Test prompts

```text
Use get_agent_health from zynx-supabase.
```

```text
Use list_allowed_tables from zynx-supabase.
```

```text
Use query_table to read 5 rows from zynx_memory.
```

```text
Search Zynx memory for MCP architecture.
```

```text
List workspace files from /Users/kant/zynx-supabase-mcp.
```

```text
Add this project decision to Zynx memory.
```

## Security rules

- Never expose `SUPABASE_KEY` in frontend code.
- Keep `.env` out of git.
- Keep `ZYNX_ALLOWED_TABLES` narrow.
- Keep `ZYNX_MAX_LIMIT` small.
- Prefer read-only database roles/RPC in production.
- Enable Supabase RLS where possible.

## Optional Supabase starter schema

See:

```text
supabase/schema.example.sql
```

It creates starter tables for:

- `zynx_audit_logs`
- `zynx_memory`
- `zynx_projects`
- `zynx_project_tasks`
- `zynx_tool_runs`
- `zynx_documents`
- `zynx_vectors`

See `docs/architecture.md` for the dev-first plan that still supports staging and production.

## Helper script

After `npm run build`:

```bash
./scripts/register-gemini.sh
```
