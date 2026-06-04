import { DealStatus, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/growth/notify";
import { pickEngagementText } from "@/lib/growth/engagement-i18n";

export type MemoryEvent = {
  memoryKey: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  icon: string;
  link?: string;
};

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const b = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

export async function discoverMemoryEvents(userId: string): Promise<MemoryEvent[]> {
  const now = new Date();
  const events: MemoryEvent[] = [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      partnerProfile: { select: { createdAt: true, oathDate: true } },
      streak: true,
    },
  });
  if (!user?.partnerProfile) return events;

  const joinDate = user.partnerProfile.createdAt;
  const daysSinceJoin = daysBetween(joinDate, now);

  if (daysSinceJoin === 365) {
    events.push({
      memoryKey: "join_365d",
      titleAr: "قبل عام بالضبط",
      titleEn: "Exactly one year ago",
      bodyAr: "انضممت إلى TENEGTA ASCEND. شكراً أنك لم تتوقف.",
      bodyEn: "You joined TENEGTA ASCEND. Thank you for not stopping.",
      icon: "anniversary",
      link: "/growth/chronicle",
    });
  }

  if (daysSinceJoin === 180) {
    events.push({
      memoryKey: "join_180d",
      titleAr: "نصف سنة على الرحلة",
      titleEn: "Half a year on the journey",
      bodyAr: "ستة أشهر من البناء الحقيقي — استمر.",
      bodyEn: "Six months of real building — keep going.",
      icon: "milestone",
    });
  }

  const firstDeal = await prisma.deal.findFirst({
    where: { partnerId: userId, status: DealStatus.CLOSED },
    orderBy: { closedAt: "asc" },
    select: { closedAt: true },
  });
  if (firstDeal?.closedAt) {
    const d = daysBetween(firstDeal.closedAt, now);
    if (d === 180 || d === 90 || d === 30) {
      const closed = await prisma.deal.count({
        where: { partnerId: userId, status: DealStatus.CLOSED },
      });
      events.push({
        memoryKey: `first_deal_${d}d`,
        titleAr: `قبل ${d} يوماً — صفقتك الأولى`,
        titleEn: `${d} days ago — your first deal`,
        bodyAr: `اليوم أغلقت ${closed} صفقة. شكراً أنك لم تتوقف.`,
        bodyEn: `Today you have ${closed} closed deals. Thank you for staying.`,
        icon: "deal",
        link: "/growth/deals",
      });
    }
  }

  const capsule = await prisma.timeCapsule.findUnique({ where: { userId } });
  if (capsule && !capsule.wasDelivered && sameCalendarDay(capsule.createdAt, new Date(now.getTime() - 30 * 86400000))) {
    events.push({
      memoryKey: "capsule_30d_echo",
      titleAr: "منذ 30 يوماً كتبت لنفسك",
      titleEn: "30 days ago you wrote to yourself",
      bodyAr: "كبسولة الزمن ما زالت في الطريق — ثابر على أهدافك.",
      bodyEn: "Your time capsule is still on the way — stay on your goals.",
      icon: "capsule",
      link: "/growth",
    });
  }

  if (user.streak && user.streak.longestStreak > 0) {
    const lastBreak = user.streak.lastActiveDate;
    if (lastBreak) {
      const echoDays = [90, 180];
      for (const d of echoDays) {
        const target = new Date(now.getTime() - d * 86400000);
        if (sameCalendarDay(lastBreak, target) && user.streak.currentStreak > 14) {
          events.push({
            memoryKey: `streak_echo_${d}d`,
            titleAr: `اليوم قبل ${d} يوماً — انكسرت سلسلتك`,
            titleEn: `${d} days ago your streak broke`,
            bodyAr: `سلسلتك الآن ${user.streak.currentStreak} يوماً — لم تنكسر منذها.`,
            bodyEn: `Your streak is now ${user.streak.currentStreak} days — unbroken since.`,
            icon: "streak",
          });
        }
      }
    }
  }

  const nowMonth = now.getUTCMonth();
  const nowDay = now.getUTCDate();
  if (nowDay === 1) {
    events.push({
      memoryKey: `monthly_${now.getUTCFullYear()}_${nowMonth + 1}`,
      titleAr: "ملخص الشهر",
      titleEn: "Monthly echo",
      bodyAr: "بداية شهر جديد — راجع سجلك وصحيفتك.",
      bodyEn: "A new month — review your chronicle and weekly paper.",
      icon: "calendar",
      link: "/growth/chronicle",
    });
  }

  return events;
}

export async function deliverMemoryEvents(userId: string, locale: string): Promise<number> {
  const pending = await discoverMemoryEvents(userId);
  let sent = 0;
  for (const ev of pending) {
    const exists = await prisma.platformMemoryDelivery.findUnique({
      where: { userId_memoryKey: { userId, memoryKey: ev.memoryKey } },
    });
    if (exists) continue;

    await prisma.platformMemoryDelivery.create({
      data: { userId, memoryKey: ev.memoryKey },
    });

    await createNotification(prisma, {
      userId,
      type: NotificationType.SYSTEM,
      title: locale === "ar" ? ev.titleAr : ev.titleEn,
      body: locale === "ar" ? ev.bodyAr : ev.bodyEn,
      link: ev.link ?? "/growth",
      metadata: { kind: "platform_memory", icon: ev.icon, memoryKey: ev.memoryKey },
    });
    sent += 1;
  }
  return sent;
}
