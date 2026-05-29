import { requireSupabase } from "../lib/supabaseClient.js";

export async function getToolsForRole(role = "viewer") {
  const supabase = requireSupabase();
  const [{ data: dbTools, error: toolsError }, { data: aliases, error: aliasesError }] = await Promise.all([
    supabase.from("tools").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    supabase.from("tool_aliases").select("tool_id, alias")
  ]);

  if (toolsError) throw toolsError;
  if (aliasesError) throw aliasesError;

  const aliasesByTool = new Map();
  for (const row of aliases || []) {
    const list = aliasesByTool.get(row.tool_id) || [];
    list.push(row.alias);
    aliasesByTool.set(row.tool_id, list);
  }

  return (dbTools || [])
    .filter((tool) => {
      if (!tool.required_role) return true;
      const hierarchy = ["viewer", "staff", "supervisor", "admin", "super_admin"];
      return hierarchy.indexOf(role) >= hierarchy.indexOf(tool.required_role);
    })
    .map((tool) => ({
      ...tool,
      url: tool.url || "",
      disabled: Boolean(tool.disabled),
      aliases: aliasesByTool.get(tool.id) || []
    }));
}

export async function logRoutingEvent(tool, userId) {
  const supabase = requireSupabase();
  const { error } = await supabase.from("routing_events").insert({
    tool_id: tool.id,
    tool_name: tool.name,
    url: tool.url,
    user_agent: navigator.userAgent,
    user_id: userId || null
  });
  if (error) throw error;
}
