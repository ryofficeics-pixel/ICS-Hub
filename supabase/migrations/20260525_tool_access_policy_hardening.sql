alter table public.tool_access enable row level security;

drop policy if exists "tool_access read authenticated" on public.tool_access;
create policy "tool_access read authenticated"
on public.tool_access
for select
to authenticated
using (true);

drop policy if exists "tool_access manage admin" on public.tool_access;
create policy "tool_access manage admin"
on public.tool_access
for all
to authenticated
using (public.is_admin_or_higher())
with check (public.is_admin_or_higher());
