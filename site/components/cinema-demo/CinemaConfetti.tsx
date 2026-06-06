"use client";

export function CinemaConfetti() {
  return (
    <div className="cinema-confetti" aria-hidden>
      {Array.from({ length: 24 }, (_, i) => (
        <span
          key={i}
          className="cinema-confetti-piece"
          style={{
            left: `${(i * 13) % 100}%`,
            animationDelay: `${i * 0.12}s`,
            background: i % 3 === 0 ? "#f5c518" : i % 3 === 1 ? "#ffffff" : "#c9922a",
          }}
        />
      ))}
    </div>
  );
}
