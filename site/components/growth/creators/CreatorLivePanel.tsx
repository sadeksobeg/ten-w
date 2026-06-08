"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import type { CreatorDashboardMetrics, CreatorPulseStats, CreatorStatusCard } from "@/lib/growth/creator-arena";

type ActivityKind = "joined" | "submitted" | "filming" | "featured" | "battle";

type FeedItem = { id: string; kind: ActivityKind; name: string; at: number };

type Props = {
  pulse: CreatorPulseStats;
  statusCards: CreatorStatusCard[];
  metrics: CreatorDashboardMetrics;
  className?: string;
};

function pickKind(status: CreatorStatusCard["status"]): ActivityKind {
  if (status === "FEATURED") return "featured";
  if (status === "SUBMITTED") return "submitted";
  if (status === "FILMING") return "filming";
  return "joined";
}

export function CreatorLivePanel({ pulse, statusCards, metrics, className = "" }: Props) {
  const t = useTranslations("Creators.hub");
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const indexRef = useRef(0);

  const names = useMemo(
    () => (statusCards.length > 0 ? statusCards : [{ userId: "x", name: "Creator", avatarUrl: null, publicSlug: null, status: "JOINED" as const }]),
    [statusCards],
  );

  useEffect(() => {
    const seed = names.slice(0, 3).map((c, i) => ({
      id: `s-${i}`,
      kind: pickKind(c.status),
      name: c.name,
      at: Date.now() - (3 - i) * 60000,
    }));
    setFeed(seed);
    indexRef.current = 3;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    let tid: ReturnType<typeof setTimeout>;
    const tick = () => {
      const card = names[indexRef.current % names.length]!;
      indexRef.current += 1;
      setFeed((prev) => [
        { id: `${Date.now()}`, kind: pickKind(card.status), name: card.name, at: Date.now() },
        ...prev,
      ].slice(0, 8));
      tid = setTimeout(tick, 8000 + Math.random() * 4000);
    };
    tid = setTimeout(tick, 9000);
    return () => clearTimeout(tid);
  }, [names]);

  return (
    <aside className={`space-y-3 ${className}`}>
      <div className="creator-card p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--creator-secondary)]">
          {t("liveTitle")}
        </p>
        <p className="mt-2 text-2xl font-black text-white">
          {t("liveOnline", { count: pulse.onlineMembers })}
        </p>
        <div className="mt-3 flex -space-x-2 rtl:space-x-reverse">
          {statusCards.slice(0, 8).map((c) => (
            <GrowthAvatar key={c.userId} name={c.name} email={c.userId} avatarUrl={c.avatarUrl} size="sm" className="ring-2 ring-[var(--creator-surface)]" />
          ))}
        </div>
      </div>
      <div className="creator-card p-4">
        <p className="text-xs font-semibold text-white/70">{t("yourWeek")}</p>
        <dl className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
          <div><dt className="text-white/45">{t("posts")}</dt><dd className="text-lg font-black text-white">{metrics.weekSubmissions}</dd></div>
          <div><dt className="text-white/45">{t("points")}</dt><dd className="text-lg font-black text-[var(--creator-secondary)]">{metrics.cupScore}</dd></div>
          <div><dt className="text-white/45">{t("battles")}</dt><dd className="text-lg font-black text-white">{metrics.streakWeeks}</dd></div>
        </dl>
      </div>
      <div className="creator-card p-4">
        <ul className="space-y-2" aria-live="polite">
          {feed.map((item) => (
            <li key={item.id} className="text-[11px] text-white/65">
              {t(`activity.${item.kind}`, { name: item.name })}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
