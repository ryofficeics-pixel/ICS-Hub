# Codex Resume

## Rule Priority

1. `fixed rule.md` is the only canonical rule source.
2. This resume is secondary context only and cannot override `fixed rule.md`.
3. Historical handover docs are non-authoritative references.

## First Action After Resume

1. Read `fixed rule.md`.
2. Run `npm.cmd run build`.
3. Run `npm.cmd run check:docs` (if available).
4. Continue the requested task.

## Completed

- Created standalone project folder with its own Git repository.
- Preserved existing Vite-based UI shell and routes.
- Added Supabase Auth login/session flow and role-aware tool loading.
- Added operational schema migration with RLS and role/project policy helpers.
- Added Cloudinary signed upload endpoint.
- Added IndexedDB offline queue and sync engine.
- Added legacy localStorage migration queue process.
- Added first-admin bootstrap script.

## Pending

- Apply migration SQL on the target Supabase project.
- Configure Vercel env vars for Supabase and Cloudinary.
- Create real users/project memberships and run first-admin bootstrap.
- Validate full live workflow against production credentials.

## Last Known Commands

```bash
npm install
npm run build
npm run check:env
npm run check:docs
npm run bootstrap:first-admin
git init
git add .
git commit -m "Initial IC Solution tools dashboard foundation"
git remote add origin https://github.com/ryofficeics-pixel/ics-tools-hub.git
npm run build
```

## Notes

This repository now contains backend integration scaffolding (auth, RLS schema, sync, Cloudinary signing) while preserving existing launcher UI behavior.
