import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveChatSenderName } from "@/lib/growth/chat-display";
import { resolveLevelName } from "@/lib/growth/level-i18n";

export interface ChronicleChapter {
  number: number;
  titleAr: string;
  titleEn: string;
  dateRange: string;
  bodyAr: string;
  bodyEn: string;
  highlight: string;
  xpGained: number;
  dealsInPeriod: number;
  isOngoing?: boolean;
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string, locale: string): string {
  const [y, m] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, 1));
  return dt.toLocaleDateString(locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US", {
    month: "long",
    year: "numeric",
  });
}

export async function generateChronicle(partnerUserId: string, locale: string): Promise<ChronicleChapter[]> {
  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: partnerUserId },
    include: {
      user: { select: { name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true } },
      currentLevel: true,
    },
  });
  if (!profile) return [];

  const name = resolveChatSenderName(profile.user);
  const join = profile.createdAt;
  const now = new Date();
  const months: string[] = [];
  let cursor = new Date(Date.UTC(join.getUTCFullYear(), join.getUTCMonth(), 1));
  while (cursor <= now) {
    months.push(monthKey(cursor));
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }

  const [deals, xpEvents, badges] = await Promise.all([
    prisma.deal.findMany({
      where: { partnerId: partnerUserId },
      orderBy: { createdAt: "asc" },
      include: { product: { select: { name: true } } },
    }),
    prisma.xpEvent.findMany({
      where: { userId: partnerUserId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.userBadge.findMany({
      where: { userId: partnerUserId },
      include: { badge: { select: { key: true, name: true } } },
    }),
  ]);

  const chapters: ChronicleChapter[] = [];
  let chapterNum = 0;

  for (let i = 0; i < months.length; i++) {
    const key = months[i]!;
    const [y, m] = key.split("-").map(Number);
    const start = new Date(Date.UTC(y!, m! - 1, 1));
    const end = new Date(Date.UTC(y!, m!, 0, 23, 59, 59, 999));
    const isLast = i === months.length - 1;

    const periodDeals = deals.filter(
      (d) => d.status === DealStatus.CLOSED && d.closedAt && d.closedAt >= start && d.closedAt <= end,
    );
    const xpGained = xpEvents
      .filter((e) => e.createdAt >= start && e.createdAt <= end && e.amount > 0)
      .reduce((s, e) => s + e.amount, 0);

    chapterNum += 1;
    const titleAr = i === 0 ? "البداية" : isLast ? "يُكتب الآن" : "الصعود";
    const titleEn = i === 0 ? "The Beginning" : isLast ? "Still Writing" : "The Ascent";

    let bodyAr = "";
    let bodyEn = "";
    let highlight = "";

    if (i === 0) {
      bodyAr = `في ${monthLabel(key, "ar")}، انضم ${name} إلى TENEGTA ASCEND. خطوة أولى في مسار لم يعرف بعد إلى أين ستقوده.`;
      bodyEn = `In ${monthLabel(key, "en")}, ${name} joined TENEGTA ASCEND — a first step on an unknown path.`;
      highlight = locale === "ar" ? "بداية الرحلة" : "Journey begins";
    } else if (periodDeals.length > 0) {
      const first = periodDeals[0]!;
      bodyAr = `أغلق ${periodDeals.length} صفقة هذا الشهر. الأولى: ${first.clientLabel ?? "عميل"} — ${first.product.name}.`;
      bodyEn = `Closed ${periodDeals.length} deal(s) this month. First: ${first.clientLabel ?? "client"} — ${first.product.name}.`;
      highlight = locale === "ar" ? `${periodDeals.length} صفقة` : `${periodDeals.length} deals`;
    } else {
      bodyAr = `${name} بنى حضوره وشبكته — التحضير قبل القفزة التالية.`;
      bodyEn = `${name} built presence and network — preparation before the next leap.`;
      highlight = locale === "ar" ? "بناء" : "Building";
    }

    const periodBadges = badges.filter((b) => b.grantedAt >= start && b.grantedAt <= end);
    if (periodBadges.length > 0) {
      const b = periodBadges[periodBadges.length - 1]!;
      bodyAr += ` شارة جديدة: ${b.badge.name}.`;
      bodyEn += ` New badge: ${b.badge.name}.`;
    }

    if (isLast) {
      const pending = deals.filter(
        (d) => d.status !== DealStatus.CLOSED && d.status !== DealStatus.LOST,
      ).length;
      bodyAr = `الفصل ${chapterNum} لا يزال يُكتب… ${name} يعمل على ${pending} صفقة. ما سيحدث في الأيام القادمة — قراره هو.`;
      bodyEn = `Chapter ${chapterNum} is still being written… ${name} has ${pending} open deal(s). What happens next is their call.`;
      highlight = resolveLevelName(profile.currentLevel.name, locale);
    }

    chapters.push({
      number: chapterNum,
      titleAr,
      titleEn,
      dateRange: monthLabel(key, locale),
      bodyAr,
      bodyEn,
      highlight,
      xpGained,
      dealsInPeriod: periodDeals.length,
      isOngoing: isLast,
    });
  }

  return chapters;
}
