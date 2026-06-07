"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("CinemaDemo");
  const phase = useCinemaDemoStore((s) => s.phase);
  const progress = CUSTOMER_PROGRESS[phase] ?? 0;
  const pct = Math.round(progress * 100);

  if (phase === "boot") return null;

  return (
    <div
      className="cinema-os-progress"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={t("os.progressLabel", { pct })}
    >
      <div className="cinema-os-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
