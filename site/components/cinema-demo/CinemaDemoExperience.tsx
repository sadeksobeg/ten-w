"use client";

import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import { CinemaOSDesktop } from "@/components/cinema-demo/CinemaOSDesktop";
import { CinemaCheckoutPhase } from "@/components/cinema-demo/phases/CinemaCheckoutPhase";
import { CinemaClosingPhase } from "@/components/cinema-demo/phases/CinemaClosingPhase";
import { CinemaMoviesPhase } from "@/components/cinema-demo/phases/CinemaMoviesPhase";
import { CinemaRoiPanel } from "@/components/cinema-demo/phases/CinemaRoiPanel";
import { CinemaSeatsPhase } from "@/components/cinema-demo/phases/CinemaSeatsPhase";
import { CinemaSessionRevealPhase } from "@/components/cinema-demo/phases/CinemaSessionRevealPhase";
import { CinemaShowtimePhase } from "@/components/cinema-demo/phases/CinemaShowtimePhase";
import { CinemaBootOS } from "@/components/cinema-demo/phases/CinemaBootOS";
import { CinemaTicketPhase } from "@/components/cinema-demo/phases/CinemaTicketPhase";
import { CinemaUpsellPhase } from "@/components/cinema-demo/phases/CinemaUpsellPhase";

export function CinemaDemoExperience() {
  const phase = useCinemaDemoStore((s) => s.phase);
  const transitionClass = useCinemaDemoStore((s) => s.transitionClass);

  if (phase === "boot") {
    return <CinemaBootOS />;
  }

  const center = (() => {
    switch (phase) {
      case "movies":
        return <CinemaMoviesPhase />;
      case "showtime":
        return <CinemaShowtimePhase />;
      case "seats":
        return <CinemaSeatsPhase />;
      case "checkout":
        return <CinemaCheckoutPhase />;
      case "upsell":
        return <CinemaUpsellPhase />;
      case "ticket":
        return <CinemaTicketPhase />;
      case "sessionReveal":
        return <CinemaSessionRevealPhase />;
      case "roi":
        return <CinemaRoiPanel />;
      case "closing":
        return <CinemaClosingPhase />;
      default:
        return <CinemaMoviesPhase />;
    }
  })();

  return (
    <div className={`cinema-experience ${transitionClass}`}>
      <CinemaOSDesktop>{center}</CinemaOSDesktop>
    </div>
  );
}
