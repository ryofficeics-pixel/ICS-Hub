alter table public.routing_events enable row level security;

drop policy if exists "routing events public insert" on public.routing_events;
create policy "routing events authenticated insert"
on public.routing_events
for insert
to authenticated
with check (user_id = auth.uid());

grant insert on public.routing_events to authenticated;
revoke insert on public.routing_events from anon;

alter table public.audit_logs enable row level security;

drop policy if exists "audit read admin" on public.audit_logs;
create policy "audit read admin"
on public.audit_logs
for select
to authenticated
using (public.is_admin_or_higher());

drop policy if exists "audit insert own" on public.audit_logs;
create policy "audit insert own"
on public.audit_logs
for insert
to authenticated
with check (actor_user_id = auth.uid());

alter table public.project_memberships enable row level security;

drop policy if exists "memberships read own projects" on public.project_memberships;
create policy "memberships read own projects"
on public.project_memberships
for select
to authenticated
using (user_id = auth.uid() or public.is_admin_or_higher());

drop policy if exists "memberships manage admins" on public.project_memberships;
create policy "memberships manage admins"
on public.project_memberships
for all
to authenticated
using (public.is_admin_or_higher())
with check (public.is_admin_or_higher());

create or replace function public.current_app_role()
returns text
language sql
stable
set search_path = public
as $$
  select coalesce(
    (
      select role
      from public.user_profiles
      where coalesce(user_id, id) = auth.uid()
      limit 1
    ),
    'viewer'
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_app_role() = 'super_admin';
$$;

create or replace function public.is_admin_or_higher()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_app_role() in ('super_admin', 'admin');
$$;

create or replace function public.is_project_member(pid uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1 from public.project_memberships pm
    where pm.project_id = pid and pm.user_id = auth.uid()
  )
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = pid and pm.user_id = auth.uid()
  );
$$;

create or replace function public.project_role(pid uuid)
returns text
language sql
stable
set search_path = public
as $$
  select coalesce(
    (select role from public.project_memberships pm where pm.project_id = pid and pm.user_id = auth.uid() limit 1),
    (select role from public.project_members pm where pm.project_id = pid and pm.user_id = auth.uid() limit 1),
    'viewer'
  );
$$;

create or replace function public.can_manage_project_data(pid uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select public.is_admin_or_higher()
      or public.project_role(pid) in ('admin', 'supervisor');
$$;

create or replace function public.can_read_project_data(pid uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select public.is_admin_or_higher() or public.is_project_member(pid);
$$;
