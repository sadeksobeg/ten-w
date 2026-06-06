"use client";

import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import { CinemaCheckoutPhase } from "@/components/cinema-demo/phases/CinemaCheckoutPhase";
import { CinemaMoviesPhase } from "@/components/cinema-demo/phases/CinemaMoviesPhase";
import { CinemaSeatsPhase } from "@/components/cinema-demo/phases/CinemaSeatsPhase";
import { CinemaShowtimePhase } from "@/components/cinema-demo/phases/CinemaShowtimePhase";
import { CinemaSplashPhase } from "@/components/cinema-demo/phases/CinemaSplashPhase";
import { CinemaTicketPhase } from "@/components/cinema-demo/phases/CinemaTicketPhase";

export function CinemaDemoExperience() {
  const phase = useCinemaDemoStore((s) => s.phase);

  switch (phase) {
    case "splash":
      return <CinemaSplashPhase />;
    case "movies":
      return <CinemaMoviesPhase />;
    case "showtime":
      return <CinemaShowtimePhase />;
    case "seats":
      return <CinemaSeatsPhase />;
    case "checkout":
      return <CinemaCheckoutPhase />;
    case "ticket":
    case "dashboard":
      return <CinemaTicketPhase />;
    default:
      return <CinemaSplashPhase />;
  }
}
