"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HeroRotatingHeadline } from "@/components/hero/HeroRotatingHeadline";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const HeroNeuralCanvas = dynamic(
  () => import("@/components/hero/HeroNeuralScene"),
  { ssr: false, loading: () => null },
);

export type CinematicHeroProps = {
  brandLabel: string;
  title: string;
  subtitle: string;
  /** Supporting paragraph between subtitle and CTAs */
  lead?: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaPrimaryHref: string;
  ctaSecondaryHref: string;
};

export function CinematicHero({
  brandLabel,
  title,
  subtitle,
  lead,
  ctaPrimary,
  ctaSecondary,
  ctaPrimaryHref,
  ctaSecondaryHref,
}: CinematicHeroProps) {
  const reduced = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [count, setCount] = useState(900);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setCoarse(mq.matches);
        const w = window.innerWidth;
        setCount(w < 640 ? 300 : w < 1024 ? 620 : 1280);
      });
    };
    sync();
    mq.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (coarse) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setPointer({ x, y });
  };

  return (
    <section
      className="relative flex min-h-[min(92vh,940px)] items-center overflow-hidden border-b border-white/10"
      onPointerMove={onPointerMove}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg via-[#14100a] to-bg"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55] [background-image:linear-gradient(to_right,rgba(201,160,97,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(201,160,97,0.05)_1px,transparent_1px)] [background-size:52px_52px]"
        aria-hidden
      />
      {!reduced ? (
        <>
          <div
            className="hero-aurora pointer-events-none absolute inset-0 opacity-[0.55] mix-blend-screen"
            aria-hidden
          />
          <div className="hero-grain pointer-events-none absolute inset-0" aria-hidden />
        </>
      ) : null}

      {!reduced && !coarse ? (
        <div className="absolute inset-0 z-0">
          <HeroNeuralCanvas
            pointer={pointer}
            coarse={coarse}
            count={count}
          />
        </div>
      ) : null}

      <div className="relative z-20 isolate mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        {reduced ? (
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold/90 sm:text-sm">
              {brandLabel}
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-cairo)] text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[3.4rem]">
              {title}
            </h1>
            <HeroRotatingHeadline />
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              {subtitle}
            </p>
            {lead ? (
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted/90 md:text-base">
                {lead}
              </p>
            ) : null}
            <div className="mt-10 flex flex-wrap gap-4">
              <MagneticLink
                href={ctaPrimaryHref}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-8 py-3 text-sm font-semibold text-bg shadow-[0_0_42px_-12px_rgba(201,160,97,0.7)] transition-shadow hover:shadow-[0_0_56px_-10px_rgba(255,215,0,0.5)]"
              >
                {ctaPrimary}
              </MagneticLink>
              <MagneticLink
                href={ctaSecondaryHref}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-gold/45 bg-white/[0.04] px-8 py-3 text-sm font-semibold text-gold backdrop-blur-md transition-colors hover:border-gold hover:bg-gold-dim/35"
              >
                {ctaSecondary}
              </MagneticLink>
            </div>
          </div>
        ) : (
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold/90 sm:text-sm">
              {brandLabel}
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-cairo)] text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[3.4rem]">
              {title}
            </h1>
            <HeroRotatingHeadline />
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              {subtitle}
            </p>
            {lead ? (
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted/90 md:text-base">
                {lead}
              </p>
            ) : null}
            <div className="mt-10 flex flex-wrap gap-4">
              <MagneticLink
                href={ctaPrimaryHref}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-8 py-3 text-sm font-semibold text-bg shadow-[0_0_42px_-12px_rgba(201,160,97,0.7)] transition-shadow hover:shadow-[0_0_56px_-10px_rgba(255,215,0,0.5)]"
              >
                {ctaPrimary}
              </MagneticLink>
              <MagneticLink
                href={ctaSecondaryHref}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-gold/45 bg-white/[0.04] px-8 py-3 text-sm font-semibold text-gold backdrop-blur-md transition-colors hover:border-gold hover:bg-gold-dim/35"
              >
                {ctaSecondary}
              </MagneticLink>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
