"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CinemaTicketCeremony } from "@/components/cinema-demo/CinemaTicketCeremony";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaTicketPhase() {
  const t = useTranslations("CinemaDemo");
  const bookingRef = useCinemaDemoStore((s) => s.bookingRef);
  const showtimeId = useCinemaDemoStore((s) => s.showtimeId);
  const goToSessionReveal = useCinemaDemoStore((s) => s.goToSessionReveal);
  const setPhase = useCinemaDemoStore((s) => s.setPhase);
  const [ceremonyDone, setCeremonyDone] = useState(false);

  useEffect(() => {
    if (!bookingRef || !showtimeId) setPhase("movies");
  }, [bookingRef, showtimeId, setPhase]);

  if (!bookingRef || !showtimeId) return null;

  return (
    <section className="cinema-phase cinema-phase--ticket">
      <div className="cinema-os-center-panel">
        <h2 className="cinema-title text-center">{t("ticket.title")}</h2>
        <CinemaTicketCeremony bookingRef={bookingRef} onComplete={() => setCeremonyDone(true)} />
        {ceremonyDone ? (
          <button type="button" className="cinema-btn cinema-btn-primary mt-6" onClick={goToSessionReveal}>
            {t("ticket.continue")}
          </button>
        ) : null}
      </div>
    </section>
  );
}
