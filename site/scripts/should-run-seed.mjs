/**
 * Exit 0 only when the database is empty (safe to run destructive seed).
 * Exit 1 when any User row exists — seed must NOT run on production updates.
 */
import { PrismaClient } from "@prisma/client";
import { loadEnvFiles } from "./load-env-file.mjs";

loadEnvFiles();
const prisma = new PrismaClient();

try {
  const count = await prisma.user.count();
  if (count > 0) {
    console.log(`[seed] skipped: ${count} user(s) already in database`);
    process.exit(1);
  }
  console.log("[seed] database empty — seed allowed");
  process.exit(0);
} catch (e) {
  console.error("[seed] could not check users:", e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
