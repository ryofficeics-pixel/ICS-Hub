import { requireSupabase } from "../lib/supabaseClient.js";
import { queueMutation } from "../lib/syncEngine.js";

const TABLE = "daily_reports";

export async function saveDailyReportLocalFirst(record) {
  return queueMutation("daily", "upsert", record, record.local_id || record.id);
}

export async function syncDailyReport(item) {
  const supabase = requireSupabase();
  const payload = {
    ...item.payload,
    client_updated_at: item.payload.client_updated_at || new Date().toISOString()
  };
  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

export async function listDailyReports(projectId) {
  const supabase = requireSupabase();
  let query = supabase.from(TABLE).select("*").order("report_date", { ascending: false }).limit(50);
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
