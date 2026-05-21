/**
 * Exit 0 if Growth 0003 tables exist; exit 1 otherwise.
 */
import { PrismaClient } from "@prisma/client";
import { loadEnvFiles } from "./load-env-file.mjs";

loadEnvFiles();
const prisma = new PrismaClient();

try {
  await prisma.$queryRaw`SELECT 1 FROM "EventNotification" LIMIT 1`;
  process.exit(0);
} catch {
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
