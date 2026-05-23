import type { DealJourneyStepKey } from "@/lib/growth/deal-journey";

export function IllustrationDealsEmpty() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <rect x="12" y="16" width="40" height="32" rx="4" stroke="var(--growth-gold)" strokeWidth="2" />
      <path d="M20 28h24M20 36h16" stroke="var(--growth-gold)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IllustrationLeaderboardEmpty() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <path d="M32 8l6 14h14l-11 9 4 15-13-8-13 8 4-15-11-9h14z" stroke="var(--growth-gold)" strokeWidth="2" />
    </svg>
  );
}

export const ILLUSTRATION_MAP = {
  rocket: IllustrationDealsEmpty,
  trophy: IllustrationLeaderboardEmpty,
} as const;

export type IllustrationId = keyof typeof ILLUSTRATION_MAP;
