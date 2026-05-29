# Deployment

`fixed rule.md` is the canonical implementation rule source.

## Current Production State (2026-05-25)

- Frontend production deploy is live at `https://ics-tools-hub.vercel.app`.
- Supabase public env is configured in Vercel.
- API health endpoint works: `/api/health`.
- Cloudinary signature endpoint is currently blocked by missing server-side env in Vercel (`500` until keys are set).

## 1. Required Environment Variables

Public frontend env (Vercel Project Environment Variables):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Server-only env (Vercel Project Environment Variables, never in frontend):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_PRESET` (optional)

Bootstrap helper env (local use):
- `FIRST_ADMIN_EMAIL`
- `FIRST_ADMIN_PASSWORD` (required if first admin auth user does not exist)

## 2. Supabase Setup

Run SQL in this order:
1. `supabase/schema.sql`
2. `supabase/seed-tools.sql`
3. `supabase/migrations/20260525_online_backend.sql`
4. `supabase/migrations/20260525_online_backend_activation_compat.sql`
5. `supabase/migrations/20260525_online_backend_security_hardening.sql`
6. `supabase/migrations/20260525_tool_access_policy_hardening.sql`
7. `supabase/migrations/20260525_user_profile_role_compatibility.sql`

Confirm:
- Tables exist (`daily_reports`, `weekly_reports`, `survey_reports`, `attendance_records`, `media_files`, `audit_logs`, `sync_events`).
- RLS is enabled.
- Policies created.

## 3. Bootstrap First Admin

Local command:

```bash
npm run bootstrap:first-admin
```

This uses `SUPABASE_SERVICE_ROLE_KEY` and updates `user_profiles` with role `super_admin`.

## 4. Build Validation

```bash
npm run check:env
npm run build
npm run check:docs
```

`check:env` fails build when required public Supabase env is missing.

## 5. Vercel Deployment

```bash
npx vercel deploy --prod
```

If server env vars are added or changed, redeploy production before retesting API endpoints.

Post-deploy checks:
1. Login works.
2. Session persists after reload.
3. Role-limited tool visibility works.
4. `/api/health` returns `ok: true`.
5. Cloudinary signed upload endpoint responds (`/api/cloudinary-signature`).
6. Browser bundle does not contain `SUPABASE_SERVICE_ROLE_KEY` or Cloudinary API secret.

## 6. Operational Notes

- Offline queue uses IndexedDB (`ics-offline-sync-v1`).
- Sync retries when online and with manual `Sync now`.
- Conflicts are marked explicitly; no silent overwrite.
