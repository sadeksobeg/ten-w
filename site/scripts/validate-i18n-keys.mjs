import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "messages");

function flatten(obj, prefix = "") {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out.push(...flatten(v, key));
    } else {
      out.push(key);
    }
  }
  return out;
}

const en = JSON.parse(readFileSync(join(root, "en.json"), "utf8"));
const ar = JSON.parse(readFileSync(join(root, "ar.json"), "utf8"));
const fr = JSON.parse(readFileSync(join(root, "fr.json"), "utf8"));

const enKeys = new Set(flatten(en));
const missingAr = [...enKeys].filter((k) => !flatten(ar).includes(k));
const missingFr = [...enKeys].filter((k) => !flatten(fr).includes(k));

if (missingAr.length) {
  console.error("ar.json missing keys:", missingAr.slice(0, 20).join(", "));
  if (missingAr.length > 20) console.error(`... and ${missingAr.length - 20} more`);
  process.exit(1);
}
if (missingFr.length) {
  console.error("fr.json missing keys:", missingFr.slice(0, 20).join(", "));
  if (missingFr.length > 20) console.error(`... and ${missingFr.length - 20} more`);
  process.exit(1);
}
console.log("i18n keys OK:", enKeys.size, "keys in en/ar/fr");
