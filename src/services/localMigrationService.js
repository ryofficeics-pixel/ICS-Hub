import { queueMutation } from "../lib/syncEngine.js";

const LEGACY_KEYS = [
  "ics-daily-report-v1",
  "ics-local-report-groundup-v2",
  "ics-local-survey-v1",
  "ICS_DASHBOARD_LAST_OPENED"
];

const BACKUP_PREFIX = "ics-local-migration-backup:";
const MARKER_KEY = "ics-local-migration-v1-completed";

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function backupKey(key, value) {
  localStorage.setItem(`${BACKUP_PREFIX}${key}`, value);
}

export function detectLegacyData() {
  const found = [];
  for (const key of LEGACY_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    found.push({ key, raw, parsed: safeJsonParse(raw) });
  }
  return found;
}

export async function migrateLegacyToQueue(userId) {
  if (!userId || localStorage.getItem(MARKER_KEY) === userId) return { migrated: 0 };
  const records = detectLegacyData();
  let migrated = 0;

  for (const row of records) {
    backupKey(row.key, row.raw);

    if (row.key === "ics-daily-report-v1" && row.parsed?.dailyReports) {
      for (const report of row.parsed.dailyReports) {
        await queueMutation("daily", "upsert", report, report.id || report.local_id);
        migrated += 1;
      }
    } else if (row.key === "ics-local-report-groundup-v2" && row.parsed?.weeklyReports) {
      for (const report of row.parsed.weeklyReports) {
        await queueMutation("weekly", "upsert", report, report.id || report.local_id);
        migrated += 1;
      }
    } else if (row.key === "ics-local-survey-v1" && row.parsed?.surveys) {
      for (const survey of row.parsed.surveys) {
        await queueMutation("survey", "upsert", survey, survey.id || survey.local_id);
        migrated += 1;
      }
    }
  }

  localStorage.setItem(MARKER_KEY, userId);
  return { migrated };
}
