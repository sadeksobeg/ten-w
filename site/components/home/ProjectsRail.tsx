"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { ProjectCard } from "@/lib/fallback-data";
import { contentLocale } from "@/lib/locale-content";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Props = {
  title: string;
  viewAllLabel: string;
  detailLabel: string;
  projects: ProjectCard[];
  locale: Locale;
};

export function ProjectsRail({
  title,
  viewAllLabel,
  detailLabel,
  projects,
  locale,
}: Props) {
  const reduced = useReducedMotion();
  const cl = contentLocale(locale);

  return (
    <section className="relative border-y border-white/10 bg-surface/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <motion.h2
            className="js-parallax-slow font-[family-name:var(--font-cairo)] text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            {title}
          </motion.h2>
          <MagneticLink
            href="/projects"
            className="shrink-0 text-sm font-semibold text-gold md:text-base"
          >
            {viewAllLabel}
          </MagneticLink>
        </div>

        <div className="relative mt-14">
          <div
            className="-mx-4 flex gap-6 overflow-x-auto overflow-y-visible px-4 pb-4 pt-2 snap-x snap-mandatory scroll-pl-4 [scrollbar-width:none] md:-mx-6 md:px-6 [&::-webkit-scrollbar]:hidden"
            style={{
              maskImage:
                "linear-gradient(90deg,transparent,black 24px,black calc(100% - 24px),transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg,transparent,black 24px,black calc(100% - 24px),transparent)",
            }}
          >
            {projects.map((p) => (
              <motion.div
                key={p.slug}
                className="min-w-[min(88vw,400px)] shrink-0 snap-center"
                whileHover={
                  reduced
                    ? undefined
                    : {
                        scale: 1.03,
                        zIndex: 2,
                        transition: { type: "spring", stiffness: 380, damping: 24 },
                      }
                }
                style={{ transformOrigin: "center center" }}
              >
                <GlassCard className="relative h-full min-h-[220px]">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-40 blur-xl transition-opacity duration-300 group-hover:opacity-70"
                    aria-hidden
                    style={{
                      background:
                        "radial-gradient(circle at 30% 20%, rgba(201,160,97,0.25), transparent 55%)",
                    }}
                  />
                  <h3 className="relative text-xl font-semibold text-foreground">
                    {p.title[cl]}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-muted">
                    {p.excerpt[cl]}
                  </p>
                  {p.metrics ? (
                    <p className="relative mt-4 text-sm font-medium text-gold">
                      {p.metrics[cl]}
                    </p>
                  ) : null}
                  <Link
                    href={`/projects/${p.slug}`}
                    className="relative mt-6 inline-flex text-sm font-semibold text-gold underline-offset-4 hover:underline"
                  >
                    {detailLabel}
                  </Link>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
