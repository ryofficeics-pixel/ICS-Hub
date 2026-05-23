# Deployment

## Static Hosting

The app builds into `dist/` and can be hosted on any static hosting service.

## Vercel

1. Import this GitHub repository into Vercel.
2. Use the default Vite settings:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
3. No environment variables are required.

## Local Preview

```bash
npm install
npm run build
npm run preview
```
