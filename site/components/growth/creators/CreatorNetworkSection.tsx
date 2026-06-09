"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { createNominationAction } from "@/lib/growth/creator-arena-actions";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { CreatorProfileDrawer } from "./CreatorProfileDrawer";
import type { CreatorDirectoryEntry } from "@/lib/growth/creator-arena";
import type { CreatorFeaturedCreator } from "./CreatorFeaturedSpotlight";
import type { CreatorHubSection } from "./CreatorHubTypes";

type Props = {
  directory: CreatorDirectoryEntry[];
  myUserId: string;
  onNavigate: (s: CreatorHubSection) => void;
  onMessage?: (userId: string) => void;
};

type Filter = "all" | "featured" | "new";

export function CreatorNetworkSection({ directory, myUserId, onNavigate, onMessage }: Props) {
  const t = useTranslations("Creators.network");
  const tStatus = useTranslations("Creators.status");
  const [filter, setFilter] = useState<Filter>("all");
  const [drawer, setDrawer] = useState<CreatorFeaturedCreator | null>(null);
  const [nomineeId, setNomineeId] = useState(directory[0]?.userId ?? "");
  const [, nominateAction, nominatePending] = useActionState(createNominationAction, undefined);

  const filtered = directory.filter((c) => {
    if (filter === "featured") return c.status === "FEATURED";
    if (filter === "new") return c.submissions < 2;
    return true;
  });

  const top3 = [...directory].sort((a, b) => (a.cupRank ?? 99) - (b.cupRank ?? 99)).slice(0, 3);

  return (
    <div className="space-y-4">
      <GlassCard className="creator-card p-5">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">{t("heroes")}</h2>
        <div className="mt-4 flex items-end justify-center gap-4">
          {top3.map((c, i) => (
            <div key={c.userId} className="flex flex-col items-center" style={{ order: i === 0 ? 2 : i === 1 ? 1 : 3 }}>
              <GrowthAvatar name={c.name} email={c.userId} avatarUrl={c.avatarUrl} size={i === 0 ? "lg" : "md"} />
              <p className="mt-1 text-xs font-bold text-white">#{c.cupRank ?? "—"}</p>
              <p className="max-w-[80px] truncate text-[10px] text-white/55">{c.name}</p>
              <div className={`mt-1 w-12 rounded-t bg-[var(--creator-secondary)]/30 ${i === 0 ? "h-16" : i === 1 ? "h-12" : "h-8"}`} />
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex flex-wrap gap-2">
        {(["all", "featured", "new"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-[10px] font-bold ${filter === f ? "bg-[var(--creator-primary)] text-white" : "border border-white/15 text-white/60"}`}>
            {t(`filter.${f}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <GlassCard key={c.userId} className="creator-card group p-4">
            <div className="flex items-center gap-3">
              <GrowthAvatar name={c.name} email={c.userId} avatarUrl={c.avatarUrl} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-white">{c.name}</p>
                <p className="text-[10px] text-white/45">{tStatus(c.status.toLowerCase())} · #{c.cupRank ?? "—"}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
              {c.userId !== myUserId ? (
                <>
                  <GoldButton type="button" className="flex-1 text-[10px]" onClick={() => onNavigate("battles")}>{t("challenge")}</GoldButton>
                  <button type="button" className="flex-1 rounded-xl border border-white/15 py-2 text-[10px] font-bold text-white/75" onClick={() => onMessage?.(c.userId)}>{t("message")}</button>
                </>
              ) : null}
              <button type="button" className="flex-1 rounded-xl border border-white/15 py-2 text-[10px] font-bold text-white/75" onClick={() => setDrawer({
                userId: c.userId,
                name: c.name,
                avatarUrl: c.avatarUrl,
                publicSlug: c.publicSlug,
                featuredCount: 0,
                status: c.status,
              })}>{t("profile")}</button>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="creator-card p-5">
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">{t("nominateTitle")}</h3>
        <p className="mt-1 text-xs text-white/50">{t("nominateHint")}</p>
        <form action={nominateAction} className="mt-4 space-y-3">
          <select
            name="nomineeUserId"
            value={nomineeId}
            onChange={(e) => setNomineeId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          >
            {directory.filter((c) => c.userId !== myUserId).map((c) => (
              <option key={c.userId} value={c.userId}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            name="reason"
            placeholder={t("nominateReason")}
            maxLength={100}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          />
          <GoldButton type="submit" disabled={nominatePending || !nomineeId} className="text-xs">
            {t("nominateSubmit")}
          </GoldButton>
        </form>
      </GlassCard>

      <CreatorProfileDrawer creator={drawer} onClose={() => setDrawer(null)} onChallenge={() => { setDrawer(null); onNavigate("battles"); }} />
    </div>
  );
}
