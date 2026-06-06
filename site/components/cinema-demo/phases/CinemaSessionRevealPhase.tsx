"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CINEMA_FEATURES } from "@/lib/cinema-demo/features";
import { useAnimatedNumber } from "@/components/cinema-demo/hooks/useAnimatedNumber";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaSessionRevealPhase() {
  const t = useTranslations("CinemaDemo");
  const goToRoi = useCinemaDemoStore((s) => s.goToRoi);
  const ticketsBookedSession = useCinemaDemoStore((s) => s.ticketsBookedSession);
  const featuresSeen = useCinemaDemoStore((s) => s.featuresSeen);
  const liveRevenue = useCinemaDemoStore((s) => s.liveRevenue);
  const sessionStartedAt = useCinemaDemoStore((s) => s.sessionStartedAt);
  const selectedSeatIds = useCinemaDemoStore((s) => s.selectedSeatIds);
  const [allLit, setAllLit] = useState(false);

  const sessionSec = useMemo(() => {
    if (!sessionStartedAt) return 0;
    return Math.floor((Date.now() - sessionStartedAt) / 1000);
  }, [sessionStartedAt]);

  const tickets = Math.max(ticketsBookedSession, selectedSeatIds.length);
  const animatedTickets = useAnimatedNumber(tickets, 1200);
  const animatedFeatures = useAnimatedNumber(featuresSeen.length, 1800);
  const animatedRevenue = useAnimatedNumber(liveRevenue, 2000);

  useEffect(() => {
    if (featuresSeen.length >= 20) {
      const id = window.setTimeout(() => setAllLit(true), 500);
      return () => clearTimeout(id);
    }
  }, [featuresSeen.length]);

  const mins = Math.floor(sessionSec / 60);
  const secs = sessionSec % 60;

  return (
    <section className="cinema-phase cinema-session-reveal">
      <div className="cinema-os-center-panel">
        <h2 className="cinema-title">{t("sessionReveal.title")}</h2>
        <div className="cinema-session-stats">
          <p>{t("sessionReveal.booked")}: {animatedTickets}</p>
          <p>{t("sessionReveal.features")}: {animatedFeatures}</p>
          <p>{t("sessionReveal.revenue")}: {animatedRevenue.toLocaleString("ar-SY")} ل.س</p>
          <p>{t("sessionReveal.duration")}: {mins}:{String(secs).padStart(2, "0")}</p>
        </div>
        <p className="cinema-subtitle">{t("sessionReveal.built")}</p>

        <div className={`cinema-feature-grid ${allLit ? "is-complete" : ""}`}>
          {CINEMA_FEATURES.map((f, i) => (
            <article
              key={f.id}
              className={`cinema-feature-card ${featuresSeen.includes(f.id) ? "is-seen" : ""}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span>{f.id}</span>
              <p>{f.titleAr}</p>
            </article>
          ))}
        </div>

        {allLit ? <p className="cinema-session-complete">{t("sessionReveal.complete")}</p> : null}

        <button type="button" className="cinema-btn cinema-btn-primary mt-6" onClick={goToRoi}>
          {t("sessionReveal.continue")}
        </button>
      </div>
    </section>
  );
}
