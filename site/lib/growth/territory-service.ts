import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveChatSenderName } from "@/lib/growth/chat-display";
import { getPartnerRival } from "@/lib/growth/rival";
import {
  TERRITORY_COORDS,
  TERRITORY_KEYS,
  type TerritoryKey,
  type WarMapData,
  type WarMapNetworkLine,
} from "@/lib/growth/territories";

export {
  TERRITORY_KEYS,
  TERRITORY_COORDS,
  type TerritoryKey,
  type WarMapData,
  type WarMapCity,
  type WarMapNetworkLine,
} from "@/lib/growth/territories";

export async function getWarMapData(viewerUserId?: string): Promise<WarMapData> {
  const profiles = await prisma.partnerProfile.findMany({
    where: { territory: { not: null } },
    select: {
      userId: true,
      territory: true,
      user: {
        select: {
          name: true,
          email: true,
          isVerifiedOfficial: true,
          officialDisplayName: true,
        },
      },
    },
  });

  const userIds = profiles.map((p) => p.userId);
  const dealCounts =
    userIds.length > 0
      ? await prisma.deal.groupBy({
          by: ["partnerId"],
          where: { partnerId: { in: userIds }, status: DealStatus.CLOSED },
          _count: { id: true },
        })
      : [];
  const dealsByUser = new Map(dealCounts.map((d) => [d.partnerId, d._count.id]));

  const byTerritory = new Map<TerritoryKey, { userId: string; name: string; deals: number }[]>();
  for (const key of TERRITORY_KEYS) byTerritory.set(key, []);

  let myTerritory: TerritoryKey | null = null;
  for (const p of profiles) {
    const key = p.territory as TerritoryKey;
    if (!TERRITORY_KEYS.includes(key)) continue;
    const name = resolveChatSenderName(p.user);
    byTerritory.get(key)!.push({
      userId: p.userId,
      name,
      deals: dealsByUser.get(p.userId) ?? 0,
    });
    if (viewerUserId && p.userId === viewerUserId) myTerritory = key;
  }

  let rivalTerritory: TerritoryKey | null = null;
  let rivalUserId: string | null = null;
  if (viewerUserId) {
    const rival = await getPartnerRival(viewerUserId);
    if (rival) {
      rivalUserId = rival.rival.userId;
      const rivalProfile = profiles.find((p) => p.userId === rivalUserId);
      if (rivalProfile?.territory && TERRITORY_KEYS.includes(rivalProfile.territory as TerritoryKey)) {
        rivalTerritory = rivalProfile.territory as TerritoryKey;
      }
    }
  }

  const networkLines: WarMapNetworkLine[] = [];
  if (viewerUserId && myTerritory) {
    const downlines = await prisma.partnerProfile.findMany({
      where: { parentUserId: viewerUserId, territory: { not: null } },
      select: { territory: true },
    });
    for (const d of downlines) {
      const to = d.territory as TerritoryKey;
      if (TERRITORY_KEYS.includes(to) && to !== myTerritory) {
        networkLines.push({ from: myTerritory, to });
      }
    }
  }

  const cities = TERRITORY_KEYS.map((key) => {
    const controllers = byTerritory.get(key) ?? [];
    return {
      key,
      x: TERRITORY_COORDS[key].x,
      y: TERRITORY_COORDS[key].y,
      partnerCount: controllers.length,
      controllers,
      isMine: myTerritory === key,
      isRival: rivalTerritory === key,
      isUnclaimed: controllers.length === 0,
    };
  });

  return { cities, myTerritory, rivalTerritory, networkLines };
}

export async function getTerritoryLeaderboard(limit = 12) {
  const data = await getWarMapData();
  return data.cities
    .filter((c) => c.partnerCount > 0)
    .map((c) => ({
      key: c.key,
      topPartner: c.controllers.sort((a, b) => b.deals - a.deals)[0]!,
      partnerCount: c.partnerCount,
    }))
    .sort((a, b) => b.topPartner.deals - a.topPartner.deals)
    .slice(0, limit);
}
