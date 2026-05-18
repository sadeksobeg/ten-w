/**
 * Merges missing keys from en.json into fr.json (keeps existing fr values).
 * Run: node scripts/sync-fr-from-en.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "messages");

function deepMerge(base, overlay) {
  const out = { ...base };
  for (const [k, v] of Object.entries(overlay)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = deepMerge(base[k] ?? {}, v);
    } else if (!(k in out)) {
      out[k] = v;
    }
  }
  return out;
}

const en = JSON.parse(readFileSync(join(root, "en.json"), "utf8"));
const fr = JSON.parse(readFileSync(join(root, "fr.json"), "utf8"));
const merged = deepMerge(en, fr);
writeFileSync(join(root, "fr.json"), `${JSON.stringify(merged, null, 2)}\n`, "utf8");
console.log("Merged en keys into fr.json");
