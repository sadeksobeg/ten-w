"use client";

import { CinemaFilmGrain } from "@/components/cinema-demo/CinemaFilmGrain";

export function CinemaAmbientLayer() {
  return (
    <div className="cinema-ambient" aria-hidden>
      <div className="cinema-ambient-glow cinema-ambient-glow--gold" />
      <div className="cinema-ambient-glow cinema-ambient-glow--purple" />
      <CinemaFilmGrain />
    </div>
  );
}
