/**
 * Set admin@tenegta.local password without running full db seed.
 * Usage (from site/):
 *   node scripts/set-growth-admin-password.mjs "YourNewPassword"
 * Or set GROWTH_ADMIN_PASSWORD in site/.env and run without args.
 */
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";
import { loadEnvFiles } from "./load-env-file.mjs";

delete process.env.DATABASE_URL;
loadEnvFiles();

const password = process.argv[2]?.trim() || process.env.GROWTH_ADMIN_PASSWORD?.trim();
if (!password || password.length < 8) {
  console.error("Provide a password (min 8 chars):");
  console.error('  node scripts/set-growth-admin-password.mjs "YourNewPassword"');
  console.error("  or set GROWTH_ADMIN_PASSWORD in site/.env and run with no args");
  process.exit(1);
}

const email = "admin@tenegta.local";
const prisma = new PrismaClient();

try {
  await prisma.$queryRaw`SELECT current_database()::text AS name`;
  const hash = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hash,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
    console.log(`OK: password updated for ${email}`);
  } else {
    await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        name: "Growth Admin",
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
    console.log(`OK: created ${email} (no PartnerProfile — admin only)`);
  }
} catch (e) {
  console.error("Failed:", e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
