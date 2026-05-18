"use client";

import { useEffect, useRef, useState } from "react";
import { siteMetrics, metricsDisclaimer } from "@/data/credibility";
import { pickLocalized } from "@/lib/locale-content";
import { useLocale } from "next-intl";

function parseNumericValue(raw: string): number | null {
  const match = raw.match(/[\d.]+/);
  if (!match) return null;
  const n = Number.parseFloat(match[0]);
  return Number.isFinite(n) ? n : null;
}

function AnimatedValue({
  displayValue,
  suffix,
  reduceMotion,
}: {
  displayValue: string;
  suffix?: string;
  reduceMotion: boolean;
}) {
  const numeric = parseNumericValue(displayValue);
  const [display, setDisplay] = useState(
    reduceMotion || numeric === null ? displayValue : "0",
  );

  useEffect(() => {
    if (numeric === null || reduceMotion) {
      setDisplay(displayValue);
      return;
    }
    let frame = 0;
    const steps = 48;
    const id = requestAnimationFrame(function tick() {
      frame += 1;
      const t = Math.min(1, frame / steps);
      const eased = 1 - (1 - t) ** 3;
      const current = numeric * eased;
      const text =
        Number.isInteger(numeric) && numeric === current
          ? String(Math.round(current))
          : current.toFixed(1);
      setDisplay(text);
      if (frame < steps) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [displayValue, numeric, reduceMotion]);

  const prefix = displayValue.startsWith("<") ? "< " : "";
  const text =
    numeric === null
      ? `${displayValue}${suffix ?? ""}`
      : `${prefix}${display}${suffix ?? ""}`;

  return <span>{text}</span>;
}

export function MetricsBand() {
  const locale = useLocale();
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setInView(true);
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-y border-white/10 bg-surface/30 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {siteMetrics.map((m) => (
            <div key={m.label.en} className="text-center">
              <div className="font-[family-name:var(--font-cairo)] text-3xl font-extrabold text-gold md:text-4xl">
                {inView ? (
                  <AnimatedValue
                    displayValue={m.value}
                    suffix={m.suffix}
                    reduceMotion={reduceMotion}
                  />
                ) : (
                  <span>—</span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-foreground/90">
                {pickLocalized(m.label, locale)}
              </p>
              {m.sublabel ? (
                <p className="mt-1 text-xs text-muted">{pickLocalized(m.sublabel, locale)}</p>
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-white/40">
          {pickLocalized(metricsDisclaimer, locale)}
        </p>
      </div>
    </section>
  );
}
