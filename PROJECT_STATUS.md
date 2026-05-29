# Project Status

## Rule Priority

1. `fixed rule.md` is the canonical rule source.
2. This file is status-only and cannot override `fixed rule.md`.

## Current Integration State (2026-05-25)

- Frontend shell preserved (existing dashboard UI and routes remain).
- Supabase Auth session flow added to launcher.
- Role-aware tool loading enabled.
- Supabase migrations added for operational tables and RLS policies.
- Cloudinary signed upload endpoint added (`/api/cloudinary-signature`).
- Offline queue + sync engine added (IndexedDB-backed).
- Legacy localStorage migration queue added.
- First-admin bootstrap script added.
- Required env validation hardened (`check:env` fails when public Supabase vars are missing).
- `fixed rule.md` verified identical to `C:\Users\user\Downloads\CODEX_ICS_OFFICE_TOOLS.md` (SHA256 match).
- Supabase production project identified and migration/hardening applied (tables, indexes, RLS, policies verified).
- Production app health endpoint is live (`/api/health` returns `ok: true`).
- New-computer recovery checklist added (`docs/NEW_COMPUTER_SETUP.md`).
- Portability verification command added (`npm run check:portable`).

## Remaining External Requirements

- Set missing server-side Vercel env variables: `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (and preset if used).
- Redeploy after env update and verify `/api/cloudinary-signature` returns `200`.
- Validate end-to-end media upload metadata write to `media_files`.
- Validate non-admin role restrictions using a clean staff/viewer auth account.

## Known Constraint

This repository is a launcher/control layer. Daily/Weekly/Survey/Absensi module internals currently live in external routes linked from tool URLs, so module-level form logic changes are outside this repo scope.
