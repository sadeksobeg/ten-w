/**
 * Generates clientDiscountCode for partner profiles that lack one.
 * Safe for production — only fills NULL codes, never changes existing data.
 *
 * Run: cd site && node scripts/backfill-client-discount-codes.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode() {
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return out;
}

async function uniqueCode() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const code = randomCode();
    const exists = await prisma.partnerProfile.findFirst({
      where: { clientDiscountCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error("Could not allocate code");
}

async function main() {
  const rows = await prisma.partnerProfile.findMany({
    where: { clientDiscountCode: null },
    select: { id: true, userId: true },
  });

  if (rows.length === 0) {
    console.log("All partner profiles already have discount codes.");
    return;
  }

  for (const row of rows) {
    const code = await uniqueCode();
    await prisma.partnerProfile.update({
      where: { id: row.id },
      data: { clientDiscountCode: code },
    });
    console.log(`OK: user ${row.userId} → ${code}`);
  }

  console.log(`Backfilled ${rows.length} discount code(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
