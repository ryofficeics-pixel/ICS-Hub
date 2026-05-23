# IC Solution Tools Hub

Standalone operational tools dashboard for IC Solution.

Live app: https://ics-tools-hub.vercel.app

This project is intentionally small: Vite, HTML, CSS, and vanilla JavaScript only. It has no backend, no auth layer, no database, and no external UI library.

## Features

- Windows Phone / Metro-inspired responsive tile dashboard
- Search tools by name, category, status, or type
- Category filter chips
- Tool cards with name, description, category, type, status, and launch path
- Disabled handling for maintenance tools
- Recently opened tracking with `localStorage`
- Empty state for searches with no result

## Commands

```bash
npm install
npm run dev
npm run build
```

## Project Scope

This repository is standalone and does not modify any existing IC Solution project. Tool URLs can be adjusted in `src/tools-data.js`.

## Handover

See `docs/HANDOVER_AUTO_ROUTING_AGENT.md` for the central hub summary and notes for a future auto-routing agent across multiple accounts.
