"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { ForCreatorsHero } from "./ForCreatorsHero";
import { ForCreatorsProof, type CreatorPreview } from "./ForCreatorsProof";
import { ForCreatorsDemoMockup } from "./ForCreatorsDemoMockup";
import { ForCreatorsReviewBubble } from "./ForCreatorsReviewBubble";
import { ForCreatorsApplyWizard } from "./ForCreatorsApplyWizard";
import type { CreatorPlatformReviewRow } from "@/lib/growth/creator-platform-reviews";

const FEATURE_KEYS = ["hub", "chat", "challenge", "cup", "kit", "earn"] as const;
const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const;

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
      <ForCreatorsHero />
      <ForCreatorsProof topCreators={topCreators} creatorCount={creatorCount} approvalRate={approvalRate} />
      <ForCreatorsDemoMockup locale={locale} />

      <section className="mx-auto max-w-5xl px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl"
        >
          {t("featuresTitle")}
        </motion.h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_KEYS.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="creator-card fc-feature-card p-5"
            >
              <h3 className="font-[family-name:var(--font-cairo)] font-bold text-[var(--creator-secondary)]">
                {t(`features.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{t(`features.${key}.body`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("howTitle")}</h2>
        <ol className="mt-10 space-y-8">
          {["step1", "step2", "step3", "step4"].map((key, i) => (
            <li key={key} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--creator-secondary)]/40 font-black text-[var(--creator-secondary)]">
                {i + 1}
              </span>
              <div>
                <h3 className="font-bold">{t(`${key}.title`)}</h3>
                <p className="mt-1 text-sm text-white/60">{t(`${key}.body`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-16">
        <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("faqTitle")}</h2>
        <ul className="mt-8 space-y-3">
          {FAQ_KEYS.map((key) => (
            <li key={key} className="creator-card overflow-hidden">
              <details className="group">
                <summary className="cursor-pointer list-none px-5 py-4 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                  {t(`faq.${key}`)}
                </summary>
                <p className="border-t border-white/10 px-5 py-3 text-sm text-white/60">{t(`faq.a${key.slice(1)}`)}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="font-[family-name:var(--font-cairo)] text-3xl font-extrabold">{t("finalCta.title")}</h2>
        <p className="mx-auto mt-3 max-w-md text-white/60">{t("finalCta.body")}</p>
        <a href="#apply" className="mt-6 inline-block">
          <GoldButton type="button">{t("finalCta.cta")}</GoldButton>
        </a>
      </section>

      <ForCreatorsApplyWizard locale={locale} />

      <ForCreatorsReviewBubble reviews={platformReviews} />

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        <Link href={`/${locale}/growth/sign-in`} className="text-[var(--creator-secondary)] hover:underline">
          ASCEND
        </Link>
      </footer>
    </div>
  );
}
