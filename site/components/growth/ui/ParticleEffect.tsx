"use client";

type Props = {
  active?: boolean;
  className?: string;
};

/** CSS-only celebration particles; respects prefers-reduced-motion via parent CSS. */
export function ParticleEffect({ active = true, className = "" }: Props) {
  if (!active) return null;
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="growth-particle absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-gold motion-reduce:hidden"
          style={{
            ["--particle-i" as string]: String(i),
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
