"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { Container } from "@/components/ui/Container";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import {
  SolutionPillarIcon,
  type PillarId,
} from "@/components/solutions/SolutionPillarIcon";

const PILLARS: { key: PillarId; ns: "ai" | "cyber" | "software" | "infra" }[] =
  [
    { key: "ai", ns: "ai" },
    { key: "cyber", ns: "cyber" },
    { key: "software", ns: "software" },
    { key: "infra", ns: "infra" },
  ];

const statKeys = ["s1", "s2", "s3"] as const;
const globalKeys = ["p1", "p2", "p3"] as const;
const bulletKeys = ["b1", "b2", "b3"] as const;

const ease = [0.22, 1, 0.36, 1] as const;

export function SolutionsPageView() {
  const t = useTranslations("SolutionsPage");
  const reduced = useReducedMotion();

  const fadeUp = reduced
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, y: 20 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease },
        },
      };

  const stagger = reduced
    ? undefined
    : {
        hidden: {},
        show: {
          transition: { staggerChildren: 0.08, delayChildren: 0.06 },
        },
      };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 start-1/4 h-[min(100vw,520px)] w-[min(100vw,520px)] -translate-x-1/2 rounded-full bg-gold/[0.09] blur-[100px]" />
          <div className="absolute -end-20 top-10 h-[min(80vw,380px)] w-[min(80vw,380px)] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,160,97,0.12),transparent_65%)] blur-2xl" />
          <div
            className="absolute inset-0 opacity-[0.2] [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:56px_56px]"
            aria-hidden
          />
        </div>

        <Container className="relative py-16 md:py-24 lg:py-28">
          <motion.div
            initial={reduced ? "show" : "hidden"}
            animate="show"
            variants={stagger}
            className="max-w-4xl"
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-[0.28em] text-gold/90 md:text-sm"
            >
              {t("hero.eyebrow")}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-4 font-[family-name:var(--font-cairo)] text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[3.15rem]"
            >
              {t("hero.title")}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-3xl text-lg leading-relaxed text-muted md:text-xl"
            >
              {t("hero.subtitle")}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-3xl text-base leading-relaxed text-muted/95 md:text-lg"
            >
              {t("hero.lead")}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-12 flex flex-wrap gap-x-10 gap-y-6 border-t border-white/10 pt-10 md:gap-x-14"
            >
              {statKeys.map((k) => (
                <div key={k} className="min-w-[140px]">
                  <p className="text-sm font-medium leading-snug text-foreground md:text-base">
                    {t(`stats.${k}`)}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Pillars */}
      <section className="py-16 md:py-24">
        <Container>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="font-[family-name:var(--font-cairo)] text-3xl font-bold tracking-tight md:text-4xl">
              {t("pillarsHead.title")}
            </h2>
            <p className="mt-4 text-muted md:text-lg">
              {t("pillarsHead.subtitle")}
            </p>
            <p className="mt-4 text-sm font-medium text-gold/85 md:text-base">
              {t("pillarsHead.simHint")}
            </p>
          </motion.div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-2 xl:gap-6">
            {PILLARS.map(({ key, ns }, i) => (
              <Link
                key={key}
                href={`/solutions/${key}`}
                aria-label={t(`${ns}.title`)}
                className="group block rounded-2xl outline-none transition-[transform,box-shadow] focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: reduced ? 0 : i * 0.06,
                  ease,
                }}
                className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-surface/80 via-surface/40 to-transparent p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-[border-color,box-shadow,transform] duration-300 hover:border-gold/35 hover:shadow-[0_0_48px_-20px_rgba(201,160,97,0.35)] group-hover:-translate-y-0.5 md:p-8"
              >
                <div
                  className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-gold/[0.06] blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden
                />
                <div className="relative flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/[0.08] text-gold transition-colors duration-300 group-hover:border-gold/45 group-hover:bg-gold/[0.12]">
                    <SolutionPillarIcon id={key} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-[family-name:var(--font-cairo)] text-xl font-bold text-foreground">
                      {t(`${ns}.title`)}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                      {t(`${ns}.body`)}
                    </p>
                    <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-sm text-muted/95 md:text-[0.9375rem]">
                      {bulletKeys.map((bk) => (
                        <li key={bk} className="flex gap-3">
                          <span
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/80"
                            aria-hidden
                          />
                          <span className="leading-relaxed">
                            {t(`${ns}.${bk}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-gold/90">
                      {t("pillarsHead.openSim")}
                    </p>
                  </div>
                </div>
              </motion.div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Global band */}
      <section className="border-y border-white/10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(201,160,97,0.14),transparent_55%)] py-16 md:py-20">
        <Container>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold md:text-3xl">
              {t("global.title")}
            </h2>
            <p className="mt-4 text-muted md:text-lg">{t("global.lead")}</p>
          </motion.div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {globalKeys.map((gk, i) => (
              <motion.div
                key={gk}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.45,
                  delay: reduced ? 0 : i * 0.07,
                  ease,
                }}
                className="rounded-xl border border-white/10 bg-surface/50 p-5 text-center md:p-6"
              >
                <p className="text-sm leading-relaxed text-muted md:text-[0.9375rem]">
                  {t(`global.${gk}`)}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Platform CTA */}
      <section className="py-14 md:py-16">
        <Container>
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease }}
            className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold-dim/30 via-surface/60 to-surface/30 p-8 md:flex md:items-center md:justify-between md:gap-8 md:p-10"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(105deg,transparent_40%,rgba(201,160,97,0.12)_100%)]"
              aria-hidden
            />
            <div className="relative max-w-2xl">
              <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold md:text-2xl">
                {t("intelligentSystems.title")}
              </h2>
              <p className="mt-3 text-sm text-muted md:text-base">
                {t("intelligentSystems.subtitle")}
              </p>
            </div>
            <TrackedLink
              href="/solutions/intelligent-systems"
              eventName="cta_primary_click"
              eventParams={{
                location: "solutions_banner",
                target: "/solutions/intelligent-systems",
              }}
              className="relative mt-6 inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-gold-bright md:mt-0"
            >
              {t("intelligentSystems.link")}
            </TrackedLink>
          </motion.div>
        </Container>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-white/10 bg-surface/35 py-14 md:py-16">
        <Container>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease }}
            className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between"
          >
            <div className="max-w-xl">
              <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold md:text-3xl">
                {t("cta.title")}
              </h2>
              <p className="mt-3 text-muted md:text-lg">{t("cta.subtitle")}</p>
            </div>
            <TrackedLink
              href="/contact?intent=consult"
              eventName="cta_primary_click"
              eventParams={{ location: "solutions_footer", target: "/contact" }}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-gold px-8 py-3 text-sm font-semibold text-bg hover:bg-gold-bright sm:w-auto"
            >
              {t("cta.button")}
            </TrackedLink>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
