/**
 * Generates docs/SITE-CONTENT-CATALOG.md from messages (en/ar/fr) + fallback-data.ts
 * Run: node scripts/generate-site-content-catalog.mjs (from site/)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function flatten(obj, prefix = "") {
  const out = {};
  if (obj === null || obj === undefined) return out;
  if (typeof obj !== "object") {
    out[prefix || "_"] = String(obj);
    return out;
  }
  if (Array.isArray(obj)) {
    out[prefix] = JSON.stringify(obj);
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] =
        v == null ? "" : Array.isArray(v) ? JSON.stringify(v) : String(v);
    }
  }
  return out;
}

/** Markdown table cell: one line, pipes escaped */
function cell(s) {
  return String(s)
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, " ")
    .replace(/\|/g, "\\|");
}

const messagesDir = path.join(__dirname, "../messages");
const en = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"));
const ar = JSON.parse(fs.readFileSync(path.join(messagesDir, "ar.json"), "utf8"));
const fr = JSON.parse(fs.readFileSync(path.join(messagesDir, "fr.json"), "utf8"));

const flatEn = flatten(en);
const flatAr = flatten(ar);
const flatFr = flatten(fr);
const allKeys = new Set([
  ...Object.keys(flatEn),
  ...Object.keys(flatAr),
  ...Object.keys(flatFr),
]);

const byNs = new Map();
for (const key of [...allKeys].sort()) {
  const ns = key.split(".")[0];
  if (!byNs.has(ns)) byNs.set(ns, []);
  byNs.get(ns).push(key);
}

const lines = [];
lines.push("# كتالوج محتوى موقع T.E.N.E.G.T.A");
lines.push("");
lines.push(
  "> **مصدر التوليد:** `site/messages/en.json`, `ar.json`, `fr.json`، و`site/lib/fallback-data.ts`."
);
lines.push(`> **تاريخ التوليد:** ${new Date().toISOString().slice(0, 10)}`);
lines.push("");
lines.push("## ترجمات الواجهة (next-intl)");
lines.push("");
lines.push(
  "جدول لكل مساحة اسم (namespace) يعرض المفتاح والنصوص بالإنجليزية والعربية والفرنسية."
);
lines.push("");

for (const [ns, keys] of [...byNs.entries()].sort((a, b) =>
  a[0].localeCompare(b[0])
)) {
  lines.push(`### ${ns}`);
  lines.push("");
  lines.push("| المفتاح | English | العربية | Français |");
  lines.push("|---------|---------|---------|----------|");
  for (const key of keys) {
    lines.push(
      `| ${cell(key)} | ${cell(flatEn[key] ?? "")} | ${cell(flatAr[key] ?? "")} | ${cell(flatFr[key] ?? "")} |`
    );
  }
  lines.push("");
}

const fallbackPath = path.join(__dirname, "../lib/fallback-data.ts");
lines.push("---");
lines.push("");
lines.push(
  "## بيانات احتياطية (مشاريع، مدونة، فريق، وظائف، دراسات حالة، تقنيات)"
);
lines.push("");
lines.push("المصدر: `site/lib/fallback-data.ts` (كامل الملف).");
lines.push("");
lines.push("```typescript");
lines.push(fs.readFileSync(fallbackPath, "utf8").trimEnd());
lines.push("```");
lines.push("");

const outPath = path.join(__dirname, "../../docs/SITE-CONTENT-CATALOG.md");
fs.writeFileSync(outPath, lines.join("\n"), "utf8");
console.log("Wrote", outPath, "size", fs.statSync(outPath).size);
