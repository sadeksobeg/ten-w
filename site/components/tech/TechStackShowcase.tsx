"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";
import {
  techStackCategoryOrder,
  type TechStackItem,
} from "@/lib/fallback-data";
import { contentLocale } from "@/lib/locale-content";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

/** Mixkit — futuristic hex tunnel (abstract tech / neon); override with NEXT_PUBLIC_TECH_HERO_VIDEO_URL */
const DEFAULT_VIDEO =
  "https://assets.mixkit.co/videos/30875/30875-720.mp4";

type Props = { items: TechStackItem[] };

export function TechStackShowcase({ items }: Props) {
  const t = useTranslations("TechPage");
  const locale = useLocale();
  const cl = contentLocale(locale);
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const videoOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.35]);
  const contentY = useTransform(scrollYProgress, [0, 0.4], [0, 48]);

  const videoSrc =
    typeof process.env.NEXT_PUBLIC_TECH_HERO_VIDEO_URL === "string" &&
    process.env.NEXT_PUBLIC_TECH_HERO_VIDEO_URL.length > 0
      ? process.env.NEXT_PUBLIC_TECH_HERO_VIDEO_URL
      : DEFAULT_VIDEO;

  const grouped = items.reduce<Record<string, TechStackItem[]>>((acc, item) => {
    const k = item.category.en;
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});

  const groupOrder = techStackCategoryOrder.filter((k) => (grouped[k]?.length ?? 0) > 0);

  return (
    <>
      <div
        ref={heroRef}
        className="relative min-h-[min(88vh,920px)] overflow-hidden border-b border-white/10"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(201,160,97,0.18),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(59,130,246,0.08),transparent_45%),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(201,160,97,0.06),transparent_40%)]"
          aria-hidden
        />
        <div
          className="tech-stack-grid-drift pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px]"
          aria-hidden
        />
        {!reduced ? (
          <motion.div
            style={{ opacity: videoOpacity }}
            className="absolute inset-0 overflow-hidden"
          >
            <video
              className="h-full w-full scale-105 object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          </motion.div>
        ) : null}
        <div
          className="absolute inset-0 bg-gradient-to-b from-bg/20 via-bg/75 to-bg"
          aria-hidden
        />
        <div
          className="tech-stack-shimmer absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(201,160,97,0.05)_50%,transparent_60%)]"
          aria-hidden
        />

        <motion.div
          style={{ y: reduced ? 0 : contentY }}
          className="relative z-10 mx-auto flex max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36 lg:px-8"
        >
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold/90"
          >
            {t("hero.kicker")}
          </motion.p>
          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05 }}
            className="font-[family-name:var(--font-cairo)] text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl"
          >
            {t("hero.title")}
          </motion.h1>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="mt-5 max-w-2xl text-lg text-muted md:text-xl"
          >
            {t("hero.subtitle")}
          </motion.p>
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            {[t("hero.badge1"), t("hero.badge2"), t("hero.badge3")].map((label) => (
              <span
                key={label}
                className="rounded-full border border-gold/25 bg-black/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-gold/90 backdrop-blur-md"
              >
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <div
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted/50 motion-safe:animate-bounce"
          aria-hidden
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">{t("scrollHint")}</span>
          <span className="h-8 w-px bg-gradient-to-b from-gold/50 to-transparent" />
        </div>
      </div>

      <Section className="relative overflow-hidden py-16 md:py-20">
        <div
          className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-gold/5 blur-3xl"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.h2
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-cairo)] text-2xl font-bold md:text-3xl"
          >
            {t("stackSectionTitle")}
          </motion.h2>
          <p className="mt-3 max-w-3xl text-muted">{t("stackSectionSubtitle")}</p>

          <div className="mt-12 space-y-14">
            {groupOrder.map((groupKey, gi) => {
              const list = grouped[groupKey];
              const first = list?.[0];
              const label = first?.category[cl] ?? groupKey;
              return (
                <motion.div
                  key={groupKey}
                  initial={reduced ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: gi * 0.06 }}
                >
                  <h3 className="mb-5 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold/85">
                    <span className="h-px w-8 bg-gold/40" aria-hidden />
                    {label}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {list?.map((item, ii) => (
                      <motion.span
                        key={item.name}
                        initial={reduced ? false : { opacity: 0, scale: 0.92 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: ii * 0.03, duration: 0.35 }}
                        whileHover={
                          reduced
                            ? undefined
                            : {
                                scale: 1.04,
                                boxShadow: "0 0 32px rgba(201, 160, 97, 0.15)",
                              }
                        }
                        className="relative rounded-2xl border border-white/10 bg-surface/80 px-5 py-3 text-sm font-medium text-foreground shadow-lg backdrop-blur-md"
                      >
                        {item.name}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      <Section className="border-t border-white/10 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-cairo)] text-2xl font-bold md:text-3xl"
          >
            {t("standards.title")}
          </motion.h2>
          <p className="mt-3 max-w-3xl text-muted">{t("standards.subtitle")}</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(["s1", "s2", "s3", "s4"] as const).map((sk, i) => (
              <motion.div
                key={sk}
                initial={reduced ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.42 }}
              >
                <Card className="h-full border-white/12 bg-surface/50 p-5 backdrop-blur-sm sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/85">
                    {t(`standards.${sk}.eyebrow`)}
                  </p>
                  <h3 className="mt-3 text-base font-semibold text-foreground">
                    {t(`standards.${sk}.title`)}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {t(`standards.${sk}.body`)}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="border-t border-white/10 bg-surface/35 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-14">
          {(["p1", "p2", "p3", "p4"] as const).map((pk, i) => (
            <motion.div
              key={pk}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <Card className="h-full border-gold/15 bg-bg/60 p-6 backdrop-blur-sm md:p-8">
                <h3 className="text-lg font-semibold text-gold">{t(`pillars.${pk}.title`)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                  {t(`pillars.${pk}.body`)}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="pb-20 pt-4">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="relative overflow-hidden border-gold/20 bg-gradient-to-br from-surface/90 to-bg/90 p-8 md:p-10">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl"
              aria-hidden
            />
            <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold text-foreground md:text-2xl">
              {t("platform.title")}
            </h2>
            <p className="mt-4 max-w-3xl text-muted md:text-lg">{t("platform.body")}</p>
          </Card>
        </motion.div>
      </Section>
    </>
  );
}
