import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadDotEnv(file) {
  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;
  const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv(".env");
loadDotEnv(".env.local");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.FIRST_ADMIN_EMAIL;
const password = process.env.FIRST_ADMIN_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !email) {
  console.error(
    "Missing required env. Need SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY, FIRST_ADMIN_EMAIL."
  );
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function resolveOrCreateUser() {
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listed.error) throw listed.error;
  const existing = listed.data.users.find((row) => row.email?.toLowerCase() === email.toLowerCase());
  if (existing) return existing;

  if (!password) {
    throw new Error("FIRST_ADMIN_PASSWORD is required when creating a new first admin user.");
  }

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Super Admin" }
  });
  if (created.error) throw created.error;
  return created.data.user;
}

async function main() {
  const user = await resolveOrCreateUser();
  const { error } = await admin.from("user_profiles").upsert(
    {
      user_id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || "Super Admin",
      role: "super_admin",
      is_active: true
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
  console.log(`First admin ready: ${user.email} (${user.id})`);
}

main().catch((error) => {
  console.error("bootstrap-first-admin failed:", error.message || error);
  process.exit(1);
});
