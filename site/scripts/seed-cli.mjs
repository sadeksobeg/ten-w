/**
 * Run prisma db seed using site/.env only (ignores shell DATABASE_URL).
 */
import { spawnSync } from "node:child_process";
import { loadEnvFiles } from "./load-env-file.mjs";

delete process.env.DATABASE_URL;
loadEnvFiles();

const cwd = process.cwd();
const run = (args) =>
  spawnSync("node", args, { cwd, stdio: "inherit", env: { ...process.env } });

const verify = run(["scripts/verify-prisma-database.mjs"]);
if (verify.status !== 0) process.exit(verify.status ?? 1);

const check = run(["scripts/check-growth-0003.mjs"]);
if (check.status !== 0) {
  console.error("");
  console.error("Fix schema first: bash ../scripts/server-repair-growth-0003.sh");
  process.exit(1);
}

const seed = spawnSync("npx", ["prisma", "db", "seed"], {
  cwd,
  stdio: "inherit",
  env: { ...process.env },
});
process.exit(seed.status ?? 1);
