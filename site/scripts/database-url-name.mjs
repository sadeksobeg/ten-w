/**
 * Prints the PostgreSQL database name from DATABASE_URL (site/.env + .env.local).
 * Usage: node scripts/database-url-name.mjs
 */
import { loadEnvFiles } from "./load-env-file.mjs";

loadEnvFiles();

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
