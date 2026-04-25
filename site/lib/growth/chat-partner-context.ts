import { DealStatus, BadgeType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sumEarningsCents } from "@/lib/growth/commission";
import {
  explainCloseProbability,
  type ProbabilityFactor,
} from "@/lib/growth/deal-close-probability";
import { deriveCommandState, type CommandStateKey } from "@/lib/growth/chat-command-state";

export type PartnerChatContextDeal = {
  id: string;
  clientLabel: string | null;
  productName: string;
  status: DealStatus;
  saleUsd: number;
};

export type PartnerChatContextBadge = { key: string; name: string };

export type PartnerChatFocusStageKey =
  | "stageLead"
  | "stageNegotiation"
  | "stageWon"
  | "stageLost";

export type PartnerChatFocusDeal = {
  id: string;
  clientLabel: string | null;
  productName: string;
  status: DealStatus;
  saleUsd: number;
  stageKey: PartnerChatFocusStageKey;
  closeProbability: number | null;
  probabilityFactors: ProbabilityFactor[];
  updatedAt: string;
};

export type PartnerChatContextDTO = {
  partnerUserId: string;
  email: string;
  name: string | null;
  levelName: string;
  totalXp: number;
  referralCode: string;
  earningsCents: number;
  closedDeals: number;
  pendingDeals: number;
  lostDeals: number;
  streakCurrent: number;
  conversionPct: number;
  risk: { level: "LOW" | "MEDIUM" | "HIGH"; reasonKey: string };
  deals: PartnerChatContextDeal[];
  adminBadges: PartnerChatContextBadge[];
  focusDeal: PartnerChatFocusDeal | null;
  insightKey: string;
  patternKey: string;
  commandStateKey: CommandStateKey;
};

function stageKeyFor(status: DealStatus): PartnerChatFocusStageKey {
  switch (status) {
    case DealStatus.PENDING:
      return "stageNegotiation";
    case DealStatus.CLOSED:
      return "stageWon";
    case DealStatus.LOST:
      return "stageLost";
    default:
      return "stageLead";
  }
}

function pickInsightKey(input: {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  closeProbability: number | null;
  streak: number;
  pendingDeals: number;
}): string {
  if (input.riskLevel === "HIGH") return "insightRescue";
  const p = input.closeProbability ?? 0;
  if (p >= 72) return "insightPushClose";
  if (input.streak >= 5 && input.pendingDeals > 0) return "insightMomentum";
  if (p >= 55) return "insightFollowUp";
  return "insightSteady";
}

function pickPatternKey(input: {
  earningsCents: number;
  conversionPct: number;
  pendingDeals: number;
}): string {
  if (input.earningsCents >= 50_000 && input.conversionPct >= 38) return "patternCloser";
  if (input.pendingDeals >= 4) return "patternHeavyPipeline";
  return "patternNeutral";
}

export async function getPartnerChatContext(
  partnerUserId: string,
  opts?: { linkedDealId?: string | null },
): Promise<PartnerChatContextDTO | null> {
  const user = await prisma.user.findUnique({
    where: { id: partnerUserId },
    select: {
      id: true,
      email: true,
      name: true,
      partnerProfile: {
        include: {
          currentLevel: { select: { name: true } },
        },
      },
    },
  });
  if (!user?.partnerProfile) return null;

  const [
    earningsCents,
    closedDeals,
    pendingDeals,
    lostDeals,
    streak,
    deals,
    adminBadges,
  ] = await Promise.all([
    sumEarningsCents(partnerUserId),
    prisma.deal.count({ where: { partnerId: partnerUserId, status: DealStatus.CLOSED } }),
    prisma.deal.count({ where: { partnerId: partnerUserId, status: DealStatus.PENDING } }),
    prisma.deal.count({ where: { partnerId: partnerUserId, status: DealStatus.LOST } }),
    prisma.userStreak.findUnique({ where: { userId: partnerUserId } }),
    prisma.deal.findMany({
      where: { partnerId: partnerUserId },
      orderBy: { updatedAt: "desc" },
      take: 12,
      include: { product: { select: { name: true } } },
    }),
    prisma.badgeDefinition.findMany({
      where: { type: BadgeType.ADMIN, hidden: false },
      orderBy: { name: "asc" },
      take: 10,
      select: { key: true, name: true },
    }),
  ]);

  const total = closedDeals + pendingDeals + lostDeals;
  const conversionPct = total === 0 ? 0 : Math.round((closedDeals / total) * 100);
  const streakCurrent = streak?.currentStreak ?? 0;

  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let reasonKey = "riskOk";
  if (pendingDeals >= 5 && streakCurrent === 0) {
    riskLevel = "HIGH";
    reasonKey = "riskHighPending";
  } else if (pendingDeals >= 3 && streakCurrent < 2) {
    riskLevel = "MEDIUM";
    reasonKey = "riskMediumFollowUp";
  }

  const pendingSorted = [...deals]
    .filter((d) => d.status === DealStatus.PENDING)
    .sort((a, b) => b.saleAmountCents - a.saleAmountCents);

  const linkedId = opts?.linkedDealId ?? null;
  const linkedRow = linkedId ? deals.find((d) => d.id === linkedId) : undefined;
  const rawFocus = linkedRow ?? pendingSorted[0] ?? null;

  let focusDeal: PartnerChatFocusDeal | null = null;
  if (rawFocus) {
    const saleUsd = rawFocus.saleAmountCents / 100;
    const explained = explainCloseProbability({
      status: rawFocus.status,
      saleUsd,
      partnerStreak: streakCurrent,
      partnerConversionPct: conversionPct,
      dealUpdatedAt: rawFocus.updatedAt,
    });
    focusDeal = {
      id: rawFocus.id,
      clientLabel: rawFocus.clientLabel,
      productName: rawFocus.product.name,
      status: rawFocus.status,
      saleUsd,
      stageKey: stageKeyFor(rawFocus.status),
      closeProbability: explained.score,
      probabilityFactors: explained.factors,
      updatedAt: rawFocus.updatedAt.toISOString(),
    };
  }

  const commandStateKey = deriveCommandState({
    riskLevel,
    closeProbability: focusDeal?.closeProbability ?? null,
    pendingDeals,
    focusDealUpdatedAt: rawFocus ? rawFocus.updatedAt : null,
    focusDealIsPending: rawFocus?.status === DealStatus.PENDING,
  });

  const insightKey = pickInsightKey({
    riskLevel,
    closeProbability: focusDeal?.closeProbability ?? null,
    streak: streakCurrent,
    pendingDeals,
  });
  const patternKey = pickPatternKey({
    earningsCents,
    conversionPct,
    pendingDeals,
  });

  return {
    partnerUserId,
    email: user.email,
    name: user.name,
    levelName: user.partnerProfile.currentLevel.name,
    totalXp: user.partnerProfile.totalXp,
    referralCode: user.partnerProfile.referralCode,
    earningsCents,
    closedDeals,
    pendingDeals,
    lostDeals,
    streakCurrent,
    conversionPct,
    risk: { level: riskLevel, reasonKey },
    deals: deals.map((d) => ({
      id: d.id,
      clientLabel: d.clientLabel,
      productName: d.product.name,
      status: d.status,
      saleUsd: d.saleAmountCents / 100,
    })),
    adminBadges: adminBadges.map((b) => ({ key: b.key, name: b.name })),
    focusDeal,
    insightKey,
    patternKey,
    commandStateKey,
  };
}
