import { PayoutStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sumEarningsCents } from "@/lib/growth/commission";

export type PartnerWallet = {
  totalEarnedCents: number;
  paidOutCents: number;
  pendingCents: number;
  availableCents: number;
};

export async function computePartnerWallet(userId: string): Promise<PartnerWallet> {
  const [totalEarnedCents, paidAgg, pendingAgg] = await Promise.all([
    sumEarningsCents(userId),
    prisma.payoutRequest.aggregate({
      where: { userId, status: PayoutStatus.PAID },
      _sum: { amountCents: true },
    }),
    prisma.payoutRequest.aggregate({
      where: {
        userId,
        status: { in: [PayoutStatus.PENDING, PayoutStatus.APPROVED] },
      },
      _sum: { amountCents: true },
    }),
  ]);

  const paidOutCents = paidAgg._sum.amountCents ?? 0;
  const pendingCents = pendingAgg._sum.amountCents ?? 0;
  const availableCents = Math.max(0, totalEarnedCents - paidOutCents - pendingCents);

  return { totalEarnedCents, paidOutCents, pendingCents, availableCents };
}

export type MonthEarningsPoint = {
  key: string;
  label: string;
  amountCents: number;
};

export function buildLast6MonthEarnings(
  rows: { createdAt: Date; amountCents: number }[],
  locale: string,
): MonthEarningsPoint[] {
  const nf =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const fmt = new Intl.DateTimeFormat(nf, { month: "short", year: "2-digit" });
  const now = new Date();
  const buckets: MonthEarningsPoint[] = [];

  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    buckets.push({ key, label: fmt.format(d), amountCents: 0 });
  }

  for (const row of rows) {
    const d = row.createdAt;
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const b = buckets.find((x) => x.key === key);
    if (b) b.amountCents += row.amountCents;
  }

  return buckets;
}
