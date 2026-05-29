import { requireSupabase } from "../lib/supabaseClient.js";
import { queueMutation } from "../lib/syncEngine.js";

const TABLE = "attendance_records";

export async function saveAttendanceLocalFirst(record) {
  return queueMutation("attendance", "upsert", record, record.local_id || record.id);
}

export async function syncAttendance(item) {
  const supabase = requireSupabase();
  const payload = {
    ...item.payload,
    client_updated_at: item.payload.client_updated_at || new Date().toISOString()
  };
  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

export async function listAttendance(projectId) {
  const supabase = requireSupabase();
  let query = supabase.from(TABLE).select("*").order("attendance_time", { ascending: false }).limit(100);
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
