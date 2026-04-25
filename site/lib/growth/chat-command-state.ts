export type CommandStateKey = "closing_window" | "rescue" | "stale_pipeline" | "steady";

/**
 * Single headline state for admin “command” UI (heuristic).
 */
export function deriveCommandState(input: {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  closeProbability: number | null;
  pendingDeals: number;
  focusDealUpdatedAt: Date | null;
  focusDealIsPending: boolean;
}): CommandStateKey {
  if (input.riskLevel === "HIGH") return "rescue";

  if (
    input.focusDealIsPending &&
    input.focusDealUpdatedAt &&
    input.closeProbability != null
  ) {
    const daysStale =
      (Date.now() - input.focusDealUpdatedAt.getTime()) / 86_400_000;
    if (input.closeProbability < 50 && daysStale > 4 && input.pendingDeals > 0) {
      return "stale_pipeline";
    }
  }

  if (input.closeProbability != null && input.closeProbability >= 65) {
    return "closing_window";
  }

  return "steady";
}
