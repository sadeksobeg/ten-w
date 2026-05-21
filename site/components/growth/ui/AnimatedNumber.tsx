"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  durationMs?: number;
  format?: (n: number) => string;
  className?: string;
};

export function AnimatedNumber({
  value,
  durationMs = 1200,
  format = (n) => String(Math.round(n)),
  className = "",
}: Props) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current && display === value) return;
    started.current = true;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const from = display;
    const delta = value - from;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(from + delta * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate when target value changes
  }, [value, durationMs]);

  return <span className={className}>{format(display)}</span>;
}
