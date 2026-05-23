insert into public.tools (id, name, description, category, type, status, url, disabled, sort_order)
values
  ('absensi-online', 'Absensi Online', 'Attendance check-in, check-out, location status, and daily presence records.', 'Attendance', 'Online', 'Live', 'https://ics-office-tools-deploy.vercel.app/tools/absensi-karyawan', false, 10),
  ('auto-report-progress', 'Auto Report Progress', 'Daily progress input for site activity, notes, issues, and photo documentation.', 'Reports', 'Online', 'Live', 'https://ics-office-tools-deploy.vercel.app/tools/daily-report', false, 20),
  ('survey-report', 'Survey Report', 'Survey documentation, field observations, sketches, photos, and export-ready reports.', 'Reports', 'Online', 'Stable', 'https://ics-office-tools-deploy.vercel.app/tools/survey', false, 30),
  ('weekly-report', 'Weekly Report', 'Weekly project summary by selected project, week number, and reporting period.', 'Reports', 'Online', 'Stable', 'https://ics-office-tools-deploy.vercel.app/tools/weekly-report', false, 40),
  ('project-database', 'Project Database', 'Central project reference for names, locations, owners, estimators, and teams.', 'Projects', 'Local-ready', 'Stable', 'https://ics-office-tools-deploy.vercel.app/tools/proyek', false, 50),
  ('photo-documentation', 'Photo Documentation', 'Field photo review and documentation launcher for report attachments.', 'Documentation', 'Local-ready', 'Ready', 'https://ics-office-tools-deploy.vercel.app/tools/proyek', false, 60),
  ('rab-helper', 'RAB Helper', 'Budget helper and estimation support for operational project costing.', 'Finance', 'Local', 'Beta', 'https://ics-office-tools-deploy.vercel.app/tools/future-tools', false, 70),
  ('staff-task-tracker', 'Staff Task Tracker', 'Track staff assignments, open items, and operational follow-up tasks.', 'Operations', 'Planned', 'Maintenance', '', true, 80),
  ('backup-restore', 'Backup Restore', 'Local data backup and restore guide for device transfer and emergency recovery.', 'Utilities', 'Local-ready', 'Ready', 'https://ics-office-tools-deploy.vercel.app/tools/backup', false, 90),
  ('utilities', 'Utilities', 'Small supporting tools, converters, and operational shortcuts.', 'Utilities', 'Local-ready', 'Beta', 'https://ics-office-tools-deploy.vercel.app/tools/future-tools', false, 100)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  type = excluded.type,
  status = excluded.status,
  url = excluded.url,
  disabled = excluded.disabled,
  sort_order = excluded.sort_order;

insert into public.tool_aliases (tool_id, alias)
values
  ('absensi-online', 'attendance'),
  ('absensi-online', 'karyawan'),
  ('absensi-online', 'check in'),
  ('auto-report-progress', 'daily report'),
  ('auto-report-progress', 'daily progress'),
  ('survey-report', 'survey'),
  ('weekly-report', 'weekly progress'),
  ('project-database', 'proyek'),
  ('project-database', 'database proyek'),
  ('photo-documentation', 'foto lapangan'),
  ('rab-helper', 'rab'),
  ('rab-helper', 'budget'),
  ('staff-task-tracker', 'task tracker'),
  ('backup-restore', 'backup'),
  ('backup-restore', 'restore'),
  ('utilities', 'tools')
on conflict (tool_id, alias) do nothing;

