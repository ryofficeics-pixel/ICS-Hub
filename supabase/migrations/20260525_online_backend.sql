create extension if not exists pgcrypto;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'user_id'
  ) then
    alter table public.user_profiles rename column id to user_id;
  end if;
end $$;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'viewer' check (role in ('super_admin', 'admin', 'supervisor', 'staff', 'viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  project_code text unique,
  name text not null,
  location text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_memberships (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('admin', 'supervisor', 'staff', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  report_date date not null,
  title text,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  client_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  week_start date not null,
  summary text,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  client_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.survey_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  survey_date date not null,
  location text,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  client_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  attendance_time timestamptz not null default now(),
  attendance_type text not null check (attendance_type in ('check_in', 'check_out')),
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  address text,
  payload jsonb not null default '{}'::jsonb,
  client_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  module text not null check (module in ('daily', 'weekly', 'survey', 'attendance')),
  related_record_id uuid,
  public_id text not null,
  secure_url text not null,
  resource_type text not null,
  folder text,
  caption text,
  metadata jsonb not null default '{}'::jsonb,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  action text not null,
  module text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.sync_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  module text not null,
  local_id text,
  remote_id text,
  action text not null,
  status text not null default 'pending' check (status in ('pending', 'synced', 'failed', 'conflict')),
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  attempts int not null default 0,
  last_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tools add column if not exists required_role text check (required_role in ('super_admin', 'admin', 'supervisor', 'staff', 'viewer'));
alter table public.routing_events add column if not exists user_id uuid references auth.users(id);

create index if not exists idx_daily_reports_project_date on public.daily_reports(project_id, report_date desc);
create index if not exists idx_weekly_reports_project_week on public.weekly_reports(project_id, week_start desc);
create index if not exists idx_survey_reports_project_date on public.survey_reports(project_id, survey_date desc);
create index if not exists idx_attendance_user_time on public.attendance_records(user_id, attendance_time desc);
create index if not exists idx_media_module_record on public.media_files(module, related_record_id);
create index if not exists idx_sync_events_user_status on public.sync_events(user_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at before update on public.user_profiles for each row execute function public.set_updated_at();
drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists trg_daily_reports_updated_at on public.daily_reports;
create trigger trg_daily_reports_updated_at before update on public.daily_reports for each row execute function public.set_updated_at();
drop trigger if exists trg_weekly_reports_updated_at on public.weekly_reports;
create trigger trg_weekly_reports_updated_at before update on public.weekly_reports for each row execute function public.set_updated_at();
drop trigger if exists trg_survey_reports_updated_at on public.survey_reports;
create trigger trg_survey_reports_updated_at before update on public.survey_reports for each row execute function public.set_updated_at();
drop trigger if exists trg_attendance_records_updated_at on public.attendance_records;
create trigger trg_attendance_records_updated_at before update on public.attendance_records for each row execute function public.set_updated_at();
drop trigger if exists trg_sync_events_updated_at on public.sync_events;
create trigger trg_sync_events_updated_at before update on public.sync_events for each row execute function public.set_updated_at();

create or replace function public.current_app_role()
returns text
language sql
stable
as $$
  select coalesce((select role from public.user_profiles where user_id = auth.uid()), 'viewer');
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select public.current_app_role() = 'super_admin';
$$;

create or replace function public.is_admin_or_higher()
returns boolean
language sql
stable
as $$
  select public.current_app_role() in ('super_admin', 'admin');
$$;

create or replace function public.is_project_member(pid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.project_memberships pm
    where pm.project_id = pid
      and pm.user_id = auth.uid()
  );
$$;

create or replace function public.project_role(pid uuid)
returns text
language sql
stable
as $$
  select coalesce(
    (select role from public.project_memberships pm where pm.project_id = pid and pm.user_id = auth.uid()),
    'viewer'
  );
$$;

create or replace function public.can_manage_project_data(pid uuid)
returns boolean
language sql
stable
as $$
  select public.is_admin_or_higher()
      or public.project_role(pid) in ('admin', 'supervisor');
$$;

create or replace function public.can_read_project_data(pid uuid)
returns boolean
language sql
stable
as $$
  select public.is_admin_or_higher() or public.is_project_member(pid);
$$;

alter table public.user_profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_memberships enable row level security;
alter table public.daily_reports enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.survey_reports enable row level security;
alter table public.attendance_records enable row level security;
alter table public.media_files enable row level security;
alter table public.audit_logs enable row level security;
alter table public.sync_events enable row level security;

drop policy if exists "profiles read self or admin" on public.user_profiles;
create policy "profiles read self or admin" on public.user_profiles
for select to authenticated
using (user_id = auth.uid() or public.is_admin_or_higher());

drop policy if exists "profiles update self or super_admin" on public.user_profiles;
create policy "profiles update self or super_admin" on public.user_profiles
for update to authenticated
using (user_id = auth.uid() or public.is_super_admin())
with check (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "profiles insert self or admin" on public.user_profiles;
create policy "profiles insert self or admin" on public.user_profiles
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin_or_higher());

drop policy if exists "projects read members" on public.projects;
create policy "projects read members" on public.projects
for select to authenticated
using (public.can_read_project_data(id));

drop policy if exists "projects manage admin" on public.projects;
create policy "projects manage admin" on public.projects
for all to authenticated
using (public.is_admin_or_higher())
with check (public.is_admin_or_higher());

drop policy if exists "memberships read own projects" on public.project_memberships;
create policy "memberships read own projects" on public.project_memberships
for select to authenticated
using (user_id = auth.uid() or public.is_admin_or_higher());

drop policy if exists "memberships manage admins" on public.project_memberships;
create policy "memberships manage admins" on public.project_memberships
for all to authenticated
using (public.is_admin_or_higher())
with check (public.is_admin_or_higher());

drop policy if exists "daily read project" on public.daily_reports;
create policy "daily read project" on public.daily_reports
for select to authenticated
using (public.can_read_project_data(project_id));

drop policy if exists "daily insert project" on public.daily_reports;
create policy "daily insert project" on public.daily_reports
for insert to authenticated
with check (
  public.can_manage_project_data(project_id)
  or (public.project_role(project_id) = 'staff' and created_by = auth.uid())
);

drop policy if exists "daily update project" on public.daily_reports;
create policy "daily update project" on public.daily_reports
for update to authenticated
using (
  public.can_manage_project_data(project_id)
  or (public.project_role(project_id) = 'staff' and created_by = auth.uid())
)
with check (
  public.can_manage_project_data(project_id)
  or (public.project_role(project_id) = 'staff' and created_by = auth.uid())
);

drop policy if exists "weekly read project" on public.weekly_reports;
create policy "weekly read project" on public.weekly_reports
for select to authenticated
using (public.can_read_project_data(project_id));

drop policy if exists "weekly insert supervisors" on public.weekly_reports;
create policy "weekly insert supervisors" on public.weekly_reports
for insert to authenticated
with check (public.can_manage_project_data(project_id));

drop policy if exists "weekly update supervisors" on public.weekly_reports;
create policy "weekly update supervisors" on public.weekly_reports
for update to authenticated
using (public.can_manage_project_data(project_id))
with check (public.can_manage_project_data(project_id));

drop policy if exists "survey read project" on public.survey_reports;
create policy "survey read project" on public.survey_reports
for select to authenticated
using (public.can_read_project_data(project_id));

drop policy if exists "survey insert project" on public.survey_reports;
create policy "survey insert project" on public.survey_reports
for insert to authenticated
with check (
  public.can_manage_project_data(project_id)
  or (public.project_role(project_id) = 'staff' and created_by = auth.uid())
);

drop policy if exists "survey update project" on public.survey_reports;
create policy "survey update project" on public.survey_reports
for update to authenticated
using (
  public.can_manage_project_data(project_id)
  or (public.project_role(project_id) = 'staff' and created_by = auth.uid())
)
with check (
  public.can_manage_project_data(project_id)
  or (public.project_role(project_id) = 'staff' and created_by = auth.uid())
);

drop policy if exists "attendance read own or admin" on public.attendance_records;
create policy "attendance read own or admin" on public.attendance_records
for select to authenticated
using (user_id = auth.uid() or public.is_admin_or_higher() or public.can_read_project_data(project_id));

drop policy if exists "attendance insert own" on public.attendance_records;
create policy "attendance insert own" on public.attendance_records
for insert to authenticated
with check (
  user_id = auth.uid()
  and (project_id is null or public.can_read_project_data(project_id))
);

drop policy if exists "attendance update own_or_admin" on public.attendance_records;
create policy "attendance update own_or_admin" on public.attendance_records
for update to authenticated
using (user_id = auth.uid() or public.is_admin_or_higher())
with check (user_id = auth.uid() or public.is_admin_or_higher());

drop policy if exists "media read project" on public.media_files;
create policy "media read project" on public.media_files
for select to authenticated
using (project_id is null or public.can_read_project_data(project_id));

drop policy if exists "media insert uploader" on public.media_files;
create policy "media insert uploader" on public.media_files
for insert to authenticated
with check (uploaded_by = auth.uid() and (project_id is null or public.can_read_project_data(project_id)));

drop policy if exists "media update admin_or_uploader" on public.media_files;
create policy "media update admin_or_uploader" on public.media_files
for update to authenticated
using (uploaded_by = auth.uid() or public.is_admin_or_higher())
with check (uploaded_by = auth.uid() or public.is_admin_or_higher());

drop policy if exists "audit read admin" on public.audit_logs;
create policy "audit read admin" on public.audit_logs
for select to authenticated
using (public.is_admin_or_higher());

drop policy if exists "audit insert own" on public.audit_logs;
create policy "audit insert own" on public.audit_logs
for insert to authenticated
with check (actor_user_id = auth.uid());

drop policy if exists "sync read own" on public.sync_events;
create policy "sync read own" on public.sync_events
for select to authenticated
using (user_id = auth.uid() or public.is_admin_or_higher());

drop policy if exists "sync insert own" on public.sync_events;
create policy "sync insert own" on public.sync_events
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "sync update own" on public.sync_events;
create policy "sync update own" on public.sync_events
for update to authenticated
using (user_id = auth.uid() or public.is_admin_or_higher())
with check (user_id = auth.uid() or public.is_admin_or_higher());
