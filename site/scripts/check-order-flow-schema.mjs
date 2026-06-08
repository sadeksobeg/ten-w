/**
 * Verifies client-order migration columns exist before running upsert/backfill.
 * Exit 0 = ready, 1 = migration still needed.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const REQUIRED = [
  { table: "Product", column: "featuresJson" },
  { table: "PartnerProfile", column: "clientDiscountCode" },
  { table: "ClientOrder", column: "id" },
];

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
     LIMIT 1`,
    table,
    column,
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function main() {
  const missing = [];
  for (const { table, column } of REQUIRED) {
    const ok = await columnExists(table, column);
    if (!ok) missing.push(`${table}.${column}`);
  }

  if (missing.length > 0) {
    console.error("Missing columns:", missing.join(", "));
    console.error("Run: bash scripts/server-prisma.sh  (or npx prisma migrate deploy)");
    process.exit(1);
  }

  console.log("Order-flow schema OK.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
