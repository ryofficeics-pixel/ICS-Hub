# IC Solution Tools Hub

Standalone operational tools dashboard for IC Solution.

## Rule Priority

1. `fixed rule.md` is the only canonical rule source.
2. `README.md` may summarize `fixed rule.md` but cannot override it.
3. `PROJECT_STATUS.md` and `CODEX_RESUME.md` are implementation status only.
4. Old handover docs are historical references only.
5. Any conflict must be resolved in favor of `fixed rule.md`.
6. Runtime/source code behavior must not be changed from docs alone unless `fixed rule.md` explicitly requires it.

## AGENT GUARDRAIL

Before any future code edit:
- Read `fixed rule.md` first.
- Check whether the requested change conflicts with `fixed rule.md`.
- If conflict exists, follow `fixed rule.md` unless the user explicitly updates the fixed rule.
- Do not treat `PROJECT_STATUS.md`, `CODEX_RESUME.md`, or old handover docs as authority.
- Do not regress existing working modules.
- Run build after changes.

## Mandatory Rule Source

`fixed rule.md` is the only canonical and fixed implementation rule for both frontend and backend work in this repository.

Live app: https://ics-tools-hub.vercel.app

This project is a Vite frontend launcher with Supabase Auth + Postgres integration, serverless upload signing for Cloudinary, and offline sync queue infrastructure for field workflows.

## Activation Status (2026-05-25)

- Supabase auth + RLS-backed launcher integration is active.
- Production `/api/health` is active.
- Cloudinary signed upload flow is implemented but requires server-side Vercel env keys before production upload can pass.
- This repo is the launcher/control app; module internals still live on linked external module routes.

## Features

- Windows Phone / Metro-inspired responsive tile dashboard
- Supabase Auth login/session with persistent session handling
- Role-aware tool visibility (`viewer`, `staff`, `supervisor`, `admin`, `super_admin`)
- Search tools by name, category, status, or type
- Category filter chips
- Tool cards with name, description, category, type, status, and launch path
- Disabled handling for maintenance tools
- Recently opened tracking with `localStorage`
- Empty state for searches with no result
- Supabase-backed tool registry and routing event logging
- IndexedDB offline queue + manual/online retry sync status
- Local storage migration queue bootstrap for legacy report keys
- Cloudinary signed upload endpoint (`/api/cloudinary-signature`)

## Commands

```bash
npm install
npm run check:env
npm run check:docs
npm run check:portable
npm run dev
npm run build
npm run bootstrap:first-admin
```

## New Computer Setup

Use `docs/NEW_COMPUTER_SETUP.md` when moving to another computer. Short version:

```bash
git clone https://github.com/ryofficeics-pixel/ICS-Hub.git
cd ICS-Hub
npm ci
copy .env.example .env.local
npm run check:portable
npm run build
```

Secrets are intentionally not stored in Git. Bring `.env.local` values through Vercel env pull or a secure password manager.

## Environment

Public frontend env (required):

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Server-only env (for API/bootstrap):

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_PRESET=optional
FIRST_ADMIN_EMAIL=admin@example.com
FIRST_ADMIN_PASSWORD=optional-if-user-exists
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` or Cloudinary secret values in frontend code.

## Supabase Setup

Apply schema and seed in order, then run migrations:

1. `supabase/schema.sql`
2. `supabase/seed-tools.sql`
3. `supabase/migrations/20260525_online_backend.sql`
4. `supabase/migrations/20260525_online_backend_activation_compat.sql`
5. `supabase/migrations/20260525_online_backend_security_hardening.sql`
6. `supabase/migrations/20260525_tool_access_policy_hardening.sql`
7. `supabase/migrations/20260525_user_profile_role_compatibility.sql`

Key production tables added by migration:
- `user_profiles`, `projects`, `project_memberships`
- `daily_reports`, `weekly_reports`, `survey_reports`, `attendance_records`
- `media_files`, `audit_logs`, `sync_events`

RLS is enabled with role/project-aware policies.

## Cloudinary

- Upload flow uses `/api/cloudinary-signature` (signed upload).
- Store only metadata and URLs in Supabase (`media_files`), not base64 blobs.
- Recommended folder format: `ics-office-tools/{module}/{projectId}/{recordId}`.

## Offline Sync

- Queue store: IndexedDB `ics-offline-sync-v1`.
- Queue statuses: `pending`, `synced`, `failed`, `conflict`.
- Retry triggers: manual `Sync now` and automatic when browser returns online.
- Legacy localStorage keys are backed up before migration queueing.

## Project Scope

This repository is the launcher/control surface. The linked module pages are preserved and not rebuilt here.

## Handover

`docs/HANDOVER_AUTO_ROUTING_AGENT.md` and `CODEX_ICS_OFFICE_TOOLS.md` are historical/non-authoritative references. Use `fixed rule.md` as the active handoff and rule document.
