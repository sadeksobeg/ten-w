import { prisma } from "@/lib/prisma";
import { resolveChatSenderName } from "@/lib/growth/chat-display";
import { calculateDnaProfile } from "@/lib/growth/dna-score";

export type HallLegendEntry = {
  id: string;
  rank: number;
  monthAdded: string;
  achievement: string;
  quote: string | null;
  partner: {
    userId: string;
    name: string;
    publicSlug: string | null;
    avatarUrl: string | null;
    avatarPreset: string | null;
    levelCode: string;
    levelName: string;
    cardNumber: number | null;
    closedDeals: number;
    dnaArchetype: string;
  };
};

const MAX_LEGENDS = 10;

export async function listHallOfLegends(): Promise<HallLegendEntry[]> {
  const rows = await prisma.hallOfLegend.findMany({
    orderBy: { rank: "asc" },
    take: MAX_LEGENDS,
    include: {
      partner: {
        select: {
          id: true,
          name: true,
          email: true,
          publicSlug: true,
          avatarUrl: true,
          avatarPreset: true,
          isVerifiedOfficial: true,
          officialDisplayName: true,
          partnerProfile: {
            select: {
              cardNumber: true,
              currentLevel: { select: { code: true, name: true } },
            },
          },
          deals: { where: { status: "CLOSED" }, select: { id: true } },
        },
      },
    },
  });

  const entries: HallLegendEntry[] = [];
  for (const row of rows) {
    const p = row.partner;
    if (!p.partnerProfile) continue;
    const dna = await calculateDnaProfile(p.id);
    entries.push({
      id: row.id,
      rank: row.rank,
      monthAdded: row.monthAdded,
      achievement: row.achievement,
      quote: row.quote,
      partner: {
        userId: p.id,
        name: resolveChatSenderName(p),
        publicSlug: p.publicSlug,
        avatarUrl: p.avatarUrl,
        avatarPreset: p.avatarPreset,
        levelCode: p.partnerProfile.currentLevel.code,
        levelName: p.partnerProfile.currentLevel.name,
        cardNumber: p.partnerProfile.cardNumber,
        closedDeals: p.deals.length,
        dnaArchetype: dna.archetype,
      },
    });
  }
  return entries;
}

export async function isPartnerInHall(partnerUserId: string): Promise<boolean> {
  const row = await prisma.hallOfLegend.findUnique({ where: { partnerId: partnerUserId } });
  return Boolean(row);
}

export async function nextLegendRank(): Promise<number> {
  const last = await prisma.hallOfLegend.findFirst({
    orderBy: { rank: "desc" },
    select: { rank: true },
  });
  return (last?.rank ?? 0) + 1;
}

export function emptyLegendSlots(filledCount: number): number[] {
  const slots: number[] = [];
  for (let r = filledCount + 1; r <= MAX_LEGENDS; r += 1) slots.push(r);
  return slots;
}
