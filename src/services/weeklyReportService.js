import { requireSupabase } from "../lib/supabaseClient.js";
import { queueMutation } from "../lib/syncEngine.js";

const TABLE = "weekly_reports";

export async function saveWeeklyReportLocalFirst(record) {
  return queueMutation("weekly", "upsert", record, record.local_id || record.id);
}

export async function syncWeeklyReport(item) {
  const supabase = requireSupabase();
  const payload = {
    ...item.payload,
    client_updated_at: item.payload.client_updated_at || new Date().toISOString()
  };
  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

export async function listWeeklyReports(projectId) {
  const supabase = requireSupabase();
  let query = supabase.from(TABLE).select("*").order("week_start", { ascending: false }).limit(30);
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
