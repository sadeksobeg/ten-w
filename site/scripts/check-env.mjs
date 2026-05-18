#!/usr/bin/env node
/**
 * Production env preflight — run before `npm run build` on Netlify/CI.
 * Usage: node scripts/check-env.mjs
 * Loads .env then .env.local if present (does not override existing process.env).
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(name) {
  const path = resolve(root, name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const required = [
  { key: "DATABASE_URL", hint: "PostgreSQL connection string" },
  { key: "AUTH_SECRET", hint: "Auth.js secret (openssl rand -base64 32)" },
  { key: "AUTH_URL", hint: "Canonical site URL for auth callbacks" },
  { key: "NEXT_PUBLIC_SITE_URL", hint: "Public site origin (https://...)" },
];

function hasContactDelivery() {
  const formspree = process.env.FORMSPREE_ENDPOINT?.trim();
  const webhook = process.env.CONTACT_WEBHOOK_URL?.trim();
  return Boolean(formspree || webhook);
}

let failed = false;

console.log("\nT.E.N.E.G.T.A — production environment check\n");

for (const { key, hint } of required) {
  const val = process.env[key]?.trim();
  if (val) {
    console.log(`✅ ${key}`);
  } else {
    console.log(`❌ ${key} — ${hint}`);
    failed = true;
  }
}

if (hasContactDelivery()) {
  const via = [];
  if (process.env.FORMSPREE_ENDPOINT?.trim()) via.push("FORMSPREE_ENDPOINT");
  if (process.env.CONTACT_WEBHOOK_URL?.trim()) via.push("CONTACT_WEBHOOK_URL");
  console.log(`✅ CONTACT (via ${via.join(" + ")})`);
} else {
  console.log(
    "❌ CONTACT — set FORMSPREE_ENDPOINT and/or CONTACT_WEBHOOK_URL",
  );
  failed = true;
}

console.log("");
if (failed) {
  console.error("Missing required environment variables. See site/.env.production.example\n");
  process.exit(1);
}
console.log("All required variables are set.\n");
