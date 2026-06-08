import { PrismaClient, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uniqueClientDiscountCode } from "@/lib/growth/client-discount-code";

function randomReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]!;
  }
  return out;
}

async function uniqueReferralCode(client: PrismaClient): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = randomReferralCode();
    const exists = await client.partnerProfile.findUnique({
      where: { referralCode: code },
    });
    if (!exists) return code;
  }
  throw new Error("Could not allocate referral code");
}

/** Creates PartnerProfile for PARTNER users who lack one (e.g. legacy accounts). */
export async function ensurePartnerProfile(userId: string) {
  const existing = await prisma.partnerProfile.findUnique({
    where: { userId },
    include: { currentLevel: true },
  });
  if (existing) return existing;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== UserRole.PARTNER) return null;

  const starter = await prisma.levelDefinition.findFirst({
    orderBy: { order: "asc" },
  });
  if (!starter) {
    throw new Error("missing_seed");
  }

  return prisma.partnerProfile.create({
    data: {
      userId,
      referralCode: await uniqueReferralCode(prisma),
      clientDiscountCode: await uniqueClientDiscountCode(prisma),
      parentUserId: null,
      currentLevelId: starter.id,
    },
    include: { currentLevel: true },
  });
}

/** Ensures every partner profile has a client discount code (backfill for legacy rows). */
export async function ensureClientDiscountCode(userId: string): Promise<string | null> {
  const profile = await prisma.partnerProfile.findUnique({
    where: { userId },
    select: { clientDiscountCode: true },
  });
  if (!profile) return null;
  if (profile.clientDiscountCode) return profile.clientDiscountCode;

  const code = await uniqueClientDiscountCode(prisma);
  await prisma.partnerProfile.update({
    where: { userId },
    data: { clientDiscountCode: code },
  });
  return code;
}
