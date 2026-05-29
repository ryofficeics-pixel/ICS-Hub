do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_role_check'
      and conrelid = 'public.user_profiles'::regclass
  ) then
    alter table public.user_profiles drop constraint user_profiles_role_check;
  end if;
end $$;

alter table public.user_profiles
  add constraint user_profiles_role_check
  check (
    role in (
      'super_admin',
      'admin',
      'supervisor',
      'staff',
      'viewer',
      'project_manager',
      'field_user'
    )
  );
