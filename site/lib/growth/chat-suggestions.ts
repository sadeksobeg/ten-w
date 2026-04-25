import type { PartnerChatContextDTO } from "@/lib/growth/chat-partner-context";

export type ChatSuggestionItem = {
  id: string;
  action: "suggest";
  suggestTemplate: "push_close" | "offer_bonus" | "ask_update" | "commission_nudge";
  labelKey: string;
  priority: number;
  /** Illustrative modeled lift on close probability if the admin follows through. */
  impactCloseDelta: number;
};

export function suggestImpactDelta(
  tpl: ChatSuggestionItem["suggestTemplate"],
): number {
  switch (tpl) {
    case "offer_bonus":
      return 18;
    case "push_close":
      return 14;
    case "commission_nudge":
      return 11;
    default:
      return 9;
  }
}

/**
 * Ranked admin actions from current context (no ML).
 */
export function buildChatSuggestions(ctx: PartnerChatContextDTO): ChatSuggestionItem[] {
  const commandState = ctx.commandStateKey;
  const hasPendingFocus = ctx.focusDeal?.closeProbability != null;
  const out: ChatSuggestionItem[] = [];

  if (commandState === "rescue") {
    out.push({
      id: "ask_update",
      action: "suggest",
      suggestTemplate: "ask_update",
      labelKey: "suggestAskUpdateHi",
      priority: 100,
      impactCloseDelta: suggestImpactDelta("ask_update"),
    });
    out.push({
      id: "commission_nudge",
      action: "suggest",
      suggestTemplate: "commission_nudge",
      labelKey: "suggestCommissionHi",
      priority: 90,
      impactCloseDelta: suggestImpactDelta("commission_nudge"),
    });
    out.push({
      id: "offer_bonus",
      action: "suggest",
      suggestTemplate: "offer_bonus",
      labelKey: "suggestOfferBoostHi",
      priority: 80,
      impactCloseDelta: suggestImpactDelta("offer_bonus"),
    });
  } else if (commandState === "closing_window" && hasPendingFocus) {
    out.push({
      id: "push_close",
      action: "suggest",
      suggestTemplate: "push_close",
      labelKey: "suggestPushCloseHi",
      priority: 100,
      impactCloseDelta: suggestImpactDelta("push_close"),
    });
    out.push({
      id: "offer_bonus",
      action: "suggest",
      suggestTemplate: "offer_bonus",
      labelKey: "suggestOfferBoostHi",
      priority: 85,
      impactCloseDelta: suggestImpactDelta("offer_bonus"),
    });
    out.push({
      id: "ask_update",
      action: "suggest",
      suggestTemplate: "ask_update",
      labelKey: "suggestAskUpdateHi",
      priority: 70,
      impactCloseDelta: suggestImpactDelta("ask_update"),
    });
  } else if (commandState === "stale_pipeline") {
    out.push({
      id: "ask_update",
      action: "suggest",
      suggestTemplate: "ask_update",
      labelKey: "suggestUnblockHi",
      priority: 100,
      impactCloseDelta: suggestImpactDelta("ask_update"),
    });
    out.push({
      id: "commission_nudge",
      action: "suggest",
      suggestTemplate: "commission_nudge",
      labelKey: "suggestCommissionHi",
      priority: 75,
      impactCloseDelta: suggestImpactDelta("commission_nudge"),
    });
    out.push({
      id: "push_close",
      action: "suggest",
      suggestTemplate: "push_close",
      labelKey: "suggestPushCloseHi",
      priority: 65,
      impactCloseDelta: suggestImpactDelta("push_close"),
    });
  } else {
    out.push({
      id: "ask_update",
      action: "suggest",
      suggestTemplate: "ask_update",
      labelKey: "suggestAskUpdateHi",
      priority: 70,
      impactCloseDelta: suggestImpactDelta("ask_update"),
    });
    out.push({
      id: "push_close",
      action: "suggest",
      suggestTemplate: "push_close",
      labelKey: "suggestPushCloseHi",
      priority: 60,
      impactCloseDelta: suggestImpactDelta("push_close"),
    });
    if (ctx.pendingDeals > 0) {
      out.push({
        id: "offer_bonus",
        action: "suggest",
        suggestTemplate: "offer_bonus",
        labelKey: "suggestOfferBoostHi",
        priority: 55,
        impactCloseDelta: suggestImpactDelta("offer_bonus"),
      });
    }
  }

  return [...out].sort((a, b) => b.priority - a.priority);
}
