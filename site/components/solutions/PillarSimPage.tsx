"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { TrackedLink } from "@/components/ui/TrackedLink";
import type { PillarSlug } from "@/components/solutions/pillar-types";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const AiNeuralCanvas = dynamic(
  () =>
    import("@/components/solutions/simulations/AiNeuralCanvas").then(
      (m) => m.AiNeuralCanvas,
    ),
  { ssr: false, loading: () => <SimPlaceholder /> },
);
const CyberRadarCanvas = dynamic(
  () =>
    import("@/components/solutions/simulations/CyberRadarCanvas").then(
      (m) => m.CyberRadarCanvas,
    ),
  { ssr: false, loading: () => <SimPlaceholder /> },
);
const SoftwareMeshCanvas = dynamic(
  () =>
    import("@/components/solutions/simulations/SoftwareMeshCanvas").then(
      (m) => m.SoftwareMeshCanvas,
    ),
  { ssr: false, loading: () => <SimPlaceholder /> },
);
const InfraTrafficCanvas = dynamic(
  () =>
    import("@/components/solutions/simulations/InfraTrafficCanvas").then(
      (m) => m.InfraTrafficCanvas,
    ),
  { ssr: false, loading: () => <SimPlaceholder /> },
);

function SimPlaceholder() {
  return (
    <div className="flex h-[min(62vh,640px)] min-h-[380px] w-full items-center justify-center rounded-2xl border border-white/10 bg-surface/50 text-sm text-muted">
      …
    </div>
  );
}

function SimForPillar({ pillar }: { pillar: PillarSlug }) {
  switch (pillar) {
    case "ai":
      return <AiNeuralCanvas />;
    case "cyber":
      return <CyberRadarCanvas />;
    case "software":
      return <SoftwareMeshCanvas />;
    case "infra":
      return <InfraTrafficCanvas />;
    default:
      return null;
  }
}

export function PillarSimPage({ pillar }: { pillar: PillarSlug }) {
  const t = useTranslations("SolutionPillarSim");
  const reduced = useReducedMotion();

  return (
    <>
      <section className="relative border-b border-white/10 pt-8 pb-10 md:pt-10">
        <Container>
          <Link
            href="/solutions"
            className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-bright"
          >
            <span aria-hidden>←</span> {t("common.back")}
          </Link>
          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 font-[family-name:var(--font-cairo)] text-3xl font-bold md:text-4xl"
          >
            {t(`${pillar}.title`)}
          </motion.h1>
          <p className="mt-3 max-w-3xl text-muted md:text-lg">
            {t(`${pillar}.subtitle`)}
          </p>
        </Container>
      </section>

      <section className="py-6 md:py-8">
        <Container>
          <div className="relative">
            <SimForPillar pillar={pillar} />
            <div className="pointer-events-none absolute bottom-4 start-4 end-4 flex flex-wrap gap-2 md:bottom-6 md:start-6 md:end-auto">
              {(["kpi1", "kpi2", "kpi3"] as const).map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-white/15 bg-bg/80 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted backdrop-blur-md md:text-xs"
                >
                  {t(`${pillar}.${k}`)}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-surface/45 px-4 py-4 md:mt-6 md:px-5 md:py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold/85">
              {t("common.explainerLabel")}
            </p>
            <p className="mt-2.5 text-sm leading-relaxed text-foreground/90 md:text-base">
              {t(`${pillar}.simpleExplainer`)}
            </p>
          </div>
          <p className="mt-4 text-center text-xs text-muted/90 md:text-sm">
            {t("common.disclaimer")}
          </p>
        </Container>
      </section>

      <section className="border-t border-white/10 bg-surface/30 py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-base leading-relaxed text-muted md:text-lg">
              {t(`${pillar}.body`)}
            </p>
            <TrackedLink
              href="/contact?intent=consult"
              eventName="pillar_sim_cta"
              eventParams={{ pillar }}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-gold px-8 py-3 text-sm font-semibold text-bg hover:bg-gold-bright"
            >
              {t("common.cta")}
            </TrackedLink>
          </div>
        </Container>
      </section>
    </>
  );
}
