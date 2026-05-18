"use client";

import { useEffect, useRef, useState } from "react";
import { siteMetrics } from "@/data/credibility";
import { pickLocalized } from "@/lib/locale-content";
import { useLocale } from "next-intl";

function formatMetricValue(value: string, suffix?: string): string {
  const prefix = value.startsWith("<") ? "< " : "";
  const core = value.startsWith("<") ? value.slice(1).trim() : value;
  return `${prefix}${core}${suffix ?? ""}`;
}

function parseNumericValue(raw: string): number | null {
  const core = raw.startsWith("<") ? raw.slice(1).trim() : raw;
  const match = core.match(/[\d.]+/);
  if (!match) return null;
  const n = Number.parseFloat(match[0]);
  return Number.isFinite(n) ? n : null;
}

function AnimatedValue({
  displayValue,
  suffix,
  reduceMotion,
  animate,
}: {
  displayValue: string;
  suffix?: string;
  reduceMotion: boolean;
  animate: boolean;
}) {
  const staticText = formatMetricValue(displayValue, suffix);
  const numeric = parseNumericValue(displayValue);
  const [display, setDisplay] = useState(() => {
    if (!animate || reduceMotion || numeric === null) {
      return displayValue.startsWith("<") ? displayValue.slice(1).trim() : displayValue;
    }
    return "0";
  });

  useEffect(() => {
    if (!animate || numeric === null || reduceMotion) {
      setDisplay(displayValue.startsWith("<") ? displayValue.slice(1).trim() : displayValue);
      return;
    }
    let frame = 0;
    const steps = 48;
    let raf = 0;
    const tick = () => {
      frame += 1;
      const t = Math.min(1, frame / steps);
      const eased = 1 - (1 - t) ** 3;
      const current = numeric * eased;
      const text = Number.isInteger(numeric)
        ? String(Math.round(current))
        : current.toFixed(1);
      setDisplay(text);
      if (frame < steps) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, displayValue, numeric, reduceMotion]);

  const prefix = displayValue.startsWith("<") ? "< " : "";
  const text =
    numeric === null || !animate || reduceMotion
      ? staticText
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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
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
                <AnimatedValue
                  displayValue={m.value}
                  suffix={m.suffix}
                  reduceMotion={reduceMotion}
                  animate={inView}
                />
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
      </div>
    </section>
  );
}
