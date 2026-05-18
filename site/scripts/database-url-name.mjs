/**
 * Prints the PostgreSQL database name from DATABASE_URL (site/.env + .env.local).
 * Usage: node scripts/database-url-name.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function loadEnvFile(name) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

let dbName;
try {
  dbName = decodeURIComponent(new URL(url).pathname.replace(/^\//, "").split("/")[0] ?? "");
} catch {
  console.error("Invalid DATABASE_URL");
  process.exit(1);
}

if (!dbName) {
  console.error("DATABASE_URL has no database name");
  process.exit(1);
}

console.log(dbName);
