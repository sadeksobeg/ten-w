"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CreatorWorkflowStatus } from "@prisma/client";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import type { CreatorPulseStats, CreatorStatusCard } from "@/lib/growth/creator-arena";

type ActivityKind = "joined" | "submitted" | "filming" | "featured" | "battle";

type FeedItem = {
  id: string;
  kind: ActivityKind;
  name: string;
  at: number;
};

type Props = {
  pulse: CreatorPulseStats;
  statusCards: CreatorStatusCard[];
  className?: string;
};

function randomIntervalMs(): number {
  return 8000 + Math.floor(Math.random() * 4000);
}

function pickKind(status: CreatorStatusCard["status"]): ActivityKind {
  if (status === "FEATURED") return "featured";
  if (status === "SUBMITTED") return "submitted";
  if (status === "FILMING") return "filming";
  if (status === "JOINED") return "joined";
  return "battle";
}

export function CreatorLoungeActivityPanel({ pulse, statusCards, className = "" }: Props) {
  const t = useTranslations("Growth.creators.lounge");
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const indexRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const names = useMemo((): CreatorStatusCard[] => {
    if (statusCards.length > 0) return statusCards;
    return [
      {
        userId: "demo",
        name: "Creator",
        avatarUrl: null,
        publicSlug: null,
        status: CreatorWorkflowStatus.JOINED,
      },
    ];
  }, [statusCards]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (names.length === 0) return;

    const seed: FeedItem[] = names.slice(0, 3).map((card, i) => ({
      id: `seed-${i}`,
      kind: pickKind(card.status),
      name: card.name,
      at: Date.now() - (3 - i) * 60000,
    }));
    setFeed(seed);
    indexRef.current = 3 % names.length;

    if (reducedMotionRef.current) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        if (reducedMotionRef.current) return;
        const card = names[indexRef.current % names.length]!;
        indexRef.current += 1;
        const item: FeedItem = {
          id: `${Date.now()}-${indexRef.current}`,
          kind: pickKind(card.status),
          name: card.name,
          at: Date.now(),
        };
        setFeed((prev) => [item, ...prev].slice(0, 8));
        scheduleNext();
      }, randomIntervalMs());
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [names]);

  return (
    <aside className={`space-y-4 ${className}`}>
      <GlassCard className="border border-white/10 bg-white/[0.03] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/80">
          {t("activityTitle")}
        </p>
        <p className="mt-2 text-2xl font-black text-white">
          {t("activityOnline", { count: pulse.onlineMembers })}
        </p>

        <div className="mt-4 flex -space-x-2 rtl:space-x-reverse">
          {statusCards.slice(0, 6).map((card) => (
            <GrowthAvatar
              key={card.userId}
              name={card.name}
              email={card.userId}
              avatarUrl={card.avatarUrl}
              size="sm"
              className="ring-2 ring-[#0a0612]"
            />
          ))}
          {statusCards.length > 6 ? (
            <span className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[10px] font-bold text-white/60">
              +{statusCards.length - 6}
            </span>
          ) : null}
        </div>
      </GlassCard>

      <GlassCard className="border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-semibold text-white/70">{t("weekStats")}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-center">
            <p className="text-lg font-black text-white">{pulse.postsThisWeek}</p>
            <p className="text-[9px] uppercase tracking-wide text-white/45">{t("postsStat")}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-center">
            <p className="text-lg font-black text-white">{pulse.activeChallenges}</p>
            <p className="text-[9px] uppercase tracking-wide text-white/45">{t("missionStat")}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="border border-white/10 bg-white/[0.03] p-4">
        <ul className="space-y-2.5" aria-live="polite">
          {feed.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-white/8 bg-black/20 px-3 py-2 text-[11px] leading-relaxed text-white/65 motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none"
            >
              {t(`activityFeed.${item.kind}`, { name: item.name })}
            </li>
          ))}
        </ul>
      </GlassCard>
    </aside>
  );
}
