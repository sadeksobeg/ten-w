"use client";

import { useCinemaDemoStore, type CinemaDemoPhase } from "@/stores/cinema-demo-store";

const CUSTOMER_PROGRESS: Partial<Record<CinemaDemoPhase, number>> = {
  movies: 0.15,
  showtime: 0.3,
  seats: 0.5,
  checkout: 0.65,
  upsell: 0.8,
  ticket: 0.95,
  roi: 1,
  closing: 1,
};

export function CinemaProgressBar() {
  const phase = useCinemaDemoStore((s) => s.phase);
  const demoMode = useCinemaDemoStore((s) => s.demoMode);
  const progress = demoMode === "customer" ? (CUSTOMER_PROGRESS[phase] ?? 0) : phase === "manager" ? 0.5 : 0.3;

  if (phase === "splash" || phase === "modeSelect") return null;

  return (
    <div className="cinema-top-progress" aria-hidden>
      <div className="cinema-top-progress-fill" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}
