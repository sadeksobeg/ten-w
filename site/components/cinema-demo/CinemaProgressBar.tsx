"use client";

import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import type { CinemaDemoPhase } from "@/stores/cinema-demo-store";

const CUSTOMER_PROGRESS: Partial<Record<CinemaDemoPhase, number>> = {
  movies: 0.12,
  showtime: 0.28,
  seats: 0.48,
  checkout: 0.62,
  upsell: 0.78,
  ticket: 0.92,
  sessionReveal: 0.96,
  roi: 0.98,
  closing: 1,
};

export function CinemaProgressBar() {
  const phase = useCinemaDemoStore((s) => s.phase);
  const progress = CUSTOMER_PROGRESS[phase] ?? 0;

  if (phase === "boot") return null;

  return (
    <div className="cinema-top-progress" aria-hidden>
      <div className="cinema-top-progress-fill" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}
