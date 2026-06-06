"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CinemaTicketCeremony } from "@/components/cinema-demo/CinemaTicketCeremony";
import { CinemaConfetti } from "@/components/cinema-demo/CinemaConfetti";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
import { CinemaProgressSteps } from "@/components/cinema-demo/CinemaProgressSteps";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaTicketPhase() {
  const t = useTranslations("CinemaDemo");
  const bookingRef = useCinemaDemoStore((s) => s.bookingRef);
  const showtimeId = useCinemaDemoStore((s) => s.showtimeId);
  const goToRoi = useCinemaDemoStore((s) => s.goToRoi);
  const setPhase = useCinemaDemoStore((s) => s.setPhase);
  const [ceremonyDone, setCeremonyDone] = useState(false);

  useEffect(() => {
    if (!bookingRef || !showtimeId) setPhase("movies");
  }, [bookingRef, showtimeId, setPhase]);

  if (!bookingRef || !showtimeId) return null;

  return (
    <section className="cinema-phase cinema-phase--ticket">
      <CinemaConfetti />
      <CinemaDemoHeader />
      <div className="cinema-container">
        <CinemaProgressSteps step={4} />
        <h2 className="cinema-title text-center cinema-reveal">{t("ticket.title")}</h2>
        <p className="cinema-subtitle text-center cinema-reveal cinema-reveal--delay-1">
          {t("ticket.subtitle")}
        </p>

        <CinemaTicketCeremony bookingRef={bookingRef} onComplete={() => setCeremonyDone(true)} />

        {ceremonyDone ? (
          <div className="mt-6 flex flex-wrap justify-center gap-3 cinema-reveal">
            <button type="button" className="cinema-btn cinema-btn-primary" onClick={goToRoi}>
              {t("ticket.roiCta")}
            </button>
          </div>
        ) : null}

        <p className="cinema-demo-note">{t("demoNote")}</p>
      </div>
    </section>
  );
}
