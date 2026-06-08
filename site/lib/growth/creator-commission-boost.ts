import { DealStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PUBLIC_PRODUCT_SLUGS } from "@/lib/growth/product-features";

const BASE_COMMISSION_BPS = 1000; // 10%
const MAX_BOOST = 0.5;

export type CommissionBoostSnapshot = {
  baseBps: number;
  boostFactor: number;
  effectiveBps: number;
  closedDeals: number;
  referrals: number;
  xpBonus: number;
  arenaBonus: number;
};

export async function computeCreatorCommissionBoost(
  partnerUserId: string,
): Promise<CommissionBoostSnapshot> {
  const [closedDeals, referrals, profile, arena] = await Promise.all([
    prisma.deal.count({
      where: { partnerId: partnerUserId, status: DealStatus.CLOSED },
    }),
    prisma.partnerProfile.count({
      where: { parentUserId: partnerUserId },
    }),
    prisma.partnerProfile.findUnique({
      where: { userId: partnerUserId },
      select: { totalXp: true, currentLevel: { select: { order: true } } },
    }),
    prisma.creatorArenaProfile.findUnique({
      where: { userId: partnerUserId },
      select: { totalSubmissions: true, featuredCount: true },
    }),
  ]);

  const levelOrder = profile?.currentLevel.order ?? 1;
  const xpBonus = Math.min(0.1, (profile?.totalXp ?? 0) / 50_000);
  const levelBonus = Math.min(0.15, (levelOrder - 1) * 0.02);
  const arenaBonus = Math.min(
    0.1,
    (arena?.totalSubmissions ?? 0) * 0.005 + (arena?.featuredCount ?? 0) * 0.02,
  );

  const boostFactor = Math.min(
    MAX_BOOST,
    closedDeals * 0.02 + referrals * 0.01 + xpBonus + levelBonus + arenaBonus,
  );

  const effectiveBps = Math.floor(BASE_COMMISSION_BPS * (1 + boostFactor));

  return {
    baseBps: BASE_COMMISSION_BPS,
    boostFactor,
    effectiveBps,
    closedDeals,
    referrals,
    xpBonus,
    arenaBonus,
  };
}

export function formatCommissionPercent(bps: number): string {
  return `${(bps / 100).toFixed(1)}%`;
}

export async function effectiveCommissionBaseCentsForDeal(params: {
  partnerUserId: string;
  productId: string;
  productSlug: string;
  saleAmountCents: number;
}): Promise<{ baseCents: number; boost: CommissionBoostSnapshot }> {
  const boost = await computeCreatorCommissionBoost(params.partnerUserId);

  if ((PUBLIC_PRODUCT_SLUGS as readonly string[]).includes(params.productSlug)) {
    const baseCents = Math.floor((params.saleAmountCents * boost.effectiveBps) / 10_000);
    return { baseCents, boost };
  }

  const { effectiveCommissionBaseCents } = await import("@/lib/growth/commission-base");
  const baseCents = await effectiveCommissionBaseCents(params.partnerUserId, params.productId);
  return { baseCents, boost };
}
