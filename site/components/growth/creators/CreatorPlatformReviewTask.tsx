"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { submitCreatorPlatformReviewAction } from "@/lib/growth/creator-arena-actions";
import { CREATOR_PLATFORM_REVIEW_XP } from "@/lib/growth/creator-platform-review-task";

type Props = {
  pending: boolean;
};

export function CreatorPlatformReviewTask({ pending }: Props) {
  const t = useTranslations("Creators.profile.platformReviewTask");
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [state, formAction, submitting] = useActionState(submitCreatorPlatformReviewAction, undefined);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  if (!pending) return null;

  return (
    <GlassCard className="border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#0c0618] to-rose-500/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300/80">{t("badge")}</p>
          <h3 className="mt-1 font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">
            {t("title")}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-white/60">{t("subtitle")}</p>
        </div>
        <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1.5 text-xs font-black text-amber-200">
          +{CREATOR_PLATFORM_REVIEW_XP} XP
        </span>
      </div>

      <form action={formAction} className="mt-5 space-y-4">
        <div>
          <p className="text-xs font-semibold text-white/70">{t("ratingLabel")}</p>
          <div className="mt-2 flex gap-1" role="radiogroup" aria-label={t("ratingLabel")}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-2xl transition hover:scale-110 ${n <= rating ? "text-amber-400" : "text-white/20"}`}
                aria-label={`${n}/5`}
                aria-pressed={n <= rating}
              >
                ★
              </button>
            ))}
          </div>
          <input type="hidden" name="rating" value={rating} />
        </div>

        <label className="block text-xs text-white/60">
          {t("quoteLabel")}
          <textarea
            name="quote"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            placeholder={t("quotePlaceholder")}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30"
          />
        </label>

        {state && !state.ok ? (
          <p className="text-xs text-rose-300">
            {state.error === "CONSENT_REQUIRED"
              ? t("errors.consent_required")
              : state.error === "already_submitted"
                ? t("errors.already_submitted")
                : state.error === "invalid_input"
                  ? t("errors.invalid_input")
                  : t("errors.unknown")}
          </p>
        ) : null}
        {state?.ok ? (
          <p className="text-xs font-semibold text-emerald-300">{t("success", { xp: CREATOR_PLATFORM_REVIEW_XP })}</p>
        ) : null}

        <GoldButton type="submit" disabled={submitting || state?.ok} className="!px-5 !py-2.5 text-xs">
          {submitting ? t("submitting") : t("submit")}
        </GoldButton>
      </form>
    </GlassCard>
  );
};
