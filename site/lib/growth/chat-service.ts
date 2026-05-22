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
  /** True when message belongs to a resolved (archived) conversation session. */
  archivedSession?: boolean;
};

export type ChatTimelineSegmentKind = "session_start" | "session_closed";

export type ChatTimelineItem =
  | { type: "segment"; kind: ChatTimelineSegmentKind; conversationId: string; at: string }
  | { type: "message"; message: ChatMessageDTO };

export type PartnerChatSummary = {
  openConversationId: string;
  openStatus: string;
  unreadCount: number;
  lastPreview: string | null;
  lastMessageAt: string | null;
  lastFromAdmin: boolean;
  referralCode: string | null;
  lastDealLabel: string | null;
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
  /** Sender of the latest message (for inbox unread / reply-needed UI). */
  lastMessageSenderId: string | null;
  /** Open thread where the partner sent the last message — admin should reply. */
  needsAdminReply: boolean;
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

function pickPreferredConversation<T extends { partnerUserId: string; status: string; updatedAt: Date }>(
  rows: T[],
): T[] {
  const byPartner = new Map<string, T>();
  for (const row of rows) {
    const existing = byPartner.get(row.partnerUserId);
    if (!existing) {
      byPartner.set(row.partnerUserId, row);
      continue;
    }
    const score = (r: T) =>
      (r.status === "OPEN" ? 2 : 1) * 1e15 + r.updatedAt.getTime();
    if (score(row) > score(existing)) {
      byPartner.set(row.partnerUserId, row);
    }
  }
  return [...byPartner.values()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function listAdminConversations(): Promise<ChatConversationListItem[]> {
  const rawRows = await prisma.chatConversation.findMany({
    orderBy: [{ updatedAt: "desc" }],
    take: 120,
    include: {
      partner: { select: { email: true, name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, senderUserId: true },
      },
    },
  });
  const rows = pickPreferredConversation(rawRows).slice(0, 80);
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
    const lastMessageSenderId = r.messages[0]?.senderUserId ?? null;
    const needsAdminReply =
      r.status === "OPEN" &&
      lastMessageSenderId != null &&
      lastMessageSenderId === pid;

    return {
      ...listShape,
      timeToActMinutes: timeToActMinutesForInbox(listShape),
      lastMessageSenderId,
      needsAdminReply,
    };
  });
}

export async function listMessages(
  conversationId: string,
  opts?: { after?: Date; before?: Date; take?: number },
): Promise<ChatMessageDTO[]> {
  const take = opts?.take ?? (opts?.before || opts?.after ? 50 : 200);
  const rows = await prisma.chatMessage.findMany({
    where: {
      conversationId,
      ...(opts?.after ? { createdAt: { gt: opts.after } } : {}),
      ...(opts?.before ? { createdAt: { lt: opts.before } } : {}),
    },
    orderBy: { createdAt: opts?.before ? "desc" : "asc" },
    take,
  });
  const ordered = opts?.before ? [...rows].reverse() : rows;
  return ordered.map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    senderUserId: m.senderUserId,
    body: m.body,
    kind: m.kind,
    createdAt: m.createdAt.toISOString(),
    metadata: (m.metadata as Record<string, unknown> | null) ?? null,
  }));
}

/** All conversations for partner, newest activity first. */
export async function listPartnerConversations(partnerUserId: string) {
  return prisma.chatConversation.findMany({
    where: { partnerUserId },
    orderBy: [{ updatedAt: "desc" }],
  });
}

/** Merged timeline across OPEN + RESOLVED sessions for partner history view. */
export async function listPartnerChatTimeline(
  partnerUserId: string,
  opts?: { limit?: number; before?: Date },
): Promise<{ items: ChatTimelineItem[]; hasMore: boolean }> {
  const limit = opts?.limit ?? 80;
  const convs = await prisma.chatConversation.findMany({
    where: { partnerUserId },
    orderBy: { createdAt: "asc" },
  });
  if (convs.length === 0) return { items: [], hasMore: false };

  const convById = new Map(convs.map((c) => [c.id, c]));

  const rows = await prisma.chatMessage.findMany({
    where: {
      conversation: { partnerUserId },
      ...(opts?.before ? { createdAt: { lt: opts.before } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });
  const hasMore = rows.length > limit;
  const messages = rows.slice(0, limit).reverse();

  const items: ChatTimelineItem[] = [];
  let lastConvId: string | null = null;

  for (const m of messages) {
    const conv = convById.get(m.conversationId);
    if (!conv) continue;
    if (m.conversationId !== lastConvId) {
      if (lastConvId !== null) {
        const prev = convById.get(lastConvId);
        if (prev?.status === "RESOLVED") {
          items.push({
            type: "segment",
            kind: "session_closed",
            conversationId: lastConvId,
            at: prev.updatedAt.toISOString(),
          });
        }
      }
      items.push({
        type: "segment",
        kind: "session_start",
        conversationId: m.conversationId,
        at: conv.createdAt.toISOString(),
      });
      lastConvId = m.conversationId;
    }
    items.push({
      type: "message",
      message: {
        id: m.id,
        conversationId: m.conversationId,
        senderUserId: m.senderUserId,
        body: m.body,
        kind: m.kind,
        createdAt: m.createdAt.toISOString(),
        metadata: (m.metadata as Record<string, unknown> | null) ?? null,
        archivedSession: conv.status === "RESOLVED",
      },
    });
  }

  return { items, hasMore };
}

export async function countPartnerUnread(partnerUserId: string): Promise<number> {
  const convs = await prisma.chatConversation.findMany({
    where: { partnerUserId },
    select: { id: true, partnerLastReadAt: true },
  });
  if (convs.length === 0) return 0;

  let total = 0;
  for (const c of convs) {
    const since = c.partnerLastReadAt ?? new Date(0);
    const n = await prisma.chatMessage.count({
      where: {
        conversationId: c.id,
        senderUserId: { not: partnerUserId },
        createdAt: { gt: since },
      },
    });
    total += n;
  }
  return total;
}

export async function getPartnerChatSummary(partnerUserId: string): Promise<PartnerChatSummary> {
  const open = await ensureOpenConversation(partnerUserId);
  const unreadCount = await countPartnerUnread(partnerUserId);

  const [lastMsg, profile, lastDeal] = await Promise.all([
    prisma.chatMessage.findFirst({
      where: { conversation: { partnerUserId } },
      orderBy: { createdAt: "desc" },
      select: { body: true, createdAt: true, senderUserId: true, kind: true },
    }),
    prisma.partnerProfile.findUnique({
      where: { userId: partnerUserId },
      select: { referralCode: true },
    }),
    prisma.deal.findFirst({
      where: { partnerId: partnerUserId },
      orderBy: { updatedAt: "desc" },
      select: { clientLabel: true, status: true },
    }),
  ]);

  const preview =
    lastMsg && lastMsg.kind === "TEXT"
      ? lastMsg.body.slice(0, 120)
      : lastMsg
        ? `[${lastMsg.kind}]`
        : null;

  const lastDealLabel = lastDeal
    ? `${lastDeal.clientLabel ?? "—"} (${lastDeal.status})`
    : null;

  return {
    openConversationId: open.id,
    openStatus: open.status,
    unreadCount,
    lastPreview: preview,
    lastMessageAt: lastMsg?.createdAt.toISOString() ?? null,
    lastFromAdmin: lastMsg ? lastMsg.senderUserId !== partnerUserId : false,
    referralCode: profile?.referralCode ?? null,
    lastDealLabel,
  };
}

export async function markPartnerConversationRead(
  conversationId: string,
  partnerUserId: string,
): Promise<void> {
  await prisma.chatConversation.updateMany({
    where: { id: conversationId, partnerUserId },
    data: { partnerLastReadAt: new Date() },
  });
}

/** Mark all partner conversations as read. */
export async function markAllPartnerChatsRead(partnerUserId: string): Promise<void> {
  await prisma.chatConversation.updateMany({
    where: { partnerUserId },
    data: { partnerLastReadAt: new Date() },
  });
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
