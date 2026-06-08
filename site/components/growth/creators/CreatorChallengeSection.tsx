"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import {
  IconYoutube,
  IconInstagram,
  IconTiktok,
  IconXPlatform,
  IconFacebook,
  IconBack,
} from "@/components/growth/icons/GrowthIcons";
import { submitCreatorChallengeAction } from "@/lib/growth/creator-arena-actions";
import type { CreatorChallengeView } from "@/lib/growth/creator-arena";

type WeekSub = {
  id: string;
  userId: string;
  name: string;
  postUrl: string;
  platform: string | null;
  adminRating: number | null;
  status: string;
  createdAt: string;
};

type Props = {
  challenge: CreatorChallengeView | null;
  weekSubmissions: WeekSub[];
  myUserId: string;
};

const PLATFORMS = [
  { key: "youtube", Icon: IconYoutube },
  { key: "instagram", Icon: IconInstagram },
  { key: "tiktok", Icon: IconTiktok },
  { key: "facebook", Icon: IconFacebook },
  { key: "x", Icon: IconXPlatform },
] as const;

const PLATFORM_KEYS = new Set(PLATFORMS.map((p) => p.key));

function platformLabel(t: (key: string) => string, key: string | null): string {
  if (!key) return "—";
  if (PLATFORM_KEYS.has(key as (typeof PLATFORMS)[number]["key"])) {
    return t(`platform.${key as (typeof PLATFORMS)[number]["key"]}`);
  }
  return key;
}

function formatCountdown(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${d}d ${h}h ${m}m`;
}

export function CreatorChallengeSection({ challenge, weekSubmissions, myUserId }: Props) {
  const t = useTranslations("Creators.challenge");
  const [platform, setPlatform] = useState("youtube");
  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState("");
  const [state, formAction, pending] = useActionState(submitCreatorChallengeAction, undefined);

  useEffect(() => {
    if (!challenge) return;
    const tick = () => setCountdown(formatCountdown(challenge.endsAt));
    tick();
    const id = window.setInterval(tick, 60000);
    return () => window.clearInterval(id);
  }, [challenge]);

  if (!challenge) {
    return <GlassCard className="creator-card p-8 text-center text-sm text-white/50">{t("empty")}</GlassCard>;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <GlassCard className="creator-card creator-glow-rose bg-gradient-to-br from-[var(--creator-primary)]/15 to-transparent p-4 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-300/80">{t("active")}</p>
        <h2 className="mt-2 font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white sm:text-xl">{challenge.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/65">{challenge.body}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm font-bold text-[var(--creator-secondary)]">
            {countdown ? t("deadline", { time: countdown }) : t("ended")}
          </p>
          <span className="rounded-full bg-[var(--creator-secondary)]/15 px-2.5 py-0.5 text-xs font-bold text-[var(--creator-secondary)]">
            +{challenge.xpReward} XP
          </span>
        </div>
      </GlassCard>

      {challenge.hasSubmitted ? (
        <GlassCard className="creator-card border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5">
          <p className="font-bold text-emerald-100">{t("submitted")}</p>
          {challenge.submissionUrl ? (
            <a href={challenge.submissionUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block truncate text-sm text-[var(--creator-secondary)] underline">
              {challenge.submissionUrl}
            </a>
          ) : null}
          <p className="mt-2 text-xs text-white/55">{challenge.submissionStatus}</p>
        </GlassCard>
      ) : (
        <GlassCard className="creator-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-white">{t("submit")}</p>
            <div className="creator-step-dots" aria-hidden>
              <span className={`creator-step-dot ${step === 1 ? "is-active" : ""}`} />
              <span className={`creator-step-dot ${step === 2 ? "is-active" : ""}`} />
            </div>
          </div>

          {step === 1 ? (
            <>
              <p className="mt-2 text-xs text-white/50">{t("pickPlatform")}</p>
              <div className="creator-platform-scroll mt-3 -mx-1 px-1">
                {PLATFORMS.map(({ key, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setPlatform(key);
                      setStep(2);
                    }}
                    className={`creator-platform-chip flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition active:scale-95 ${
                      platform === key
                        ? "bg-[var(--creator-primary)] text-white shadow-[0_0_16px_rgba(225,29,72,0.35)]"
                        : "border border-white/15 bg-white/[0.03] text-white/70"
                    }`}
                  >
                    <Icon size={16} />
                    {t(`platform.${key}`)}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {step >= 2 ? (
            <form action={formAction} className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex min-h-10 items-center gap-1.5 text-xs font-semibold text-[var(--creator-secondary)]"
              >
                <IconBack size={14} className="rtl:rotate-180" />
                {t("backPlatform")}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">{t(`platform.${platform}`)}</span>
              </button>
              <input type="hidden" name="platform" value={platform} />
              <label className="block text-xs text-white/60">
                {t("urlLabel")}
                <input
                  name="postUrl"
                  type="url"
                  required
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://"
                  className="creator-input-touch mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-base text-white"
                />
              </label>
              <label className="block text-xs text-white/60">
                {t("descLabel")}
                <textarea
                  name="description"
                  maxLength={100}
                  rows={3}
                  className="creator-input-touch mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-base text-white"
                />
              </label>
              {state && !state.ok ? <p className="text-xs text-rose-300">{t("error")}</p> : null}
              <div className="creator-sticky-submit">
                <GoldButton type="submit" disabled={pending} className="w-full min-h-12 text-sm">
                  {pending ? t("sending") : t("submitBtn")}
                </GoldButton>
              </div>
            </form>
          ) : null}
        </GlassCard>
      )}

      <GlassCard className="creator-card p-4 sm:p-5">
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">{t("weekList")}</h3>
        <ul className="mt-3 space-y-2">
          {weekSubmissions.length === 0 ? (
            <li className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-white/45">{t("weekEmpty")}</li>
          ) : (
            weekSubmissions.map((s) => (
              <li
                key={s.id}
                className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
                  s.userId === myUserId ? "border-[var(--creator-primary)]/40 bg-[var(--creator-primary)]/10" : "border-white/10"
                }`}
              >
                <span className="truncate text-sm font-semibold text-white">{s.name}</span>
                <span className="shrink-0 text-[10px] text-white/45">
                  {platformLabel(t, s.platform)} · {s.adminRating ? "★".repeat(s.adminRating) : "—"}
                </span>
              </li>
            ))
          )}
        </ul>
      </GlassCard>
    </div>
  );
}
