import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const skipDirs = new Set([".git", "node_modules", "dist", "backups"]);
const markdownFiles = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) {
        walk(fullPath);
      }
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      markdownFiles.push(fullPath);
    }
  }
}

function isAllowedCanonicalLine(fileName, line) {
  if (fileName === "fixed rule.md") {
    return true;
  }
  if (
    /fixed rule\.md/i.test(line) &&
    /(only canonical|canonical rule source|canonical implementation rule source|cannot override|wins?)/i.test(line)
  ) {
    return true;
  }
  if (fileName === "readme.md" && /fixed rule\.md/i.test(line)) {
    return true;
  }
  return false;
}

walk(repoRoot);

const warnings = [];

for (const filePath of markdownFiles) {
  const relPath = path.relative(repoRoot, filePath).replaceAll("\\", "/");
  const fileName = path.basename(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const header = lines.slice(0, 20).join("\n");
  const isObsoleteDoc = /OBSOLETE \/ NON-AUTHORITATIVE/i.test(header);

  lines.forEach((line, index) => {
    const lineNo = index + 1;

    if (/source of truth/i.test(line) || /\bcanonical\b/i.test(line)) {
      if (!isAllowedCanonicalLine(fileName, line)) {
        warnings.push(
          `${relPath}:${lineNo} risky authority phrase outside allowed context -> ${line.trim()}`
        );
      }
    }

    if (/follow this handover/i.test(line)) {
      warnings.push(
        `${relPath}:${lineNo} risky handover authority phrase -> ${line.trim()}`
      );
    }

    if (/implementation authority/i.test(line)) {
      if (!/do not use it as implementation authority/i.test(line)) {
        warnings.push(
          `${relPath}:${lineNo} risky implementation authority phrase -> ${line.trim()}`
        );
      }
    }

    if (isObsoleteDoc && /must follow/i.test(line)) {
      warnings.push(
        `${relPath}:${lineNo} obsolete doc still contains \"must follow\" -> ${line.trim()}`
      );
    }
  });
}

console.log(`Scanned ${markdownFiles.length} markdown files.`);
if (warnings.length === 0) {
  console.log("No risky documentation authority phrases found.");
} else {
  console.log(`Found ${warnings.length} warning(s):`);
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

process.exit(0);
