import { syncAttendance } from "./attendanceService.js";
import { syncDailyReport } from "./dailyReportService.js";
import { syncSurveyReport } from "./surveyService.js";
import { syncWeeklyReport } from "./weeklyReportService.js";

export const syncHandlers = {
  daily: syncDailyReport,
  weekly: syncWeeklyReport,
  survey: syncSurveyReport,
  attendance: syncAttendance
};
