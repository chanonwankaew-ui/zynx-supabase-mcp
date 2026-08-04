-- Optional starter schema for Zynx MCP audit, orchestration, and memory/RAG.
-- Run manually in Supabase SQL editor only if these tables do not exist yet.

create extension if not exists vector;

create table if not exists public.zynx_audit_logs (
  id uuid primary key default gen_random_uuid(),
  environment text not null default 'development',
  event_type text not null,
  tool_name text,
  status text,
  table_name text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.zynx_memory (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  environment text not null default 'development',
  kind text not null default 'note',
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.zynx_projects (
  id uuid primary key default gen_random_uuid(),
  environment text not null default 'development',
  name text not null,
  status text not null default 'active',
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.zynx_project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.zynx_projects(id) on delete cascade,
  environment text not null default 'development',
  title text not null,
  status text not null default 'todo',
  priority integer not null default 3,
  assigned_agent text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.zynx_tool_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.zynx_projects(id) on delete set null,
  environment text not null default 'development',
  agent_name text,
  tool_name text not null,
  status text not null,
  input jsonb default '{}'::jsonb,
  output jsonb default '{}'::jsonb,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.zynx_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.zynx_projects(id) on delete set null,
  environment text not null default 'development',
  source text not null default 'filesystem',
  source_uri text not null,
  title text,
  content text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.zynx_vectors (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.zynx_documents(id) on delete cascade,
  project_id uuid references public.zynx_projects(id) on delete set null,
  environment text not null default 'development',
  chunk_text text not null,
  embedding vector(1536),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.zynx_audit_logs enable row level security;
alter table public.zynx_memory enable row level security;
alter table public.zynx_projects enable row level security;
alter table public.zynx_project_tasks enable row level security;
alter table public.zynx_tool_runs enable row level security;
alter table public.zynx_documents enable row level security;
alter table public.zynx_vectors enable row level security;

create index if not exists zynx_memory_project_idx on public.zynx_memory(project_id);
create index if not exists zynx_memory_kind_idx on public.zynx_memory(kind);
create index if not exists zynx_project_tasks_project_idx on public.zynx_project_tasks(project_id);
create index if not exists zynx_tool_runs_project_idx on public.zynx_tool_runs(project_id);
create index if not exists zynx_documents_project_idx on public.zynx_documents(project_id);
create index if not exists zynx_vectors_project_idx on public.zynx_vectors(project_id);

-- RLS is enabled without public policies by default.
-- Use service-side MCP access for dev. For staging/production, prefer restricted RPC
-- functions or owner-scoped policies before exposing any table to clients.
