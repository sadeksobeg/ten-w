"use client";

import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import { CinemaCheckoutPhase } from "@/components/cinema-demo/phases/CinemaCheckoutPhase";
import { CinemaClosingPhase } from "@/components/cinema-demo/phases/CinemaClosingPhase";
import { CinemaManagerPhase } from "@/components/cinema-demo/phases/CinemaManagerPhase";
import { CinemaModeSelectorPhase } from "@/components/cinema-demo/phases/CinemaModeSelectorPhase";
import { CinemaMoviesPhase } from "@/components/cinema-demo/phases/CinemaMoviesPhase";
import { CinemaRoiPanel } from "@/components/cinema-demo/phases/CinemaRoiPanel";
import { CinemaSeatsPhase } from "@/components/cinema-demo/phases/CinemaSeatsPhase";
import { CinemaShowtimePhase } from "@/components/cinema-demo/phases/CinemaShowtimePhase";
import { CinemaSplashPhase } from "@/components/cinema-demo/phases/CinemaSplashPhase";
import { CinemaTicketPhase } from "@/components/cinema-demo/phases/CinemaTicketPhase";
import { CinemaUpsellPhase } from "@/components/cinema-demo/phases/CinemaUpsellPhase";
import { CinemaVipPhase } from "@/components/cinema-demo/phases/CinemaVipPhase";

export function CinemaDemoExperience() {
  const phase = useCinemaDemoStore((s) => s.phase);
  const transitionClass = useCinemaDemoStore((s) => s.transitionClass);

  const content = (() => {
    switch (phase) {
      case "splash":
        return <CinemaSplashPhase />;
      case "modeSelect":
        return <CinemaModeSelectorPhase />;
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
      case "manager":
        return <CinemaManagerPhase />;
      case "vip":
        return <CinemaVipPhase />;
      case "roi":
        return <CinemaRoiPanel />;
      case "closing":
        return <CinemaClosingPhase />;
      default:
        return <CinemaSplashPhase />;
    }
  })();

  return (
    <div className={`cinema-experience ${transitionClass}`}>
      {content}
    </div>
  );
}
