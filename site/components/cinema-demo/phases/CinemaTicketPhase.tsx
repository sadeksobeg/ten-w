"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CinemaTicketCeremony } from "@/components/cinema-demo/CinemaTicketCeremony";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaTicketPhase() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const ticketRef = useRef<HTMLDivElement>(null);
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
        <div ref={ticketRef}>
          <CinemaTicketCeremony bookingRef={bookingRef} onComplete={() => setCeremonyDone(true)} />
        </div>
        {ceremonyDone ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button type="button" className="cinema-btn cinema-btn-primary" onClick={goToSessionReveal}>
              {t("ticket.continue")}
            </button>
            <button
              type="button"
              className="cinema-btn cinema-btn-ghost"
              onClick={() => {
                const url = `${window.location.origin}/${locale}/demo/cinema?presenter=1&phase=ticket&utm_source=creator&utm_campaign=ticket`;
                void navigator.clipboard.writeText(url).catch(() => undefined);
              }}
            >
              {t("ticket.share")}
            </button>
            <button
              type="button"
              className="cinema-btn cinema-btn-ghost"
              onClick={() => {
                const canvas = ticketRef.current?.querySelector("canvas");
                if (!canvas) return;
                canvas.toBlob((blob) => {
                  if (!blob) return;
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `tenegta-ticket-${bookingRef}.png`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                });
              }}
            >
              {t("ticket.downloadPng")}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
