"use client";

const STEPS = 5;

type Props = { step: number };

export function CinemaProgressSteps({ step }: Props) {
  return (
    <div className="cinema-steps" aria-hidden>
      {Array.from({ length: STEPS }, (_, i) => (
        <span
          key={i}
          className={`cinema-step ${i < step ? "is-done" : ""} ${i === step ? "is-active" : ""}`}
        />
      ))}
    </div>
  );
}
