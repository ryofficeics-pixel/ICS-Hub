# Deployment

## Static Hosting

The app builds into `dist/` and can be hosted on any static hosting service.

## Vercel

Live production URL: https://ics-tools-hub.vercel.app

1. Import this GitHub repository into Vercel.
2. Use the default Vite settings:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add the required frontend-safe environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

Do not add service role keys or other secrets with a `VITE_` prefix.

## Supabase Database Setup

Run these SQL files in Supabase SQL Editor or an equivalent secure admin context:

1. `supabase/schema.sql`
2. `supabase/seed-tools.sql`

The schema enables RLS:
- `tools`: public read
- `tool_aliases`: public read
- `routing_events`: public insert only
- `user_profiles` and `tool_access`: locked down for future auth work

## Fallback Behavior

If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing, the app still builds and runs from `src/tools-data.js`.

If Supabase is configured but the query fails, the UI shows `Backend error` and falls back to static data.

If Supabase loads successfully, the UI shows `Online DB`.

## Local Preview

```bash
npm install
npm run build
npm run preview
```

## Verification

1. Run `npm run build`.
2. Open the app without env vars and confirm it shows `Static fallback`.
3. Add Supabase env vars and confirm it shows `Online DB`.
4. Search, category chips, disabled tools, and launch buttons should behave the same in both modes.
