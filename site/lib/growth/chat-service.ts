import { DealStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { explainCloseProbability } from "@/lib/growth/deal-close-probability";

export type ChatMessageDTO = {
  id: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  kind: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
};

export type ChatInboxSegment = "high_value" | "at_risk" | "standard";

export type ChatMomentumKey = "rising" | "stable" | "dropping";

export type ChatConversationListItem = {
  id: string;
  partnerUserId: string;
  partnerEmail: string;
  partnerName: string | null;
  status: string;
  priority: string;
  linkedDealId: string | null;
  lastMessageAt: string | null;
  preview: string | null;
  earningsCents: number;
  closedDeals: number;
  pendingDeals: number;
  segment: ChatInboxSegment;
  /** Featured pipeline row for inbox radar (linked pending deal, else top pending by value). */
  featuredDealLabel: string | null;
  featuredCloseProbability: number | null;
  /** Activity in the last 48h (for “New” filter). */
  isFresh: boolean;
  momentumKey: ChatMomentumKey;
  /**
   * Heuristic “act within N minutes” for open threads — drives inbox urgency UI.
   * Not a SLA clock; derived from segment, probability, and recency.
   */
  timeToActMinutes: number | null;
};

export async function ensureOpenConversation(partnerUserId: string) {
  const open = await prisma.chatConversation.findFirst({
    where: { partnerUserId, status: "OPEN" },
    orderBy: { updatedAt: "desc" },
  });
  if (open) return open;
  return prisma.chatConversation.create({
    data: { partnerUserId, status: "OPEN" },
  });
}

function timeToActMinutesForInbox(item: {
  status: string;
  segment: ChatInboxSegment;
  featuredCloseProbability: number | null;
  lastMessageAt: string | null;
  priority: string;
}): number | null {
  if (item.status !== "OPEN") return null;
  if (item.segment === "at_risk") return 14;
  if (item.priority === "HIGH") return 12;
  const prob = item.featuredCloseProbability;
  if (prob != null) {
    if (prob >= 65) return 18;
    if (prob >= 58) return 22;
    if (prob >= 50) return 28;
  }
  if (item.lastMessageAt && prob != null && prob >= 42) {
    const ageMin = (Date.now() - new Date(item.lastMessageAt).getTime()) / 60000;
    if (ageMin < 180) {
      return Math.max(10, Math.min(32, Math.round(36 - ageMin / 4)));
    }
  }
  return null;
}

function segmentFor(
  earningsCents: number,
  closedDeals: number,
  pendingDeals: number,
  streak: number,
): ChatInboxSegment {
  if (earningsCents >= 100_000 || closedDeals >= 15) return "high_value";
  if (pendingDeals >= 3 && streak < 2) return "at_risk";
  return "standard";
}

export async function listAdminConversations(): Promise<ChatConversationListItem[]> {
  const rows = await prisma.chatConversation.findMany({
    orderBy: [{ updatedAt: "desc" }],
    take: 80,
    include: {
      partner: { select: { email: true, name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true },
      },
    },
  });
  const partnerIds = [...new Set(rows.map((r) => r.partnerUserId))];
  if (partnerIds.length === 0) return [];

  const [earnings, closedAgg, pendingAgg, streakRows, pendingDealsRows] = await Promise.all([
    prisma.commissionLedger.groupBy({
      by: ["userId"],
      where: { userId: { in: partnerIds } },
      _sum: { amountCents: true },
    }),
    prisma.deal.groupBy({
      by: ["partnerId"],
      where: { partnerId: { in: partnerIds }, status: DealStatus.CLOSED },
      _count: { _all: true },
    }),
    prisma.deal.groupBy({
      by: ["partnerId"],
      where: { partnerId: { in: partnerIds }, status: DealStatus.PENDING },
      _count: { _all: true },
    }),
    prisma.userStreak.findMany({
      where: { userId: { in: partnerIds } },
      select: { userId: true, currentStreak: true },
    }),
    prisma.deal.findMany({
      where: { partnerId: { in: partnerIds }, status: DealStatus.PENDING },
      orderBy: [{ saleAmountCents: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        partnerId: true,
        clientLabel: true,
        saleAmountCents: true,
        updatedAt: true,
        product: { select: { name: true } },
      },
    }),
  ]);

  const earnMap = new Map(earnings.map((e) => [e.userId, e._sum.amountCents ?? 0]));
  const closedMap = new Map(closedAgg.map((e) => [e.partnerId, e._count._all]));
  const pendMap = new Map(pendingAgg.map((e) => [e.partnerId, e._count._all]));
  const streakMap = new Map(streakRows.map((s) => [s.userId, s.currentStreak]));

  const topPendingByPartner = new Map<
    string,
    (typeof pendingDealsRows)[number]
  >();
  for (const d of pendingDealsRows) {
    if (!topPendingByPartner.has(d.partnerId)) topPendingByPartner.set(d.partnerId, d);
  }

  return rows.map((r) => {
    const pid = r.partnerUserId;
    const earningsCents = earnMap.get(pid) ?? 0;
    const closedDeals = closedMap.get(pid) ?? 0;
    const pendingDeals = pendMap.get(pid) ?? 0;
    const streak = streakMap.get(pid) ?? 0;
    const lastAt = r.lastMessageAt?.getTime() ?? 0;
    const isFresh = lastAt > 0 && Date.now() - lastAt < 48 * 60 * 60 * 1000;

    const linkedPending =
      r.linkedDealId != null
        ? pendingDealsRows.find((d) => d.id === r.linkedDealId && d.partnerId === pid)
        : undefined;
    const topP = topPendingByPartner.get(pid);
    const featured = linkedPending ?? topP ?? null;

    const totalDeals = closedDeals + pendingDeals;
    const convApprox =
      totalDeals === 0 ? 0 : Math.round((closedDeals / Math.max(1, totalDeals)) * 100);

    let featuredCloseProbability: number | null = null;
    let featuredDealLabel: string | null = null;
    if (featured) {
      const usd = featured.saleAmountCents / 100;
      featuredCloseProbability = explainCloseProbability({
        status: DealStatus.PENDING,
        saleUsd: usd,
        partnerStreak: streak,
        partnerConversionPct: convApprox,
        dealUpdatedAt: featured.updatedAt,
      }).score;
      const label = featured.clientLabel?.trim() || featured.product.name;
      featuredDealLabel = `${label} · $${Math.round(usd)}`;
    }

    const segment = segmentFor(earningsCents, closedDeals, pendingDeals, streak);
    let momentumKey: ChatMomentumKey = "stable";
    if (
      isFresh &&
      featuredCloseProbability != null &&
      featuredCloseProbability >= 58 &&
      segment !== "at_risk"
    ) {
      momentumKey = "rising";
    } else if (
      segment === "at_risk" ||
      (featuredCloseProbability != null &&
        featuredCloseProbability < 45 &&
        pendingDeals >= 2)
    ) {
      momentumKey = "dropping";
    }

    const listShape = {
      id: r.id,
      partnerUserId: pid,
      partnerEmail: r.partner.email,
      partnerName: r.partner.name,
      status: r.status,
      priority: r.priority,
      linkedDealId: r.linkedDealId,
      lastMessageAt: r.lastMessageAt?.toISOString() ?? null,
      preview: r.messages[0]?.body ?? null,
      earningsCents,
      closedDeals,
      pendingDeals,
      segment,
      featuredDealLabel,
      featuredCloseProbability,
      isFresh,
      momentumKey,
    };
    return {
      ...listShape,
      timeToActMinutes: timeToActMinutesForInbox(listShape),
    };
  });
}

export async function listMessages(
  conversationId: string,
  opts?: { after?: Date },
): Promise<ChatMessageDTO[]> {
  const rows = await prisma.chatMessage.findMany({
    where: {
      conversationId,
      ...(opts?.after ? { createdAt: { gt: opts.after } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return rows.map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    senderUserId: m.senderUserId,
    body: m.body,
    kind: m.kind,
    createdAt: m.createdAt.toISOString(),
    metadata: (m.metadata as Record<string, unknown> | null) ?? null,
  }));
}

export async function appendMessage(input: {
  conversationId: string;
  senderUserId: string;
  body: string;
  kind?: string;
  metadata?: Record<string, unknown> | null;
}) {
  const now = new Date();
  const msg = await prisma.chatMessage.create({
    data: {
      conversationId: input.conversationId,
      senderUserId: input.senderUserId,
      body: input.body.trim().slice(0, 8000),
      kind: input.kind?.trim().slice(0, 32) || "TEXT",
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
  await prisma.chatConversation.update({
    where: { id: input.conversationId },
    data: { lastMessageAt: now, updatedAt: now },
  });
  return msg;
}
