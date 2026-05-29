import { requireSupabase } from "../lib/supabaseClient.js";
import { queueMutation } from "../lib/syncEngine.js";

const TABLE = "survey_reports";

export async function saveSurveyLocalFirst(record) {
  return queueMutation("survey", "upsert", record, record.local_id || record.id);
}

export async function syncSurveyReport(item) {
  const supabase = requireSupabase();
  const payload = {
    ...item.payload,
    client_updated_at: item.payload.client_updated_at || new Date().toISOString()
  };
  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

export async function listSurveyReports(projectId) {
  const supabase = requireSupabase();
  let query = supabase.from(TABLE).select("*").order("survey_date", { ascending: false }).limit(50);
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
