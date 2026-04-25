import { prisma } from "@/lib/prisma";

function utcDayStart(d: Date): number {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x.getTime();
}

export async function touchPartnerStreak(userId: string) {
  const today = utcDayStart(new Date());

  const existing = await prisma.userStreak.findUnique({
    where: { userId },
  });

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
