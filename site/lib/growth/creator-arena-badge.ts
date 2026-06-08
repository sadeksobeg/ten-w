import { prisma } from "@/lib/prisma";

export async function grantIfMissingBadge(userId: string, badgeKey: string): Promise<boolean> {
  const badge = await prisma.badgeDefinition.findUnique({ where: { key: badgeKey } });
  if (!badge) return false;

  const existing = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
  });
  if (existing) return false;

  await prisma.userBadge.create({
    data: { userId, badgeId: badge.id },
  });
  return true;
}
