/**
 * VPS diagnostic: Growth DB + admin overview queries.
 * Exit 0 when healthy; exit 1 with hints otherwise.
 *
 *   unset DATABASE_URL
 *   cd site && node scripts/check-growth-health.mjs
 */
import { PrismaClient } from "@prisma/client";
import { loadEnvFiles } from "./load-env-file.mjs";

loadEnvFiles();
const prisma = new PrismaClient();

const checks = [];

async function row(sql) {
  return prisma.$queryRawUnsafe(sql);
}

try {
  await row(`SELECT 1 FROM "EventNotification" LIMIT 1`);
  checks.push(["0003 EventNotification", "ok"]);
} catch (e) {
  checks.push(["0003 EventNotification", `FAIL: ${e.message?.slice(0, 120)}`]);
}

try {
  const cols = await row(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'GrowthEvent' AND column_name = 'coverImage'
  `);
  const ok = Array.isArray(cols) && cols.length > 0;
  checks.push(["0004 GrowthEvent.coverImage", ok ? "ok" : "FAIL: column missing"]);
} catch (e) {
  checks.push(["0004 GrowthEvent.coverImage", `FAIL: ${e.message?.slice(0, 120)}`]);
}

try {
  await row(`SELECT 1 FROM "ActivityEvent" LIMIT 1`);
  checks.push(["ActivityEvent table", "ok"]);
} catch (e) {
  checks.push(["ActivityEvent table", `FAIL (optional): ${e.message?.slice(0, 80)}`]);
}

try {
  await row(`SELECT 1 FROM "Notification" LIMIT 1`);
  checks.push(["Notification table", "ok"]);
} catch (e) {
  checks.push(["Notification table", `FAIL: ${e.message?.slice(0, 120)}`]);
}

try {
  const admin = await prisma.user.findUnique({
    where: { email: "admin@tenegta.local" },
    select: { id: true, role: true, isActive: true },
  });
  checks.push([
    "admin@tenegta.local",
    admin?.role === "ADMIN" ? `ok (active=${admin.isActive})` : "FAIL: missing or not ADMIN",
  ]);
} catch (e) {
  checks.push(["admin@tenegta.local", `FAIL: ${e.message?.slice(0, 120)}`]);
}

try {
  const [users, partners, closed] = await Promise.all([
    prisma.user.count(),
    prisma.partnerProfile.count(),
    prisma.deal.count({ where: { status: "CLOSED" } }),
  ]);
  checks.push([
    "admin overview counts",
    `ok (users=${users} partners=${partners} closedDeals=${closed})`,
  ]);
} catch (e) {
  checks.push(["admin overview counts", `FAIL: ${e.message?.slice(0, 160)}`]);
}

for (const [name, result] of checks) {
  console.log(`${result.startsWith("ok") ? "OK" : "!!"}  ${name}: ${result}`);
}

const failed = checks.some(([, r]) => !String(r).startsWith("ok"));
if (failed) {
  console.log("\nRepair:");
  console.log("  bash scripts/server-repair-growth-0003.sh --force");
  console.log("  bash scripts/run-seed.sh");
  console.log("  cd site && npx prisma migrate deploy");
  console.log("  bash scripts/server-restart.sh");
  process.exit(1);
}

console.log("\nAll Growth health checks passed.");
process.exit(0);
} finally {
  await prisma.$disconnect();
}
