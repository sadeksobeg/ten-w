"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { CreatorChallengePanel } from "@/components/growth/creators/CreatorChallengePanel";
import { CreatorCupPanel } from "@/components/growth/creators/CreatorCupPanel";
import type { CreatorChallengeView, CreatorCupRow } from "@/lib/growth/creator-arena";

type Platform = "reels" | "tiktok" | "shorts" | "other";

const PLATFORMS: Platform[] = ["reels", "tiktok", "shorts", "other"];

type Props = {
  challenge: CreatorChallengeView | null;
  cupPreview: CreatorCupRow[];
  myUserId: string;
};

function formatCountdown(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 48) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${mins}m`;
}

export function CreatorLoungeChallenge({ challenge, cupPreview, myUserId }: Props) {
  const t = useTranslations("Growth.creators.lounge");
  const [countdown, setCountdown] = useState("");
  const [platform, setPlatform] = useState<Platform>("reels");

  useEffect(() => {
    if (!challenge) return;
    const tick = () => setCountdown(formatCountdown(challenge.endsAt));
    tick();
    const id = window.setInterval(tick, 60000);
    return () => window.clearInterval(id);
  }, [challenge]);

  if (!challenge) {
    return (
      <GlassCard className="border border-white/10 p-6 text-center">
        <p className="text-sm text-white/50">{t("challengeEmpty")}</p>
      </GlassCard>
    );
  }

  const ended = countdown === "";

  return (
    <div className="space-y-4">
      <GlassCard className="border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-transparent p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-300/80">
          {t("challengeHero")}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-cairo)] text-xl font-extrabold text-white">
          {challenge.title}
        </h2>
        <p className="mt-2 text-xs text-white/60">
          {ended ? t("challengeEnded") : t("challengeCountdown", { time: countdown })}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition ${
                platform === p
                  ? "bg-gold text-black"
                  : "border border-white/15 text-white/60 hover:border-gold/40"
              }`}
            >
              {t(`platforms.${p}`)}
            </button>
          ))}
        </div>
      </GlassCard>

      <CreatorChallengePanel challenge={challenge} />

      {cupPreview.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold text-white/55">{t("leaderboardPreview")}</p>
          <CreatorCupPanel rows={cupPreview.slice(0, 5)} myUserId={myUserId} />
        </div>
      ) : null}
    </div>
  );
}
