"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { ForCreatorsCinematicHero } from "./ForCreatorsCinematicHero";
import { ForCreatorsProof, type CreatorPreview } from "./ForCreatorsProof";
import { CreatorCinemaStage } from "./CreatorCinemaStage";
import { ForCreatorsHubBento } from "./ForCreatorsHubBento";
import { ForCreatorsJourney } from "./ForCreatorsJourney";
import { ForCreatorsTestimonials } from "./ForCreatorsTestimonials";
import { ForCreatorsFaq } from "./ForCreatorsFaq";
import { ForCreatorsApplyWizard } from "./ForCreatorsApplyWizard";
import type { CreatorPlatformReviewRow } from "@/lib/growth/creator-platform-reviews";

type Props = {
  locale: string;
  topCreators: CreatorPreview[];
  creatorCount: number;
  approvalRate: number;
  platformReviews: CreatorPlatformReviewRow[];
};

export function ForCreatorsLanding({ locale, topCreators, creatorCount, approvalRate, platformReviews }: Props) {
  const t = useTranslations("Creators.public");

  return (
    <div className="min-h-screen bg-[#03010A] text-white">
      <ForCreatorsCinematicHero />
      <ForCreatorsProof topCreators={topCreators} creatorCount={creatorCount} approvalRate={approvalRate} />
      <CreatorCinemaStage locale={locale} />
      <ForCreatorsHubBento />
      <ForCreatorsJourney />
      <ForCreatorsTestimonials reviews={platformReviews} />
      <ForCreatorsFaq />

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-[family-name:var(--font-cairo)] text-3xl font-extrabold"
        >
          {t("finalCta.title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto mt-3 max-w-md text-white/60"
        >
          {t("finalCta.body")}
        </motion.p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#apply">
            <GoldButton type="button" className="fc-cta-glow">{t("finalCta.cta")}</GoldButton>
          </a>
          <Link
            href="/growth/creators"
            className="rounded-full border border-[var(--creator-secondary)]/45 bg-[var(--creator-secondary)]/10 px-6 py-3 text-sm font-bold text-[var(--creator-secondary)] transition hover:bg-[var(--creator-secondary)]/20 hover:text-white"
          >
            {t("finalCta.creatorHub")} →
          </Link>
        </div>
      </section>

      <ForCreatorsApplyWizard locale={locale} />

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        <Link href="/growth/creators" className="text-[var(--creator-secondary)] hover:underline">
          Creator Hub
        </Link>
        <span className="mx-2">·</span>
        <Link href="/solutions/intelligent-systems" className="hover:text-white/60">
          {t("cinema.ctaSolutions")}
        </Link>
      </footer>
    </div>
  );
}
