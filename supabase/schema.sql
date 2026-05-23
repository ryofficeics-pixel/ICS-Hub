create extension if not exists pgcrypto;

create table if not exists public.tools (
  id text primary key,
  name text not null,
  description text not null default '',
  category text not null default 'Utilities',
  type text not null default 'Online',
  status text not null default 'Live',
  url text,
  disabled boolean not null default false,
  sort_order int not null default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tool_aliases (
  id uuid primary key default gen_random_uuid(),
  tool_id text references public.tools(id) on delete cascade,
  alias text not null,
  created_at timestamptz default now(),
  unique (tool_id, alias)
);

create table if not exists public.routing_events (
  id uuid primary key default gen_random_uuid(),
  tool_id text,
  tool_name text,
  url text,
  user_agent text,
  created_at timestamptz default now()
);

create table if not exists public.user_profiles (
  id uuid primary key,
  email text,
  display_name text,
  role text default 'viewer',
  created_at timestamptz default now()
);

create table if not exists public.tool_access (
  id uuid primary key default gen_random_uuid(),
  tool_id text references public.tools(id) on delete cascade,
  role text not null,
  can_open boolean default true
);

create or replace function public.set_tools_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tools_set_updated_at on public.tools;
create trigger tools_set_updated_at
before update on public.tools
for each row execute function public.set_tools_updated_at();

alter table public.tools enable row level security;
alter table public.tool_aliases enable row level security;
alter table public.routing_events enable row level security;
alter table public.user_profiles enable row level security;
alter table public.tool_access enable row level security;

grant select on public.tools to anon, authenticated;
grant select on public.tool_aliases to anon, authenticated;
grant insert on public.routing_events to anon, authenticated;

drop policy if exists "tools public read" on public.tools;
create policy "tools public read"
on public.tools
for select
to anon, authenticated
using (true);

drop policy if exists "tool aliases public read" on public.tool_aliases;
create policy "tool aliases public read"
on public.tool_aliases
for select
to anon, authenticated
using (true);

drop policy if exists "routing events public insert" on public.routing_events;
create policy "routing events public insert"
on public.routing_events
for insert
to anon, authenticated
with check (true);

