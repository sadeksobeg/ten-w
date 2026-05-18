const path = require("node:path");
const fs = require("node:fs");

/** @type {Record<string, string>} */
const env = { NODE_ENV: "production" };

const envPath = path.join(__dirname, ".env");
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

/** @type {import("pm2").StartOptions[]} */
module.exports = {
  apps: [
    {
      name: "tenegta",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: `start -p ${env.PORT}`,
      env,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
