# New Computer Setup

Use this when moving the project to another computer or after a fresh Windows install.

## What Must Move Through Git

Commit and push source changes before changing computer. The repository should contain:

- `fixed rule.md`
- `README.md`
- `PROJECT_STATUS.md`
- `CODEX_RESUME.md`
- `package.json`
- `package-lock.json`
- `index.html`
- `src/`
- `api/`
- `scripts/`
- `supabase/`
- `docs/`
- `.env.example`

Do not commit `.env`, `.env.local`, `.vercel/`, `node_modules/`, or `dist/`.

## One-Time Computer Requirements

Install:

- Git
- Node.js 18 or newer
- Vercel CLI, only if you deploy from the computer: `npm install -g vercel`

## Restore Steps

```bash
git clone https://github.com/ryofficeics-pixel/ICS-Hub.git
cd ICS-Hub
npm ci
copy .env.example .env.local
npm run check:portable
npm run build
npm run dev
```

Edit `.env.local` before `npm run build` if `check:portable` reports missing frontend env values.

## Environment Values To Bring

Public frontend values:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Server/admin values:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=
FIRST_ADMIN_EMAIL=
FIRST_ADMIN_PASSWORD=
```

Keep the service role key and Cloudinary secret out of screenshots, chat logs, frontend code, and Git commits.

## Vercel Restore Option

If the new computer is signed in to the right Vercel account:

```bash
npx vercel link
npx vercel env pull .env.local
npm run check:portable
```

After changing Vercel server-side env vars, redeploy production:

```bash
npx vercel deploy --prod
```

## Supabase Restore Notes

The database is not stored in Git. If a new Supabase project is ever created, apply SQL in this order:

1. `supabase/schema.sql`
2. `supabase/seed-tools.sql`
3. `supabase/migrations/20260525_online_backend.sql`
4. `supabase/migrations/20260525_online_backend_activation_compat.sql`
5. `supabase/migrations/20260525_online_backend_security_hardening.sql`
6. `supabase/migrations/20260525_tool_access_policy_hardening.sql`
7. `supabase/migrations/20260525_user_profile_role_compatibility.sql`

For the existing production Supabase project, keep using the current project URL and keys.

## Final Verification

Run:

```bash
npm run check:portable
npm run check:docs
npm run build
```

Then verify:

- Login works.
- Role-limited tool visibility works.
- `/api/health` returns `ok: true`.
- `/api/cloudinary-signature` works after Cloudinary env vars are present.
