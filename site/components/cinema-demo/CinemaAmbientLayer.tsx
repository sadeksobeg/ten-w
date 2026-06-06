"use client";

import { CinemaFilmGrain } from "@/components/cinema-demo/CinemaFilmGrain";

export function CinemaAmbientLayer() {
  return (
    <div className="cinema-ambient" aria-hidden>
      <div className="cinema-ambient-glow cinema-ambient-glow--gold" />
      <div className="cinema-ambient-glow cinema-ambient-glow--purple" />
      <div className="cinema-ambient-grain" />
      <CinemaFilmGrain />
      {Array.from({ length: 18 }, (_, i) => (
        <span
          key={i}
          className="cinema-ambient-particle"
          style={{
            left: `${(i * 17 + 5) % 100}%`,
            animationDelay: `${i * 0.35}s`,
            animationDuration: `${6 + (i % 5)}s`,
          }}
        />
      ))}
    </div>
  );
}
