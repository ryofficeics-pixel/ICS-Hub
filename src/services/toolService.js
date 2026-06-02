import { requireSupabase } from "../lib/supabaseClient.js";
import { tools as fallbackTools } from "../tools-data.js";

const roleHierarchy = ["viewer", "staff", "supervisor", "admin", "super_admin"];

function canOpenForRole(tool, role) {
  if (!tool.required_role) return true;
  return roleHierarchy.indexOf(role) >= roleHierarchy.indexOf(tool.required_role);
}

function normalizeToolRegistry(dbTools, aliasesByTool, role) {
  const mergedById = new Map();
  const fallbackById = new Map(fallbackTools.map((tool) => [tool.id, tool]));
  const fallbackOrder = new Map(fallbackTools.map((tool, index) => [tool.id, index]));

  for (const dbTool of dbTools || []) {
    const fallback = fallbackById.get(dbTool.id);
    const normalized = {
      ...dbTool,
      ...(fallback || {}),
      aliases: aliasesByTool.get(dbTool.id) || [],
      disabled: Boolean(fallback?.disabled ?? dbTool.disabled),
      url: fallback?.url ?? dbTool.url ?? ""
    };
    mergedById.set(normalized.id, normalized);
  }

  for (const fallback of fallbackTools) {
    if (!mergedById.has(fallback.id)) {
      mergedById.set(fallback.id, { ...fallback, aliases: aliasesByTool.get(fallback.id) || [] });
    }
  }

  return Array.from(mergedById.values())
    .filter((tool) => canOpenForRole(tool, role))
    .sort((a, b) => {
      const aOrder = Number(a.sort_order ?? (fallbackOrder.get(a.id) ?? 100) * 10);
      const bOrder = Number(b.sort_order ?? (fallbackOrder.get(b.id) ?? 100) * 10);
      return aOrder - bOrder || a.name.localeCompare(b.name);
    });
}

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

  return normalizeToolRegistry(dbTools, aliasesByTool, role);
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
