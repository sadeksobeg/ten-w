"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { localizePlatformReview, type CreatorPlatformReviewRow } from "@/lib/growth/creator-platform-reviews";

type Props = {
  reviews: CreatorPlatformReviewRow[];
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`text-sm ${n <= rating ? "text-amber-400" : "text-white/15"}`}>
          ★
        </span>
      ))}
    </div>
  );
}

export function ForCreatorsTestimonials({ reviews }: Props) {
  const t = useTranslations("Creators.public");
  const locale = useLocale();

  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-16" aria-labelledby="fc-testimonials-title">
      <motion.h2
        id="fc-testimonials-title"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl"
      >
        {t("proofTitle")}
      </motion.h2>
      <p className="mx-auto mt-3 max-w-lg text-center text-sm text-white/50">{t("proofSubtitle")}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.slice(0, 6).map((review, i) => {
          const localized = localizePlatformReview(review, locale);
          const featured = i === 0;
          return (
            <motion.article
              key={review.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`creator-card fc-feature-card flex flex-col p-5 ${featured ? "fc-testimonial-featured sm:col-span-2 lg:col-span-1" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--creator-secondary)]/40 to-rose-500/30 text-sm font-black text-white"
                  aria-hidden
                >
                  ✦
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-[family-name:var(--font-cairo)] text-sm font-extrabold text-white">
                    {localized.name}
                  </p>
                  {localized.role ? (
                    <p className="mt-0.5 text-[10px] text-white/45">{localized.role}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-3">
                <Stars rating={review.rating} />
              </div>
              <blockquote className="mt-3 flex-1 border-s-2 border-[var(--creator-secondary)]/40 ps-3 text-sm leading-relaxed text-white/70">
                «{localized.quote}»
              </blockquote>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
