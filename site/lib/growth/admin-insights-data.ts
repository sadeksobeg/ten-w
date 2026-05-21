import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type WeekWinRatePoint = {
  label: string;
  closed: number;
  lost: number;
};

export type TopPartnerRow = { label: string; value: number };

export type LevelDistRow = { label: string; value: number; color: string };

const LEVEL_COLORS = ["#B07D2B", "#6B8F71", "#5B7DB8", "#9B6BB8", "#C45C5C", "#4A9B9B"];

function weekLabel(d: Date): string {
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return `${m}/${day}`;
}

export async function getAdminInsightsCharts() {
  const now = new Date();
  const weeks: { start: Date; end: Date; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const end = new Date(now);
    end.setUTCDate(end.getUTCDate() - i * 7);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 6);
    weeks.push({ start, end, label: weekLabel(end) });
  }

  const earliest = weeks[0]!.start;
  const deals = await prisma.deal.findMany({
    where: {
      status: { in: [DealStatus.CLOSED, DealStatus.LOST] },
      OR: [{ closedAt: { gte: earliest } }, { lostAt: { gte: earliest } }],
    },
    select: { status: true, closedAt: true, lostAt: true },
  });

  const weeklyWinRateSeries: WeekWinRatePoint[] = weeks.map((w) => {
    let closed = 0;
    let lost = 0;
    for (const d of deals) {
      const at =
        d.status === DealStatus.CLOSED ? d.closedAt : d.lostAt;
      if (!at || at < w.start || at > w.end) continue;
      if (d.status === DealStatus.CLOSED) closed++;
      else lost++;
    }
    return { label: w.label, closed, lost };
  });

  const topRaw = await prisma.deal.groupBy({
    by: ["partnerId"],
    where: { status: DealStatus.CLOSED },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const partnerIds = topRaw.map((r) => r.partnerId);
  const users = await prisma.user.findMany({
    where: { id: { in: partnerIds } },
    select: { id: true, name: true, email: true },
  });
  const nameMap = new Map(users.map((u) => [u.id, u.name ?? u.email ?? u.id]));

  const topPartnersByClosed: TopPartnerRow[] = topRaw.map((r) => ({
    label: nameMap.get(r.partnerId) ?? r.partnerId,
    value: r._count.id,
  }));

  const levels = await prisma.levelDefinition.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { partnerProfiles: true } } },
  });

  const levelDistribution: LevelDistRow[] = levels.map((lv, i) => ({
    label: lv.name,
    value: lv._count.partnerProfiles,
    color: LEVEL_COLORS[i % LEVEL_COLORS.length]!,
  }));

  return { weeklyWinRateSeries, topPartnersByClosed, levelDistribution };
}
