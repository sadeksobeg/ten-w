import { DealStatus, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/growth/notify";
import { WEEK_MS, partnerRankDelta } from "@/lib/growth/leaderboard";
import { getPartnerRival } from "@/lib/growth/rival";
import { calculateOraclePrediction } from "@/lib/growth/oracle";
import { calculateDnaProfile } from "@/lib/growth/dna-score";
import { resolveLevelName } from "@/lib/growth/level-i18n";
import { pickEngagementText } from "@/lib/growth/engagement-i18n";
import { resolveChatSenderName } from "@/lib/growth/chat-display";

export type WeeklyChroniclePayload = {
  weekNumber: number;
  dateRange: string;
  partnerName: string;
  myWeek: {
    dealsAdded: number;
    dealsClosed: number;
    xpGained: number;
    rankChange: number;
    newBadges: string[];
    checkInDays: number;
  };
  rivalUpdate: {
    rivalName: string;
    rivalDeals: number;
    myDeals: number;
    note: string;
  } | null;
  oracleMessage: string;
  tip: string;
  motivation: string;
};

export function currentWeekKey(): string {
  const d = new Date();
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  return start.toISOString().slice(0, 10);
}

export function isSundayUtc(): boolean {
  return new Date().getUTCDay() === 0;
}

function weekRangeLabel(weekKey: string, locale: string): string {
  const start = new Date(`${weekKey}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 6 * 86400000);
  const fmt = (dt: Date) =>
    dt.toLocaleDateString(locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US", {
      month: "short",
      day: "numeric",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

export async function buildWeeklyChronicle(userId: string, locale: string): Promise<WeeklyChroniclePayload | null> {
  const since = new Date(Date.now() - WEEK_MS);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      isVerifiedOfficial: true,
      officialDisplayName: true,
      partnerProfile: {
        select: {
          createdAt: true,
          totalXp: true,
          currentLevel: { select: { order: true, name: true, minClosedDeals: true } },
        },
      },
      createdAt: true,
      streak: { select: { currentStreak: true } },
    },
  });
  if (!user?.partnerProfile) return null;

  const name = resolveChatSenderName(user);
  const weekKey = currentWeekKey();
  const memberDays = Math.max(
    1,
    Math.floor((Date.now() - user.partnerProfile.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
  );
  const closedTotal = await prisma.deal.count({
    where: { partnerId: userId, status: DealStatus.CLOSED },
  });
  const nextLevel = await prisma.levelDefinition.findFirst({
    where: { order: { gt: user.partnerProfile.currentLevel.order } },
    orderBy: { order: "asc" },
  });

  const [dealsAdded, dealsClosed, xpAgg, badges, activityDays, rankDelta, rival, dnaProfile] =
    await Promise.all([
      prisma.deal.count({ where: { partnerId: userId, createdAt: { gte: since } } }),
      prisma.deal.count({
        where: { partnerId: userId, status: DealStatus.CLOSED, closedAt: { gte: since } },
      }),
      prisma.xpEvent.aggregate({
        where: { userId, createdAt: { gte: since }, amount: { gt: 0 } },
        _sum: { amount: true },
      }),
      prisma.userBadge.findMany({
        where: { userId, grantedAt: { gte: since } },
        select: { badge: { select: { key: true } } },
      }),
      prisma.userActivityDay.count({
        where: { userId, day: { gte: since.toISOString().slice(0, 10) } },
      }),
      partnerRankDelta(userId, WEEK_MS),
      getPartnerRival(userId),
      calculateDnaProfile(userId),
    ]);

  const weeklyClosed = dealsClosed;
  const oracle = await calculateOraclePrediction({
    userId,
    closedDeals: closedTotal,
    totalXp: user.partnerProfile.totalXp,
    memberDays,
    streakCurrent: user.streak?.currentStreak ?? 0,
    nextLevel: nextLevel
      ? {
          minClosedDeals: nextLevel.minClosedDeals,
          name: resolveLevelName(nextLevel.name, locale),
        }
      : null,
    weeklyClosed,
    weeklyRank: null,
    rivalData: rival,
    dnaProfile,
  });

  const joinWeeks = Math.max(
    1,
    Math.floor((Date.now() - user.partnerProfile.createdAt.getTime()) / WEEK_MS),
  );

  let rivalUpdate: WeeklyChroniclePayload["rivalUpdate"] = null;
  if (rival) {
    rivalUpdate = {
      rivalName: rival.rival.name,
      rivalDeals: rival.rival.closedDealsThisWeek,
      myDeals: rival.myStats.closedDealsThisWeek,
      note:
        locale === "ar"
          ? rival.iAmAhead
            ? "أنت متقدم هذا الأسبوع"
            : "غريمك يضغط — ردّ الفعل الآن"
          : rival.iAmAhead
            ? "You are ahead this week"
            : "Your rival is pressing — respond now",
    };
  }

  return {
    weekNumber: joinWeeks,
    dateRange: weekRangeLabel(weekKey, locale),
    partnerName: name,
    myWeek: {
      dealsAdded,
      dealsClosed,
      xpGained: xpAgg._sum.amount ?? 0,
      rankChange: rankDelta ?? 0,
      newBadges: badges.map((b) => b.badge.key),
      checkInDays: activityDays,
    },
    rivalUpdate,
    oracleMessage:
      locale === "ar"
        ? oracle.daysToNextLevel
          ? `المستوى التالي على بُعد ${oracle.daysToNextLevel} يوماً تقريباً`
          : "الأسبوع القادم حاسم — ثبّت إيقاعك"
        : oracle.daysToNextLevel
          ? `Next level in about ${oracle.daysToNextLevel} days`
          : "Next week is decisive — keep your rhythm",
    tip:
      locale === "ar"
        ? `هدف الأسبوع: ${oracle.weeklyTarget.deals} صفقة و ${oracle.weeklyTarget.xp} نقطة`
        : `Weekly target: ${oracle.weeklyTarget.deals} deals and ${oracle.weeklyTarget.xp} XP`,
    motivation:
      locale === "ar"
        ? `زخمك: ${oracle.momentum}`
        : `Momentum: ${oracle.momentum}`,
  };
}

export async function generateWeeklyChronicleIfSunday(
  userId: string,
  locale: string,
): Promise<WeeklyChroniclePayload | null> {
  if (!isSundayUtc()) return null;
  const weekKey = currentWeekKey();
  const existing = await prisma.weeklyChronicle.findUnique({
    where: { userId_weekKey: { userId, weekKey } },
  });
  if (existing?.payload) return existing.payload as WeeklyChroniclePayload;

  const payload = await buildWeeklyChronicle(userId, locale);
  if (!payload) return null;

  await prisma.weeklyChronicle.upsert({
    where: { userId_weekKey: { userId, weekKey } },
    create: { userId, weekKey, payload: payload as object },
    update: { payload: payload as object },
  });

  await createNotification(prisma, {
    userId,
    type: NotificationType.SYSTEM,
    title: pickEngagementText(locale, {
      ar: "صحيفتك الأسبوعية جاهزة",
      en: "Your weekly chronicle is ready",
      fr: "Votre chronique hebdomadaire est prête",
    }),
    body: pickEngagementText(locale, {
      ar: `الأسبوع ${payload.weekNumber} — ${payload.dateRange}`,
      en: `Week ${payload.weekNumber} — ${payload.dateRange}`,
    }),
    link: "/growth",
    metadata: { kind: "weekly_chronicle", weekKey },
  });

  return payload;
}

export async function getLatestWeeklyChronicle(userId: string): Promise<WeeklyChroniclePayload | null> {
  const row = await prisma.weeklyChronicle.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (!row?.payload || typeof row.payload !== "object") return null;
  return row.payload as WeeklyChroniclePayload;
}
