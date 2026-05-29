export const tools = [
  {
    id: "absensi-online",
    name: "Absensi Online",
    description: "Attendance check-in, check-out, location status, and daily presence records.",
    category: "Attendance",
    type: "Online",
    status: "Live",
    required_role: "staff",
    url: "https://ics-office-tools-deploy.vercel.app/tools/absensi-karyawan/index.html"
  },
  {
    id: "absensi-admin",
    name: "Absensi Admin",
    description: "Attendance administration console for review, correction, and export operations.",
    category: "Attendance",
    type: "Online",
    status: "Live",
    required_role: "admin",
    url: "https://ics-office-tools-deploy.vercel.app/tools/absensi-admin/index.html"
  },
  {
    id: "auto-report-progress",
    name: "Auto Report Progress",
    description: "Daily progress input for site activity, notes, issues, and photo documentation.",
    category: "Reports",
    type: "Online",
    status: "Live",
    required_role: "staff",
    url: "https://ics-office-tools-deploy.vercel.app/tools/daily-report/index.html"
  },
  {
    id: "survey-report",
    name: "Survey Report",
    description: "Survey documentation, field observations, sketches, photos, and export-ready reports.",
    category: "Reports",
    type: "Online",
    status: "Stable",
    required_role: "staff",
    url: "https://ics-office-tools-deploy.vercel.app/tools/survey-report/index.html"
  },
  {
    id: "weekly-report",
    name: "Weekly Report",
    description: "Weekly project summary by selected project, week number, and reporting period.",
    category: "Reports",
    type: "Online",
    status: "Stable",
    required_role: "staff",
    url: "https://ics-office-tools-deploy.vercel.app/tools/progress-report/index.html"
  },
  {
    id: "project-database",
    name: "Project Database",
    description: "Central project reference for names, locations, owners, estimators, and teams.",
    category: "Projects",
    type: "Local-ready",
    status: "Stable",
    required_role: "supervisor",
    url: "https://ics-office-tools-deploy.vercel.app/tools/daily-report/index.html"
  },
  {
    id: "photo-documentation",
    name: "Photo Documentation",
    description: "Field photo review and documentation launcher for report attachments.",
    category: "Documentation",
    type: "Local-ready",
    status: "Ready",
    required_role: "staff",
    url: "https://ics-office-tools-deploy.vercel.app/tools/survey-report/index.html"
  },
  {
    id: "roi-simulator",
    name: "ROI Simulator",
    description: "Property and project return simulation for planning and investment review.",
    category: "Finance",
    type: "Online",
    status: "Live",
    required_role: "supervisor",
    url: "https://ics-office-tools-deploy.vercel.app/tools/roi-simulator/index.html"
  },
  {
    id: "rab-helper",
    name: "RAB Helper",
    description: "Budget helper and estimation support for operational project costing.",
    category: "Finance",
    type: "Local",
    status: "Beta",
    required_role: "supervisor",
    url: "https://ics-office-tools-deploy.vercel.app/tools/estimator/index.html"
  },
  {
    id: "module-generator",
    name: "Module Generator",
    description: "Generate and manage module templates and floor-panel tool flows.",
    category: "Utilities",
    type: "Online",
    status: "Live",
    required_role: "admin",
    url: "https://ics-office-tools-deploy.vercel.app/tools/module-generator/index.html"
  },
  {
    id: "staff-task-tracker",
    name: "Staff Task Tracker",
    description: "Track staff assignments, open items, and operational follow-up tasks.",
    category: "Operations",
    type: "Planned",
    status: "Maintenance",
    required_role: "supervisor",
    url: "",
    disabled: true
  },
  {
    id: "backup-restore",
    name: "Backup Restore",
    description: "Local data backup and restore guide for device transfer and emergency recovery.",
    category: "Utilities",
    type: "Local-ready",
    status: "Ready",
    required_role: "staff",
    url: "https://ics-office-tools-deploy.vercel.app"
  },
  {
    id: "utilities",
    name: "Utilities",
    description: "Small supporting tools, converters, and operational shortcuts.",
    category: "Utilities",
    type: "Local-ready",
    status: "Beta",
    required_role: "staff",
    url: "https://ics-office-tools-deploy.vercel.app/tools/module-generator/index.html"
  }
];
