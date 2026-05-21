/**
 * Chain bonus XP is queued in PendingChainReward (see mission-rewards.ts)
 * and granted only after admin approval. This module is kept for imports compatibility.
 */
export { tryQueueChainBonus as tryCompleteQuestChain } from "@/lib/growth/mission-rewards";
