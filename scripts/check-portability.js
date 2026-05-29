import fs from "node:fs";
import { execFileSync } from "node:child_process";

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

function run(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return "";
  }
}

function pass(message) {
  console.log(`[ok] ${message}`);
}

function warn(message) {
  console.warn(`[warn] ${message}`);
}

function fail(message) {
  console.error(`[fail] ${message}`);
  failures += 1;
}

let failures = 0;

const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
if (nodeMajor >= 18) {
  pass(`Node ${process.versions.node} is supported`);
} else {
  fail(`Node ${process.versions.node} is too old; install Node 18 or newer`);
}

if (fs.existsSync("package-lock.json")) {
  pass("package-lock.json is present for reproducible npm install");
} else {
  fail("package-lock.json is missing; npm ci on a new computer will not be reproducible");
}

if (fs.existsSync("fixed rule.md")) {
  pass("fixed rule.md is present");
} else {
  fail("fixed rule.md is missing; this is the canonical project rule source");
}

if (fs.existsSync(".env.example")) {
  pass(".env.example is present");
} else {
  fail(".env.example is missing; new computers need this env template");
}

const remote = run("git", ["remote", "get-url", "origin"]);
if (remote) {
  pass(`Git origin is configured: ${remote}`);
} else {
  fail("Git origin is not configured; clone/push continuity will break");
}

const branch = run("git", ["branch", "--show-current"]);
if (branch) {
  pass(`Current Git branch: ${branch}`);
} else {
  warn("Could not determine current Git branch");
}

if (fs.existsSync(".env.local")) {
  pass(".env.local exists on this computer");
} else {
  warn(".env.local is missing; create it from .env.example or pull Vercel env before building");
}

loadDotEnv(".env");
loadDotEnv(".env.local");

const frontendEnv = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
const missingFrontend = frontendEnv.filter((name) => !process.env[name]);
if (missingFrontend.length) {
  fail(`Missing frontend env vars: ${missingFrontend.join(", ")}`);
} else {
  pass("Required frontend env vars are available");
}

const serverEnv = ["SUPABASE_SERVICE_ROLE_KEY", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const missingServer = serverEnv.filter((name) => !process.env[name]);
if (missingServer.length) {
  warn(`Missing server/API env vars: ${missingServer.join(", ")}`);
} else {
  pass("Server/API env vars are available");
}

if (failures) {
  console.error(`Portability check failed with ${failures} blocking issue(s).`);
  process.exit(1);
}

console.log("Portability check complete.");
