import { requireSupabase } from "../lib/supabaseClient.js";

export async function getSession() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session || null;
}

export async function signIn(email, password) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthChange(callback) {
  const supabase = requireSupabase();
  return supabase.auth.onAuthStateChange((_event, session) => callback(session || null));
}

export async function ensureUserProfile(user) {
  if (!user?.id) return null;
  const supabase = requireSupabase();
  const { data: current, error: readError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError) throw readError;
  if (current) return current;

  const payload = {
    user_id: user.id,
    email: user.email || null,
    full_name: user.user_metadata?.full_name || null,
    role: "viewer"
  };
  const { data, error } = await supabase.from("user_profiles").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}
