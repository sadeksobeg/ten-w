"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { IconYoutube, IconInstagram, IconTiktok, IconXPlatform } from "@/components/growth/icons/GrowthIcons";
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
  { key: "x", Icon: IconXPlatform },
] as const;

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
    <div className="space-y-4">
      <GlassCard className="creator-card creator-glow-rose bg-gradient-to-br from-[var(--creator-primary)]/15 to-transparent p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-300/80">{t("active")}</p>
        <h2 className="mt-2 font-[family-name:var(--font-cairo)] text-xl font-extrabold text-white">{challenge.title}</h2>
        <p className="mt-2 text-sm text-white/65">{challenge.body}</p>
        <p className="mt-3 text-sm font-bold text-[var(--creator-secondary)]">
          {countdown ? t("deadline", { time: countdown }) : t("ended")}
        </p>
        <p className="mt-1 text-xs text-white/50">+{challenge.xpReward} XP</p>
      </GlassCard>

      {challenge.hasSubmitted ? (
        <GlassCard className="creator-card border-emerald-500/30 bg-emerald-500/10 p-5">
          <p className="font-bold text-emerald-100">{t("submitted")}</p>
          {challenge.submissionUrl ? (
            <a href={challenge.submissionUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block truncate text-xs text-[var(--creator-secondary)] underline">
              {challenge.submissionUrl}
            </a>
          ) : null}
          <p className="mt-2 text-xs text-white/55">{challenge.submissionStatus}</p>
        </GlassCard>
      ) : (
        <GlassCard className="creator-card p-5">
          <p className="text-sm font-bold text-white">{t("submit")}</p>
          {step === 1 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {PLATFORMS.map(({ key, Icon }) => (
                <button key={key} type="button" onClick={() => { setPlatform(key); setStep(2); }} className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${platform === key ? "bg-[var(--creator-primary)] text-white" : "border border-white/15 text-white/60"}`}>
                  <Icon size={14} />
                  {t(`platform.${key}`)}
                </button>
              ))}
            </div>
          ) : null}
          {step >= 2 ? (
            <form action={formAction} className="mt-4 space-y-3">
              <input type="hidden" name="platform" value={platform} />
              <label className="block text-xs text-white/60">
                {t("urlLabel")}
                <input name="postUrl" type="url" required placeholder="https://" className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" />
              </label>
              <label className="block text-xs text-white/60">
                {t("descLabel")}
                <textarea name="description" maxLength={100} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
              </label>
              {state && !state.ok ? <p className="text-xs text-rose-300">{t("error")}</p> : null}
              <GoldButton type="submit" disabled={pending}>{t("submitBtn")}</GoldButton>
            </form>
          ) : null}
        </GlassCard>
      )}

      <GlassCard className="creator-card p-5">
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">{t("weekList")}</h3>
        <ul className="mt-3 space-y-2">
          {weekSubmissions.map((s) => (
            <li key={s.id} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${s.userId === myUserId ? "border-[var(--creator-primary)]/40 bg-[var(--creator-primary)]/10" : "border-white/10"}`}>
              <span className="text-sm font-semibold text-white">{s.name}</span>
              <span className="text-[10px] text-white/45">{s.platform ?? "—"} · {s.adminRating ? "★".repeat(s.adminRating) : "—"}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
