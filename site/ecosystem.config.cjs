const path = require("node:path");
const fs = require("node:fs");

const siteDir = __dirname;
const repoRoot = path.join(siteDir, "..");

/** @type {Record<string, string>} */
const env = { NODE_ENV: "production" };

const envPath = path.join(siteDir, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 0) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

if (!env.PORT) env.PORT = "3100";

function resolveNextBin() {
  const candidates = [
    path.join(siteDir, "node_modules/next/dist/bin/next"),
    path.join(repoRoot, "node_modules/next/dist/bin/next"),
  ];
  for (const bin of candidates) {
    if (fs.existsSync(bin)) return bin;
  }
  return null;
}

const nextBin = resolveNextBin();

/** @type {import("pm2").StartOptions} */
const app = nextBin
  ? {
      name: "tenegta",
      cwd: siteDir,
      script: nextBin,
      args: `start -p ${env.PORT}`,
      env,
      max_restarts: 10,
      min_uptime: "10s",
    }
  : {
      name: "tenegta",
      cwd: siteDir,
      script: "npm",
      args: ["run", "start"],
      env,
      max_restarts: 10,
      min_uptime: "10s",
    };

module.exports = { apps: [app] };
