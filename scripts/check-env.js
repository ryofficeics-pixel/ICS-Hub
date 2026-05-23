import fs from "node:fs";
import path from "node:path";

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

const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.warn("Supabase frontend env vars are missing. Build will continue with static fallback:");
  for (const name of missing) console.warn(`- ${name}`);
  process.exit(0);
}

console.log("Supabase frontend env vars found.");
