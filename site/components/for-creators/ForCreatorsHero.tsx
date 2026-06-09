"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { GoldButton } from "@/components/growth/ui/GoldButton";

type Particle = { id: number; left: number; top: number; size: number; delay: number; duration: number };

function LetterReveal({ text, baseDelayMs }: { text: string; baseDelayMs: number }) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return <>{text}</>;
  return (
    <>
      {[...text].map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className="fc-letter"
          style={{ animationDelay: `${baseDelayMs + i * 40}ms` }}
        >
          {ch === " " ? "\u00a0" : ch}
        </span>
      ))}
    </>
  );
}

export function ForCreatorsHero() {
  const t = useTranslations("Creators.public.hero");
  const year = new Date().getFullYear();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const list: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      list.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 4,
      });
    }
    setParticles(list);
  }, []);

  const floatingStats = useMemo(
    () => [
      { key: "stat1" as const, rot: "-3deg", className: "top-[18%] start-[6%] hidden lg:block" },
      { key: "stat2" as const, rot: "2deg", className: "top-[32%] end-[5%] hidden lg:block" },
      { key: "stat3" as const, rot: "-1deg", className: "bottom-[28%] start-[8%] hidden lg:block" },
    ],
    [],
  );

  return (
    <section className="relative flex min-h-[92dvh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[#03010A]" aria-hidden />
      <div
        className="pointer-events-none absolute -top-24 end-0 h-[600px] w-[600px] rounded-full fc-aurora-1"
        style={{
          background: "radial-gradient(ellipse, rgba(225,29,72,0.2) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 start-0 h-[600px] w-[800px] rounded-full fc-aurora-2"
        style={{
          background: "radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full fc-aurora-3"
        style={{
          background: "radial-gradient(ellipse, rgba(201,146,42,0.1) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
        aria-hidden
      />
      {particles.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute rounded-full bg-white"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: 0.1 + Math.random() * 0.3,
            animation: `fc-twinkle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
          aria-hidden
        />
      ))}

      <p
        className="relative z-10 font-mono text-[11px] tracking-[0.35em] text-[var(--creator-secondary)]/50 fc-fade-up"
        style={{ animationDelay: "200ms" }}
      >
        {t("eyebrow", { year })}
      </p>

      <h1 className="relative z-10 mt-6 font-[family-name:var(--font-cairo)] text-[clamp(2.5rem,10vw,6rem)] font-black leading-[1.05] text-white">
        <span className="block">
          <LetterReveal text={t("title1")} baseDelayMs={400} />
        </span>
        <span className="mt-1 block fc-shimmer-text">
          <LetterReveal text={t("title2")} baseDelayMs={400 + t("title1").length * 40} />
        </span>
      </h1>

      <div
        className="relative z-10 mx-auto mt-6 h-px fc-separator"
        style={{ background: "linear-gradient(90deg, transparent, #c9922a, transparent)" }}
        aria-hidden
      />

      <p
        className="relative z-10 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[rgba(248,244,255,0.75)] fc-fade-up"
        style={{ animationDelay: "1.8s" }}
      >
        {t("subtitle")}
      </p>

      <div
        className="relative z-10 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row fc-fade-up"
        style={{ animationDelay: "2.2s" }}
      >
        <a href="#apply">
          <GoldButton type="button">{t("cta")}</GoldButton>
        </a>
        <a
          href="#demo"
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/75 transition hover:border-white/35"
        >
          {t("secondary")}
        </a>
      </div>

      {floatingStats.map((s, i) => (
        <div
          key={s.key}
          className={`creator-card absolute z-10 px-5 py-3 text-start fc-float-stat ${s.className}`}
          style={{ ["--fc-rot" as string]: s.rot, animationDelay: `${i * 400}ms` }}
        >
          <p className="text-sm font-bold text-white">{t(`${s.key}.value`)}</p>
          <p className="text-[10px] text-white/50">{t(`${s.key}.sub`)}</p>
        </div>
      ))}
    </section>
  );
}
