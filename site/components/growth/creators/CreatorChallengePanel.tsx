"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { submitCreatorChallengeAction } from "@/lib/growth/creator-arena-actions";
import type { CreatorChallengeView } from "@/lib/growth/creator-arena";

type Props = {
  challenge: CreatorChallengeView;
};

export function CreatorChallengePanel({ challenge }: Props) {
  const t = useTranslations("Growth.creators");
  const [state, formAction, pending] = useActionState(submitCreatorChallengeAction, undefined);

  return (
    <GlassCard className="border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-transparent to-gold/5 p-5 sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-300/80">
        {t("challengeEyebrow")}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
        {challenge.title}
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-white/65">{challenge.body}</p>
      <p className="mt-2 text-[11px] text-gold/90">
        {t("challengeReward", { xp: challenge.xpReward })}
      </p>

      {challenge.hasSubmitted ? (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <p className="text-xs font-semibold text-emerald-100">
            {challenge.submissionStatus?.toLowerCase() === "approved"
              ? t("challengeApproved")
              : challenge.submissionStatus?.toLowerCase() === "rejected"
                ? t("challengeRejected")
                : t("challengeSubmitted")}
          </p>
          {challenge.submissionUrl ? (
            <a
              href={challenge.submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block truncate text-[11px] text-gold underline"
            >
              {challenge.submissionUrl}
            </a>
          ) : null}
        </div>
      ) : (
        <form action={formAction} className="mt-4 space-y-3">
          <label className="block text-xs text-white/60">
            {t("challengeUrlLabel")}
            <input
              name="postUrl"
              type="url"
              required
              placeholder="https://"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40"
            />
          </label>
          {state && !state.ok ? (
            <p className="text-xs text-rose-300">{t("challengeError")}</p>
          ) : null}
          <GoldButton type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? t("challengeSubmitting") : t("challengeSubmit")}
          </GoldButton>
        </form>
      )}
    </GlassCard>
  );
}
