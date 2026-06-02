-- Patch the live Tools Hub registry so dashboard buttons open the online
-- ICS Office Tools routes. Run this in Supabase SQL Editor with an admin role.

insert into public.tools (id, name, description, category, type, status, required_role, url, disabled, sort_order)
values
  ('absensi-online', 'Absensi Online', 'Attendance check-in, check-out, location status, and daily presence records.', 'Attendance', 'Online', 'Live', 'staff', 'https://ics-office-tools-deploy.vercel.app/tools/absensi-karyawan', false, 10),
  ('absensi-admin', 'Absensi Admin', 'Attendance administration console for review, correction, and export operations.', 'Attendance', 'Online', 'Live', 'admin', 'https://ics-office-tools-deploy.vercel.app/tools/absensi-admin', false, 15),
  ('auto-report-progress', 'Auto Report Progress', 'Daily progress input for site activity, notes, issues, and photo documentation.', 'Reports', 'Online', 'Live', 'staff', 'https://ics-office-tools-deploy.vercel.app/tools/daily-report', false, 20),
  ('survey-report', 'Survey Report', 'Survey documentation, field observations, sketches, photos, and export-ready reports.', 'Reports', 'Online', 'Stable', 'staff', 'https://ics-office-tools-deploy.vercel.app/tools/survey-report', false, 30),
  ('weekly-report', 'Weekly Report', 'Weekly project summary by selected project, week number, and reporting period.', 'Reports', 'Online', 'Stable', 'staff', 'https://ics-office-tools-deploy.vercel.app/tools/progress-report', false, 40),
  ('project-database', 'Project Database', 'Central project reference for names, locations, owners, estimators, and teams.', 'Projects', 'Local-ready', 'Stable', 'supervisor', 'https://ics-office-tools-deploy.vercel.app/tools/daily-report', false, 50),
  ('photo-documentation', 'Photo Documentation', 'Field photo review and documentation launcher for report attachments.', 'Documentation', 'Local-ready', 'Ready', 'staff', 'https://ics-office-tools-deploy.vercel.app/tools/survey-report', false, 60),
  ('roi-simulator', 'ROI Simulator', 'Property and project return simulation for planning and investment review.', 'Finance', 'Unavailable', 'No Route', 'supervisor', '', true, 65),
  ('rab-helper', 'RAB Helper', 'Budget helper and estimation support for operational project costing.', 'Finance', 'Online', 'Beta', 'supervisor', 'https://ics-office-tools-deploy.vercel.app/tools/estimator', false, 70),
  ('kalkulator-pembesian', 'Kalkulator Pembesian', 'Concrete reinforcement calculator from the online ICS Office Tools deployment.', 'Finance', 'Online', 'Live', 'staff', 'https://ics-office-tools-deploy.vercel.app/tools/kalkulator-pembesian', false, 72),
  ('module-generator', 'Module Generator', 'Generate and manage module templates and floor-panel tool flows.', 'Utilities', 'Online', 'Live', 'admin', 'https://ics-office-tools-deploy.vercel.app/tools/module-generator', false, 75),
  ('staff-task-tracker', 'Staff Task Tracker', 'Track staff assignments, open items, and operational follow-up tasks.', 'Operations', 'Planned', 'Maintenance', 'supervisor', '', true, 80),
  ('backup-restore', 'Backup Restore', 'Local data backup and restore guide for device transfer and emergency recovery.', 'Utilities', 'Local-ready', 'Ready', 'staff', 'https://ics-office-tools-deploy.vercel.app', false, 90),
  ('utilities', 'Utilities', 'Small supporting tools, converters, and operational shortcuts.', 'Utilities', 'Local-ready', 'Beta', 'staff', 'https://ics-office-tools-deploy.vercel.app/tools/module-generator', false, 100)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  type = excluded.type,
  status = excluded.status,
  required_role = excluded.required_role,
  url = excluded.url,
  disabled = excluded.disabled,
  sort_order = excluded.sort_order;

insert into public.tool_aliases (tool_id, alias)
values
  ('kalkulator-pembesian', 'pembesian'),
  ('kalkulator-pembesian', 'besi')
on conflict (tool_id, alias) do nothing;
