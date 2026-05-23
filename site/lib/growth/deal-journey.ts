import { DealStatus } from "@prisma/client";

export type DealJourneyStepKey = "lead" | "contacted" | "negotiation" | "closed" | "paid";

export type DealJourneyStep = {
  key: DealJourneyStepKey;
  done: boolean;
  current: boolean;
  at?: string | null;
};

function ageDays(createdAt: Date): number {
  return (Date.now() - createdAt.getTime()) / 86_400_000;
}

/**
 * Maps each deal to a 5-step narrative. Pending deals advance “depth” slowly from `createdAt`
 * so returning partners still see motion without extra DB columns.
 */
export function buildDealJourney(input: {
  status: DealStatus;
  createdAt: Date;
  closedAt: Date | null;
  lostAt: Date | null;
  ledgerCount: number;
}): { steps: DealJourneyStep[] } {
  const keys: DealJourneyStepKey[] = [
    "lead",
    "contacted",
    "negotiation",
    "closed",
    "paid",
  ];

  if (input.status === DealStatus.LOST) {
    const steps: DealJourneyStep[] = keys.map((key, i) => ({
      key,
      done: i < 2,
      current: i === 2,
      at: i === 0 ? input.createdAt.toISOString() : i === 2 ? input.lostAt?.toISOString() ?? null : null,
    }));
    return { steps };
  }

  if (input.status === DealStatus.CLOSED) {
    const paidReady = input.ledgerCount > 0;
    const closedIso = input.closedAt?.toISOString() ?? null;
    const steps: DealJourneyStep[] = keys.map((key, i) => {
      if (i <= 2) {
        return {
          key,
          done: true,
          current: false,
          at: i === 0 ? input.createdAt.toISOString() : null,
        };
      }
      if (i === 3) return { key, done: true, current: !paidReady, at: closedIso };
      return { key, done: paidReady, current: paidReady, at: paidReady ? closedIso : null };
    });
    return { steps };
  }

  const d = Math.min(3, Math.floor(ageDays(input.createdAt)));
  const currentIndex = Math.min(2, d);
  const steps: DealJourneyStep[] = keys.map((key, i) => ({
    key,
    done: i < currentIndex,
    current: i === currentIndex,
    at: i === 0 ? input.createdAt.toISOString() : null,
  }));
  return { steps };
}
