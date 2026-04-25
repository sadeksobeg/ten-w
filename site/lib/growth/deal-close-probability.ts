import { DealStatus } from "@prisma/client";

export type ProbabilityFactorImpact = "up" | "down" | "neutral";

export type ProbabilityFactor = {
  key: string;
  impact: ProbabilityFactorImpact;
};

export type CloseProbabilityExplanation = {
  score: number | null;
  factors: ProbabilityFactor[];
};

/**
 * Heuristic close probability with explainable factors (UI / mission control — not a forecast model).
 */
export function explainCloseProbability(input: {
  status: DealStatus;
  saleUsd: number;
  partnerStreak: number;
  partnerConversionPct: number;
  dealUpdatedAt: Date;
}): CloseProbabilityExplanation {
  if (input.status !== DealStatus.PENDING) {
    return { score: null, factors: [] };
  }
  const daysStale = Math.max(
    0,
    (Date.now() - input.dealUpdatedAt.getTime()) / 86_400_000,
  );

  const dealPts = Math.min(20, input.saleUsd / 250);
  const streakPts = Math.min(14, input.partnerStreak * 2.2);
  const convPts = Math.min(12, (input.partnerConversionPct / 100) * 12);
  const stalePen = Math.min(18, Math.max(0, daysStale - 1.5) * 2.2);

  const factors: ProbabilityFactor[] = [
    {
      key: "dealValue",
      impact: dealPts >= 8 ? "up" : dealPts >= 3 ? "neutral" : "neutral",
    },
    {
      key: "streak",
      impact: streakPts >= 6 ? "up" : input.partnerStreak > 0 ? "neutral" : "down",
    },
    {
      key: "conversion",
      impact: convPts >= 6 ? "up" : convPts >= 3 ? "neutral" : "down",
    },
    {
      key: "recency",
      impact: stalePen >= 6 ? "down" : stalePen <= 1 ? "up" : "neutral",
    },
  ];

  let score = 48 + dealPts + streakPts + convPts - stalePen;
  score = Math.round(Math.min(93, Math.max(17, score)));
  return { score, factors };
}

/** @deprecated Use explainCloseProbability when factors are needed. */
export function estimateCloseProbability(input: {
  status: DealStatus;
  saleUsd: number;
  partnerStreak: number;
  partnerConversionPct: number;
  dealUpdatedAt: Date;
}): number | null {
  return explainCloseProbability(input).score;
}
