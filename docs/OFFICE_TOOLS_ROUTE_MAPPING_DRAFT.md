# Office Tools Route Mapping Draft

Purpose: keep ICS Tools Hub as the online dashboard with Supabase backend, while every tool button opens the correct online route from the ICS Office Tools deployment.

Important rule: a public Vercel URL cannot open local Windows paths like `D:\...` or `C:\...` directly. Local files must first be copied into the ICS Office Tools project and deployed, then the Hub can link to the deployed route.

## Draft Mapping

| Hub menu | Local source file | Office Tools online route | Current status |
| --- | --- | --- | --- |
| Absensi Online / Karyawan | `D:\absensi\karyawan4.html` | `https://ics-office-tools-deploy.vercel.app/tools/absensi-karyawan` | Source differs from current deployed repo; needs copy into Office Tools route, then deploy Office Tools |
| Daily Report | `C:\Users\user\Documents\New project 5\daily-report.html` | `https://ics-office-tools-deploy.vercel.app/tools/daily-report` | Source already matches Office Tools repo |

## Current Hub Link Policy

Use canonical Vercel routes without `/index.html`:

- `https://ics-office-tools-deploy.vercel.app/tools/absensi-karyawan`
- `https://ics-office-tools-deploy.vercel.app/tools/daily-report`

Vercel redirects `/index.html` to the canonical extensionless route, so the extensionless route avoids an extra redirect.

## Next Implementation Step

1. Copy `D:\absensi\karyawan4.html` into `C:\Users\user\Documents\ICS office tools\tools\absensi-karyawan\index.html`.
2. Commit and push the ICS Office Tools repo.
3. Deploy or wait for Vercel auto-deploy on `ics-office-tools-deploy`.
4. Keep ICS Tools Hub links pointed to the deployed Office Tools route.
