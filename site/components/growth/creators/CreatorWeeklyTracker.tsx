"use client";

import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { IconEvents, IconTrophy } from "@/components/growth/icons/GrowthIcons";
import type { CreatorChallengeView } from "@/lib/growth/creator-arena";

type Props = {
  challenge: CreatorChallengeView | null;
  viewerRank?: number | null;
  onGoChallenge?: () => void;
};

function submissionState(challenge: CreatorChallengeView | null): "none" | "pending" | "approved" | "rejected" {
  if (!challenge?.hasSubmitted) return "none";
  const status = (challenge.submissionStatus ?? "pending").toLowerCase();
  if (status === "approved" || status === "featured") return "approved";
  if (status === "rejected") return "rejected";
  return "pending";
}

export function CreatorWeeklyTracker({ challenge, viewerRank, onGoChallenge }: Props) {
  const t = useTranslations("Growth.creators.lounge.tracker");
  const state = submissionState(challenge);

  const statusStyles = {
    none: "border-amber-500/35 bg-amber-500/10 text-amber-100",
    pending: "border-sky-500/35 bg-sky-500/10 text-sky-100",
    approved: "border-emerald-500/35 bg-emerald-500/10 text-emerald-100",
    rejected: "border-rose-500/35 bg-rose-500/10 text-rose-100",
  } as const;

  return (
    <GlassCard className="relative overflow-hidden border border-gold/25 bg-gradient-to-br from-gold/12 via-transparent to-purple-500/10 p-4 sm:p-5">
      <div
        className="pointer-events-none absolute -top-10 end-0 h-32 w-32 rounded-full bg-gold/15 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold">
              <IconEvents size={12} />
              {t("eyebrow")}
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[state]}`}>
              {t(`status.${state}`)}
            </span>
          </div>

          <h2 className="mt-3 font-[family-name:var(--font-cairo)] text-base font-extrabold leading-snug text-white sm:text-lg">
            {challenge?.title ?? t("noChallenge")}
          </h2>

          {challenge?.hasSubmitted && challenge.submissionUrl ? (
            <a
              href={challenge.submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block truncate text-xs text-gold underline-offset-4 hover:underline"
            >
              {challenge.submissionUrl}
            </a>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-white/55">{t("hint")}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end">
          {viewerRank && viewerRank > 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
              <IconTrophy size={16} className="text-gold" />
              <div className="text-end">
                <p className="text-[9px] font-bold uppercase tracking-wide text-white/45">{t("yourRank")}</p>
                <p className="font-[family-name:var(--font-cairo)] text-xl font-black text-white">#{viewerRank}</p>
              </div>
            </div>
          ) : null}

          {state === "none" && onGoChallenge ? (
            <GoldButton type="button" className="w-full text-xs sm:w-auto" onClick={onGoChallenge}>
              {t("cta")}
            </GoldButton>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}
