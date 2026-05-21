import { prisma } from "@/lib/prisma";
import { utcDayKey } from "@/lib/growth/missions";

function utcDayStart(d: Date): number {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x.getTime();
}

export async function touchPartnerStreak(userId: string) {
  const today = utcDayStart(new Date());

  let existing: Awaited<ReturnType<typeof prisma.userStreak.findUnique>>;
  try {
    existing = await prisma.userStreak.findUnique({
      where: { userId },
    });
  } catch {
    return;
  }

  if (!existing) {
    await prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date(today),
      },
    });
    return;
  }

  const last = existing.lastActiveDate
    ? utcDayStart(existing.lastActiveDate)
    : null;

  if (last === today) {
    return;
  }

  const yesterday = today - 24 * 60 * 60 * 1000;
  let nextCurrent = 1;
  if (last === yesterday) {
    nextCurrent = existing.currentStreak + 1;
  }

  const nextLongest = Math.max(existing.longestStreak, nextCurrent);

  await prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: nextCurrent,
      longestStreak: nextLongest,
      lastActiveDate: new Date(today),
    },
  });
}

/** Records UTC day for activity heatmap (idempotent). */
export async function touchActivityDay(userId: string) {
  const day = utcDayKey();
  try {
    await prisma.userActivityDay.upsert({
      where: { userId_day: { userId, day } },
      create: { userId, day },
      update: {},
    });
  } catch {
    /* table may be missing before migration */
  }
}

export async function getActivityDays(userId: string, limit = 30): Promise<string[]> {
  try {
    const rows = await prisma.userActivityDay.findMany({
      where: { userId },
      orderBy: { day: "desc" },
      take: limit,
      select: { day: true },
    });
    return rows.map((r) => r.day);
  } catch {
    return [];
  }
}
