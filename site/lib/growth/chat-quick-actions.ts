import type { Prisma } from "@prisma/client";
import { BadgeType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { grantAdminBadge } from "@/lib/growth/badges";
import { logActivityEvent } from "@/lib/growth/activity";
import { appendMessage } from "@/lib/growth/chat-service";

export type ChatQuickActionResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string };

export async function runChatAdminQuickAction(input: {
  conversationId: string;
  partnerUserId: string;
  adminUserId: string;
  action: "bonus" | "badge" | "suggest";
  amountUsd?: number;
  badgeKey?: string;
  suggestTemplate?:
    | "push_close"
    | "offer_bonus"
    | "ask_update"
    | "commission_nudge";
}): Promise<ChatQuickActionResult> {
  const { conversationId, partnerUserId, adminUserId, action } = input;

  if (action === "bonus") {
    const usd = input.amountUsd ?? 50;
    if (!Number.isFinite(usd) || usd < 1 || usd > 50_000) {
      return { ok: false, error: "invalid_amount" };
    }
    const cents = Math.round(usd * 100);
    await prisma.commissionLedger.create({
      data: {
        dealId: null,
        userId: partnerUserId,
        tier: 0,
        amountCents: cents,
        ruleSnapshot: {
          kind: "chat_quick_bonus",
          grantedBy: adminUserId,
        } as Prisma.InputJsonValue,
      },
    });
    await logActivityEvent(prisma, {
      kind: "manual_bonus",
      actorUserId: partnerUserId,
      headline: `Bonus (chat): $${usd}`,
      amountCents: cents,
      metadata: { source: "chat_quick" },
    });
    const msg = await appendMessage({
      conversationId,
      senderUserId: adminUserId,
      body: `Bonus granted: $${usd.toFixed(0)}`,
      kind: "BONUS",
      metadata: { amountUsd: usd },
    });
    return { ok: true, messageId: msg.id };
  }

  if (action === "badge") {
    const key = input.badgeKey?.trim();
    if (!key) return { ok: false, error: "missing_badge" };
    const badge = await prisma.badgeDefinition.findUnique({ where: { key } });
    if (!badge || badge.type !== BadgeType.ADMIN) {
      return { ok: false, error: "invalid_badge" };
    }
    await grantAdminBadge(prisma, partnerUserId, key, adminUserId);
    const msg = await appendMessage({
      conversationId,
      senderUserId: adminUserId,
      body: `Badge granted: ${badge.name}`,
      kind: "BADGE",
      metadata: { badgeKey: key },
    });
    return { ok: true, messageId: msg.id };
  }

  if (action === "suggest") {
    const tpl = input.suggestTemplate ?? "push_close";
    const bodies: Record<string, string> = {
      push_close:
        "Suggested: confirm timeline and next step to close — offer a crisp recap + single CTA.",
      offer_bonus:
        "Suggested: if they are one step away, a small performance boost can unlock momentum.",
      ask_update:
        "Suggested: ask for a 2-line update (blockers + target date) to keep pipeline honest.",
      commission_nudge:
        "Strategic: review commission tier / partner override in admin — align incentive with the deal stage before pushing harder.",
    };
    const msg = await appendMessage({
      conversationId,
      senderUserId: adminUserId,
      body: bodies[tpl] ?? bodies.push_close,
      kind: "SYSTEM",
      metadata: { template: tpl },
    });
    return { ok: true, messageId: msg.id };
  }

  return { ok: false, error: "unknown_action" };
}
