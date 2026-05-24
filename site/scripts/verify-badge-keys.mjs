/**
 * Ensures badge keys stay aligned between seed.ts and BADGE_DEFS.
 * Run: node scripts/verify-badge-keys.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seedSrc = readFileSync(join(root, "prisma/seed.ts"), "utf8");
const visualSrc = readFileSync(join(root, "lib/growth/badge-visual.ts"), "utf8");

const seedSection = seedSrc.slice(
  seedSrc.indexOf("const badgeDefs"),
  seedSrc.indexOf("for (const b of badgeDefs)"),
);
const seedKeys = [...seedSection.matchAll(/key:\s*"([a-z0-9_]+)"/g)].map((m) => m[1]);

const defKeys = [...visualSrc.matchAll(/^\s+([a-z0-9_]+):\s+b\(/gm)].map((m) => m[1]);

const missingInDefs = seedKeys.filter((k) => !defKeys.includes(k));
const missingInSeed = defKeys.filter((k) => !seedKeys.includes(k));

if (missingInDefs.length) {
  console.error("BADGE_DEFS missing keys from seed:", missingInDefs.join(", "));
  process.exit(1);
}
if (missingInSeed.length) {
  console.error("seed.ts missing keys from BADGE_DEFS:", missingInSeed.join(", "));
  process.exit(1);
}

console.log(`OK: ${defKeys.length} badge keys aligned (seed + BADGE_DEFS)`);
