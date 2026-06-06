"use client";

import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

type Props = {
  text: string;
  className?: string;
  delayMs?: number;
  staggerMs?: number;
  shimmer?: boolean;
};

export function LetterReveal({
  text,
  className = "",
  delayMs = 0,
  staggerMs = 50,
  shimmer = false,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const chars = Array.from(text);

  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className} aria-label={text}>
      {chars.map((char, i) => (
        <span
          key={`${char}-${i}`}
          className={`invite-letter ${shimmer ? "invite-text-shimmer" : ""}`}
          style={{
            animationDelay: `${delayMs + i * staggerMs}ms`,
            whiteSpace: char === " " ? "pre" : undefined,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
