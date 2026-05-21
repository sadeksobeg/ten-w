/**
 * Exit 0 if EventNotification exists on tenegta_db (from site/.env only).
 * Exit 1 otherwise. Always clears shell DATABASE_URL first.
 */
import { PrismaClient } from "@prisma/client";
import { loadEnvFiles } from "./load-env-file.mjs";

delete process.env.DATABASE_URL;
loadEnvFiles();

const prisma = new PrismaClient();

try {
  const dbRows = await prisma.$queryRaw`SELECT current_database()::text AS name`;
  const dbName = dbRows[0]?.name ?? "?";

  const tableRows = await prisma.$queryRaw`
    SELECT 1 AS ok FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'EventNotification'
    LIMIT 1`;

  if (!Array.isArray(tableRows) || tableRows.length === 0) {
    console.error(`Missing table EventNotification on database: ${dbName}`);
    process.exit(1);
  }

  console.log(`OK: EventNotification exists on ${dbName}`);
  process.exit(0);
} catch (e) {
  console.error("check-growth-0003 failed:", e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
