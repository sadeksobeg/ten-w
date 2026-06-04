import { DealStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { resolveChatSenderName } from "@/lib/growth/chat-display";

export interface GhostData {
  legendName: string;
  legendSlug: string | null;
  compareDate: Date;
  ghostDeals: number;
  ghostXp: number;
  ghostStreak: number;
  myDeals: number;
  myXp: number;
  myStreak: number;
  daysOnPlatform: number;
  gaps: { deals: number; xp: number; streak: number };
  catchUpTip: string;
}

async function findTopPerformerUserId(): Promise<string | null> {
  const grouped = await prisma.deal.groupBy({
    by: ["partnerId"],
    where: { status: DealStatus.CLOSED },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });
  return grouped[0]?.partnerId ?? null;
}

async function metricsAtDay(userId: string, dayIndex: number, joinDate: Date) {
  const cutoff = new Date(joinDate.getTime() + dayIndex * 86400000);
  const [deals, xpAgg, profile] = await Promise.all([
    prisma.deal.count({
      where: {
        partnerId: userId,
        status: DealStatus.CLOSED,
        closedAt: { lte: cutoff },
      },
    }),
    prisma.xpEvent.aggregate({
      where: { userId, createdAt: { lte: cutoff } },
      _sum: { amount: true },
    }),
    prisma.partnerProfile.findUnique({
      where: { userId },
      select: { createdAt: true },
    }),
  ]);
  const streak = await prisma.userStreak.findUnique({ where: { userId } });
  return {
    deals,
    xp: Math.max(0, xpAgg._sum.amount ?? 0),
    streak: streak?.currentStreak ?? 0,
    joinDate: profile?.createdAt ?? joinDate,
  };
}

const cachedLegendId = unstable_cache(
  async () => findTopPerformerUserId(),
  ["ghost-legend-id"],
  { revalidate: 900 },
);

export async function getGhostData(partnerUserId: string, locale: string): Promise<GhostData | null> {
  const legendId = await cachedLegendId();
  if (!legendId || legendId === partnerUserId) return null;

  const [me, legend] = await Promise.all([
    prisma.partnerProfile.findUnique({
      where: { userId: partnerUserId },
      include: { user: { select: { name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true } } },
    }),
    prisma.user.findUnique({
      where: { id: legendId },
      select: {
        name: true,
        email: true,
        publicSlug: true,
        isVerifiedOfficial: true,
        officialDisplayName: true,
        partnerProfile: { select: { createdAt: true } },
      },
    }),
  ]);
  if (!me || !legend?.partnerProfile) return null;

  const daysOnPlatform = Math.max(
    1,
    Math.floor((Date.now() - me.createdAt.getTime()) / 86400000),
  );
  const legendJoin = legend.partnerProfile.createdAt;
  const ghostAt = await metricsAtDay(legendId, daysOnPlatform, legendJoin);

  const myDeals = await prisma.deal.count({
    where: { partnerId: partnerUserId, status: DealStatus.CLOSED },
  });
  const myProfile = await prisma.partnerProfile.findUnique({ where: { userId: partnerUserId } });
  const myStreak = (await prisma.userStreak.findUnique({ where: { userId: partnerUserId } }))
    ?.currentStreak ?? 0;

  const gaps = {
    deals: myDeals - ghostAt.deals,
    xp: (myProfile?.totalXp ?? 0) - ghostAt.xp,
    streak: myStreak - ghostAt.streak,
  };

  let catchUpTip =
    locale === "ar"
      ? "ركّز على صفقة واحدة اليوم — الفارق قابل للتجسير"
      : "Focus on one deal today — the gap is bridgeable";
  if (gaps.deals < -1) {
    catchUpTip =
      locale === "ar"
        ? `أغلق ${Math.abs(gaps.deals) + 1} صفقات لتتجاوز الشبح في نفس مرحلة المسار`
        : `Close ${Math.abs(gaps.deals) + 1} deals to pass the ghost at this stage`;
  } else if (gaps.xp < -200) {
    catchUpTip =
      locale === "ar"
        ? "أكمل مهمة يومية وزد نشاطك — XP يتسارع مع الانتظام"
        : "Complete daily missions — XP accelerates with consistency";
  }

  return {
    legendName: resolveChatSenderName(legend),
    legendSlug: legend.publicSlug,
    compareDate: new Date(me.createdAt.getTime() + daysOnPlatform * 86400000),
    ghostDeals: ghostAt.deals,
    ghostXp: ghostAt.xp,
    ghostStreak: ghostAt.streak,
    myDeals,
    myXp: myProfile?.totalXp ?? 0,
    myStreak,
    daysOnPlatform,
    gaps,
    catchUpTip,
  };
}
