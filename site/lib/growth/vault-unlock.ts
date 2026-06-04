import { DealStatus, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/growth/notify";
import { sumEarningsCents } from "@/lib/growth/commission";
import { pickEngagementText } from "@/lib/growth/engagement-i18n";

export type UnlockCriteria =
  | { type: "deals"; value: number }
  | { type: "xp"; value: number }
  | { type: "level_code"; value: string }
  | { type: "streak"; value: number }
  | { type: "revenue_cents"; value: number }
  | { type: "badge_key"; value: string }
  | { type: "hall_member" }
  | { type: "direct_referrals"; value: number };

export type VaultProgress = {
  current: number;
  target: number;
  met: boolean;
};

export function parseUnlockCriteria(raw: unknown): UnlockCriteria | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const type = o.type;
  if (type === "hall_member") return { type: "hall_member" };
  if (typeof type !== "string") return null;
  if (type === "deals" || type === "xp" || type === "streak" || type === "revenue_cents" || type === "direct_referrals") {
    const value = Number(o.value);
    if (!Number.isFinite(value)) return null;
    return { type, value } as UnlockCriteria;
  }
  if (type === "level_code" && typeof o.value === "string") {
    return { type: "level_code", value: o.value };
  }
  if (type === "badge_key" && typeof o.value === "string") {
    return { type: "badge_key", value: o.value };
  }
  return null;
}

export async function getPartnerVaultStats(userId: string): Promise<{
  closedDeals: number;
  totalXp: number;
  levelCode: string;
  currentStreak: number;
  revenueCents: number;
  directReferrals: number;
  inHall: boolean;
  badgeKeys: Set<string>;
}> {
  const [profile, closedDeals, streak, earnings, hall, badges, directCount] = await Promise.all([
    prisma.partnerProfile.findUnique({
      where: { userId },
      select: { totalXp: true, currentLevel: { select: { code: true } } },
    }),
    prisma.deal.count({ where: { partnerId: userId, status: DealStatus.CLOSED } }),
    prisma.userStreak.findUnique({ where: { userId } }),
    sumEarningsCents(userId),
    prisma.hallOfLegend.findUnique({ where: { partnerId: userId } }),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badge: { select: { key: true } } },
    }),
    prisma.partnerProfile.count({ where: { parentUserId: userId } }),
  ]);

  return {
    closedDeals,
    totalXp: profile?.totalXp ?? 0,
    levelCode: profile?.currentLevel.code ?? "starter",
    currentStreak: streak?.currentStreak ?? 0,
    revenueCents: earnings,
    directReferrals: directCount,
    inHall: Boolean(hall),
    badgeKeys: new Set(badges.map((b) => b.badge.key)),
  };
}

export function evaluateCriteria(criteria: UnlockCriteria, stats: Awaited<ReturnType<typeof getPartnerVaultStats>>): VaultProgress {
  switch (criteria.type) {
    case "deals":
      return { current: stats.closedDeals, target: criteria.value, met: stats.closedDeals >= criteria.value };
    case "xp":
      return { current: stats.totalXp, target: criteria.value, met: stats.totalXp >= criteria.value };
    case "level_code": {
      const order = ["starter", "hunter", "closer", "pro", "elite", "titan", "legend"];
      const need = order.indexOf(criteria.value);
      const have = order.indexOf(stats.levelCode);
      return { current: have < 0 ? 0 : have + 1, target: need < 0 ? 1 : need + 1, met: have >= need && need >= 0 };
    }
    case "streak":
      return { current: stats.currentStreak, target: criteria.value, met: stats.currentStreak >= criteria.value };
    case "revenue_cents":
      return { current: stats.revenueCents, target: criteria.value, met: stats.revenueCents >= criteria.value };
    case "badge_key":
      return { current: stats.badgeKeys.has(criteria.value) ? 1 : 0, target: 1, met: stats.badgeKeys.has(criteria.value) };
    case "hall_member":
      return { current: stats.inHall ? 1 : 0, target: 1, met: stats.inHall };
    case "direct_referrals":
      return { current: stats.directReferrals, target: criteria.value, met: stats.directReferrals >= criteria.value };
    default:
      return { current: 0, target: 1, met: false };
  }
}

export async function syncVaultUnlocks(userId: string, locale: string): Promise<number> {
  const stats = await getPartnerVaultStats(userId);
  const items = await prisma.vaultItem.findMany({ where: { isActive: true }, orderBy: { order: "asc" } });
  const existing = await prisma.userVaultUnlock.findMany({
    where: { userId },
    select: { vaultItemId: true },
  });
  const unlockedIds = new Set(existing.map((e) => e.vaultItemId));
  let newly = 0;

  for (const item of items) {
    if (unlockedIds.has(item.id)) continue;
    const criteria = parseUnlockCriteria(item.unlockCriteria);
    if (!criteria) continue;
    const progress = evaluateCriteria(criteria, stats);
    if (!progress.met) continue;

    await prisma.userVaultUnlock.create({
      data: { userId, vaultItemId: item.id },
    });
    newly += 1;
    const title = locale === "ar" ? item.titleAr : item.titleEn;
    await createNotification(prisma, {
      userId,
      type: NotificationType.SYSTEM,
      title: pickEngagementText(locale, {
        ar: "فتحت محتوى جديداً في القبو",
        en: "You unlocked new Vault content",
        fr: "Nouveau contenu du Coffre débloqué",
      }),
      body: title,
      link: "/growth/vault",
      metadata: { kind: "vault_unlock", slug: item.slug },
    });
  }

  return newly;
}

export async function countVaultUnlocks(userId: string): Promise<number> {
  return prisma.userVaultUnlock.count({ where: { userId } });
}
