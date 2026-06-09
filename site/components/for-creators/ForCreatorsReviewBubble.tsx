"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { localizePlatformReview, isAnonymousPlatformReview, type CreatorPlatformReviewRow } from "@/lib/growth/creator-platform-reviews";

const STORAGE_KEY = "tenegta_fc_reviews_v1";

type Props = {
  reviews: CreatorPlatformReviewRow[];
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`text-sm ${n <= rating ? "text-amber-400 fc-star-pop" : "text-white/15"}`}
          style={{ animationDelay: `${n * 0.08}s` }}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function ForCreatorsReviewBubble({ reviews }: Props) {
  const t = useTranslations("Creators.public.reviewBubble");
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reviews.length === 0) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* private mode */
    }
    const timer = window.setTimeout(() => setVisible(true), 2200);
    return () => window.clearTimeout(timer);
  }, [reviews.length]);

  useEffect(() => {
    if (!visible || reviews.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % reviews.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [visible, reviews.length]);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (reviews.length === 0) return null;

  const review = reviews[index % reviews.length]!;
  const localized = localizePlatformReview(review, locale);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fc-review-bubble fixed inset-x-4 bottom-6 z-[100] mx-auto max-w-md sm:inset-x-auto sm:end-6 sm:bottom-8 sm:mx-0"
          role="dialog"
          aria-labelledby="fc-review-title"
          aria-live="polite"
        >
          <div className="fc-review-bubble__glow" aria-hidden />
          <div className="fc-review-bubble__card relative overflow-hidden rounded-2xl border border-white/12 bg-[#0c0618]/95 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
            <div className="fc-review-shimmer pointer-events-none absolute inset-0 opacity-30" aria-hidden />
            <div className="relative flex items-start gap-3">
              <div className="fc-review-avatar flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--creator-secondary)]/40 to-rose-500/30 text-sm font-black text-white">
                {isAnonymousPlatformReview(review.id) ? "✦" : localized.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p id="fc-review-title" className="font-[family-name:var(--font-cairo)] text-sm font-extrabold text-white">
                  {localized.name}
                </p>
                {localized.role ? (
                  <p className="mt-0.5 text-[10px] text-white/45">{localized.role}</p>
                ) : null}
                <div className="mt-2">
                  <Stars rating={review.rating} />
                </div>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="shrink-0 rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
                aria-label={t("close")}
              >
                ✕
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={review.id}
                initial={{ opacity: 0, x: locale === "ar" ? 12 : -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: locale === "ar" ? -12 : 12 }}
                transition={{ duration: 0.35 }}
                className="relative mt-3 border-s-2 border-[var(--creator-secondary)]/50 ps-3 text-sm leading-relaxed text-white/75"
              >
                «{localized.quote}»
              </motion.blockquote>
            </AnimatePresence>
            <div className="relative mt-4 flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--creator-secondary)]/70">
                {t("label")}
              </p>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full bg-gradient-to-r from-[var(--creator-secondary)] to-amber-300 px-4 py-1.5 text-xs font-bold text-black transition active:scale-95"
              >
                {t("cta")}
              </button>
            </div>
            {reviews.length > 1 ? (
              <div className="relative mt-3 flex justify-center gap-1.5">
                {reviews.map((r, i) => (
                  <span
                    key={r.id}
                    className={`size-1.5 rounded-full transition ${i === index % reviews.length ? "bg-[var(--creator-secondary)]" : "bg-white/20"}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
