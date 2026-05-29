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
  console.error("Missing required frontend env vars:");
  for (const name of missing) console.error(`- ${name}`);
  console.error("Build aborted. Add missing values to .env.local or deployment environment.");
  process.exit(1);
}

console.log("Supabase frontend env vars found.");

const serverOptional = ["SUPABASE_SERVICE_ROLE_KEY", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const missingServer = serverOptional.filter((name) => !process.env[name]);
if (missingServer.length) {
  console.warn("Server-side env vars are missing (required for API/upload/admin scripts):");
  for (const name of missingServer) console.warn(`- ${name}`);
}
