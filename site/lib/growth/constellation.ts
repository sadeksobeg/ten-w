import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getLevelVisual } from "@/lib/growth/level-visual";
import { calculateDnaProfile } from "@/lib/growth/dna-score";
import { resolveChatSenderName } from "@/lib/growth/chat-display";

export interface ConstellationStar {
  partnerId: string;
  name: string;
  slug: string | null;
  levelCode: string;
  closedDeals: number;
  totalXp: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  isMe: boolean;
  isRival: boolean;
  connections: string[];
}

function hashPos(id: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
}

function orbit(cx: number, cy: number, index: number, total: number, distance: number): { x: number; y: number } {
  const angle = (index / Math.max(1, total)) * Math.PI * 2;
  return {
    x: cx + Math.cos(angle) * distance,
    y: cy + Math.sin(angle) * distance,
  };
}

export function constellationNameFromArchetype(
  archetype: string,
  territory: string | null | undefined,
  locale: string,
): string {
  const base: Record<string, { ar: string; en: string }> = {
    social_hunter: { ar: "نسر", en: "Eagle" },
    network_weaver: { ar: "عنكبوت", en: "Spider" },
    content_king: { ar: "شمس", en: "Sun" },
    speed_dealer: { ar: "برق", en: "Lightning" },
    silent_analyst: { ar: "قمر", en: "Moon" },
    rising_star: { ar: "نجم صاعد", en: "Rising Star" },
    steady_builder: { ar: "جبل", en: "Mountain" },
  };
  const t = base[archetype] ?? { ar: "كوكبة", en: "Constellation" };
  const place = territory?.trim() || (locale === "ar" ? "الشام" : "Home");
  return locale === "ar" ? `${t.ar} ${place}` : `${t.en} ${place}`;
}

export async function buildConstellationStars(
  userId: string,
  rivalUserId?: string | null,
): Promise<{ stars: ConstellationStar[]; constellationName: string; localeArchetype: string }> {
  const me = await prisma.partnerProfile.findUnique({
    where: { userId },
    select: {
      userId: true,
      territory: true,
      totalXp: true,
      dnaSnapshot: true,
      user: { select: { name: true, email: true, publicSlug: true, isVerifiedOfficial: true, officialDisplayName: true } },
      currentLevel: { select: { code: true, name: true } },
    },
  });
  if (!me) return { stars: [], constellationName: "", localeArchetype: "rising_star" };

  const dnaProfile = await calculateDnaProfile(userId);
  const archetype = dnaProfile.archetype;

  const direct = await prisma.partnerProfile.findMany({
    where: { parentUserId: userId, user: { isActive: true } },
    take: 30,
    select: {
      userId: true,
      totalXp: true,
      user: { select: { name: true, email: true, publicSlug: true, isVerifiedOfficial: true, officialDisplayName: true } },
      currentLevel: { select: { code: true } },
    },
  });

  const stars: ConstellationStar[] = [];
  const meDeals = await prisma.deal.count({
    where: { partnerId: userId, status: DealStatus.CLOSED },
  });
  const meColor = getLevelVisual(me.currentLevel.name).ringColor;

  stars.push({
    partnerId: userId,
    name: resolveChatSenderName(me.user),
    slug: me.user.publicSlug,
    levelCode: me.currentLevel.code,
    closedDeals: meDeals,
    totalXp: me.totalXp,
    x: 50,
    y: 50,
    radius: 16,
    color: meColor,
    isMe: true,
    isRival: false,
    connections: direct.map((d) => d.userId),
  });

  direct.forEach((d, i) => {
    const pos = orbit(50, 50, i, direct.length, 30);
    const deals = 0;
    const color = getLevelVisual(d.currentLevel.code).ringColor; // code keys in BY_CODE
    stars.push({
      partnerId: d.userId,
      name: resolveChatSenderName(d.user),
      slug: d.user.publicSlug,
      levelCode: d.currentLevel.code,
      closedDeals: deals,
      totalXp: d.totalXp,
      x: pos.x,
      y: pos.y,
      radius: 10,
      color,
      isMe: false,
      isRival: d.userId === rivalUserId,
      connections: [],
    });
  });

  // Load deals for direct in batch
  const directIds = direct.map((d) => d.userId);
  if (directIds.length > 0) {
    const grouped = await prisma.deal.groupBy({
      by: ["partnerId"],
      where: { partnerId: { in: directIds }, status: DealStatus.CLOSED },
      _count: { id: true },
    });
    const byPartner = new Map(grouped.map((g) => [g.partnerId, g._count.id]));
    for (const s of stars) {
      if (!s.isMe) s.closedDeals = byPartner.get(s.partnerId) ?? 0;
      s.radius = Math.min(20, Math.max(4, 4 + Math.sqrt(s.totalXp) / 15 + s.closedDeals));
    }
  }

  // Level-2 referrals (cap)
  let outerCount = 0;
  for (const d of direct.slice(0, 12)) {
    const children = await prisma.partnerProfile.findMany({
      where: { parentUserId: d.userId },
      take: 4,
      select: {
        userId: true,
        totalXp: true,
        user: { select: { name: true, email: true, publicSlug: true, isVerifiedOfficial: true, officialDisplayName: true } },
        currentLevel: { select: { code: true, name: true } },
      },
    });
    const parentStar = stars.find((s) => s.partnerId === d.userId);
    if (!parentStar) continue;
    children.forEach((c, ci) => {
      if (outerCount >= 40 || stars.length >= 80) return;
      const pos = orbit(parentStar.x, parentStar.y, ci, children.length, 15);
      const color = getLevelVisual(c.currentLevel.name).ringColor;
      stars.push({
        partnerId: c.userId,
        name: resolveChatSenderName(c.user),
        slug: c.user.publicSlug,
        levelCode: c.currentLevel.code,
        closedDeals: 0,
        totalXp: c.totalXp,
        x: pos.x,
        y: pos.y,
        radius: 6,
        color,
        isMe: false,
        isRival: c.userId === rivalUserId,
        connections: [],
      });
      parentStar.connections.push(c.userId);
      outerCount += 1;
    });
  }

  while (stars.length < 80 && outerCount < 50) {
    const phantomId = `scatter-${outerCount}`;
    stars.push({
      partnerId: phantomId,
      name: "",
      slug: null,
      levelCode: "starter",
      closedDeals: 0,
      totalXp: 0,
      x: 8 + hashPos(phantomId, 1) * 84,
      y: 8 + hashPos(phantomId, 2) * 84,
      radius: 3,
      color: "rgba(255,255,255,0.35)",
      isMe: false,
      isRival: false,
      connections: [],
    });
    outerCount += 1;
    if (outerCount > 15) break;
  }

  return {
    stars,
    constellationName: constellationNameFromArchetype(archetype, me.territory, "ar"),
    localeArchetype: archetype,
  };
}
