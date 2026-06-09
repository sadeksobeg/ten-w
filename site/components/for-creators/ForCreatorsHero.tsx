"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
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
          style={{ animationDelay: `${baseDelayMs + i * 38}ms` }}
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
    for (let i = 0; i < 55; i++) {
      list.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 5,
      });
    }
    setParticles(list);
  }, []);

  const floatingStats = useMemo(
    () => [
      { key: "stat1" as const, rot: "-4deg", className: "top-[14%] start-[4%] hidden md:block" },
      { key: "stat2" as const, rot: "3deg", className: "top-[28%] end-[3%] hidden md:block" },
      { key: "stat3" as const, rot: "-2deg", className: "bottom-[22%] start-[6%] hidden md:block" },
    ],
    [],
  );

  const mobileStats = ["stat1", "stat2", "stat3"] as const;

  return (
    <section className="relative flex min-h-[94dvh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[#03010A]" aria-hidden />
      <div className="fc-hero-mesh pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute -top-24 end-0 h-[640px] w-[640px] rounded-full fc-aurora-1"
        style={{
          background: "radial-gradient(ellipse, rgba(225,29,72,0.22) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 start-0 h-[640px] w-[840px] rounded-full fc-aurora-2"
        style={{
          background: "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full fc-aurora-3"
        style={{
          background: "radial-gradient(ellipse, rgba(201,146,42,0.12) 0%, transparent 60%)",
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
            opacity: 0.12 + (p.id % 5) * 0.06,
            animation: `fc-twinkle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
          aria-hidden
        />
      ))}

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 font-mono text-[11px] tracking-[0.38em] text-[var(--creator-secondary)]/65"
      >
        {t("eyebrow", { year })}
      </motion.p>

      <h1 className="relative z-10 mt-6 font-[family-name:var(--font-cairo)] text-[clamp(2.25rem,9vw,5.5rem)] font-black leading-[1.08] text-white">
        <span className="block">
          <LetterReveal text={t("title1")} baseDelayMs={350} />
        </span>
        <span className="mt-2 block fc-shimmer-text">
          <LetterReveal text={t("title2")} baseDelayMs={350 + t("title1").length * 38} />
        </span>
      </h1>

      <div
        className="relative z-10 mx-auto mt-6 h-px fc-separator"
        style={{ background: "linear-gradient(90deg, transparent, #c9922a, transparent)" }}
        aria-hidden
      />

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.2 }}
        className="relative z-10 mx-auto mt-6 max-w-2xl text-[clamp(1rem,2.5vw,1.2rem)] leading-[1.75] text-[rgba(248,244,255,0.78)]"
      >
        {t("subtitle")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        className="relative z-10 mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <a href="#apply" className="fc-cta-glow">
          <GoldButton type="button" className="!px-8 !py-3.5 text-sm">
            {t("cta")}
          </GoldButton>
        </a>
        <a
          href="#demo"
          className="fc-hero-secondary group rounded-full border border-white/20 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition hover:border-[var(--creator-secondary)]/50 hover:text-white"
        >
          <span className="inline-block transition group-hover:translate-y-0.5">{t("secondary")}</span>
        </a>
      </motion.div>

      <div className="relative z-10 mt-10 grid w-full max-w-lg grid-cols-3 gap-2 md:hidden">
        {mobileStats.map((key, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 + i * 0.1 }}
            className="creator-card fc-mobile-stat px-2 py-3 text-center"
          >
            <p className="text-[11px] font-black leading-tight text-[var(--creator-secondary)]">{t(`${key}.value`)}</p>
            <p className="mt-1 text-[8px] leading-snug text-white/45">{t(`${key}.sub`)}</p>
          </motion.div>
        ))}
      </div>

      {floatingStats.map((s, i) => (
        <motion.div
          key={s.key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2 + i * 0.15, duration: 0.5 }}
          className={`creator-card fc-float-stat absolute z-10 px-5 py-3.5 text-start ${s.className}`}
          style={{ ["--fc-rot" as string]: s.rot, animationDelay: `${i * 400}ms` }}
        >
          <p className="font-[family-name:var(--font-cairo)] text-sm font-black text-white">{t(`${s.key}.value`)}</p>
          <p className="mt-0.5 text-[10px] text-white/50">{t(`${s.key}.sub`)}</p>
        </motion.div>
      ))}
    </section>
  );
}
