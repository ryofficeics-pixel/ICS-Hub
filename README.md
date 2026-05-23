# IC Solution Tools Hub

Standalone operational tools dashboard for IC Solution.

Live app: https://ics-tools-hub.vercel.app

This project is intentionally small: Vite, HTML, CSS, and vanilla JavaScript only. Tool data loads from Supabase when configured, with static fallback from `src/tools-data.js` when Supabase is unavailable.

## Features

- Windows Phone / Metro-inspired responsive tile dashboard
- Search tools by name, category, status, or type
- Category filter chips
- Tool cards with name, description, category, type, status, and launch path
- Disabled handling for maintenance tools
- Recently opened tracking with `localStorage`
- Empty state for searches with no result
- Supabase-backed public tool registry
- Static fallback when env vars or backend queries are unavailable

## Commands

```bash
npm install
npm run dev
npm run build
```

## Environment

Frontend-safe Supabase variables are required for online database mode:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Do not place service role keys, Cloudinary secrets, GitHub tokens, Vercel tokens, or credentials in this frontend app.

## Supabase Setup

Run the SQL files in order through Supabase SQL Editor or another secure admin context:

1. `supabase/schema.sql`
2. `supabase/seed-tools.sql`

The frontend reads `tools` and `tool_aliases`. Launch clicks attempt to insert into `routing_events`; failed inserts never block navigation.

## Project Scope

This repository is standalone and does not modify any existing IC Solution project. Tool URLs can be adjusted in `src/tools-data.js`.

## Handover

See `docs/HANDOVER_AUTO_ROUTING_AGENT.md` for the central hub summary and notes for a future auto-routing agent across multiple accounts.
