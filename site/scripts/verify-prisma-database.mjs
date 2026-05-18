/**
 * Ensures Prisma will use tenegta_db from site/.env (not shell DATABASE_URL)
 * and refuses foreign app schemas (e.g. clinicsaas clinic tables).
 */
import { PrismaClient } from "@prisma/client";
import { loadEnvFiles } from "./load-env-file.mjs";

const EXPECTED = process.env.EXPECTED_DB ?? "tenegta_db";
const FOREIGN_TABLES = [
  "appointments",
  "clinics",
  "patients",
  "staff_users",
  "audit_logs",
];

loadEnvFiles();

const fileUrl = process.env.DATABASE_URL?.trim();
if (!fileUrl) {
  console.error("DATABASE_URL missing in site/.env");
  process.exit(1);
}

let fileDb;
try {
  fileDb = decodeURIComponent(new URL(fileUrl).pathname.replace(/^\//, "").split("/")[0] ?? "");
} catch {
  console.error("Invalid DATABASE_URL in site/.env");
  process.exit(1);
}

if (fileDb !== EXPECTED) {
  console.error(`site/.env DATABASE_URL must use database "${EXPECTED}", not "${fileDb}"`);
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const rows = await prisma.$queryRaw`SELECT current_database()::text AS name`;
  const actual = rows[0]?.name;
  if (actual !== EXPECTED) {
    console.error(
      `SAFETY: PostgreSQL connected to "${actual}" but site/.env expects "${EXPECTED}".`,
    );
    console.error("Run: unset DATABASE_URL && bash scripts/server-update.sh");
    process.exit(1);
  }

  for (const table of FOREIGN_TABLES) {
    const found = await prisma.$queryRawUnsafe(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1 LIMIT 1`,
      table,
    );
    if (Array.isArray(found) && found.length > 0) {
      console.error(
        `SAFETY: table "${table}" exists — this looks like another app (e.g. clinicsaas).`,
      );
      console.error("Refusing Prisma schema changes. Restore from backup; use database tenegta_db only.");
      process.exit(2);
    }
  }

  console.log(`OK: connected to ${actual}`);
} finally {
  await prisma.$disconnect();
}
