"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { DnaDimensions, DnaArchetype, DnaProfile } from "@/lib/growth/dna-score";
import { GlassCard } from "@/components/growth/ui/GlassCard";

type Props = {
  partnerName: string;
  referralCode: string;
  dna: DnaProfile;
};

const DIM_KEYS: (keyof DnaDimensions)[] = ["sales", "network", "content", "speed"];

const BAR_GRADIENT: Record<keyof DnaDimensions, string> = {
  sales: "linear-gradient(90deg, #B07D2B, #E4B84D)",
  network: "linear-gradient(90deg, #0284C7, #38BDF8)",
  content: "linear-gradient(90deg, #7C3AED, #A78BFA)",
  speed: "linear-gradient(90deg, #059669, #34D399)",
};

export function DnaCard({ partnerName, referralCode, dna }: Props) {
  const t = useTranslations("Growth.dna");
  const [mounted, setMounted] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  async function share() {
    const text = `${t("sharePrefix")}\n${t(`archetypes.${dna.archetype as DnaArchetype}`)} | ${t("sales")} ${dna.dimensions.sales} | ${t("network")} ${dna.dimensions.network}\n${t("shareJoin")} ${typeof window !== "undefined" ? window.location.origin : ""}/growth/register?ref=${referralCode}`;
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({ title: t("title"), text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      /* ignore */
    } finally {
      setSharing(false);
    }
  }

  return (
    <GlassCard variant="elevated" className="relative overflow-hidden p-5 sm:p-6">
      <div
        className="pointer-events-none absolute -end-8 -top-8 size-32 rounded-full bg-gold/10 blur-2xl"
        aria-hidden
      />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold/70">DNA</p>
          <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
            {partnerName}
          </h2>
        </div>
        <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
          {t("weekly_change")}
        </span>
      </div>

      <div className="relative mt-5 space-y-3">
        {DIM_KEYS.map((key) => {
          const value = dna.dimensions[key];
          const delta = dna.weeklyChange[key];
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-white/75">{t(key)}</span>
                <span className="flex items-center gap-2 tabular-nums text-white/90">
                  {delta !== undefined && delta !== 0 ? (
                    <span className={delta > 0 ? "text-emerald-400" : "text-rose-400"}>
                      {delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`}
                    </span>
                  ) : null}
                  {value}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full motion-reduce:!transition-none"
                  style={{
                    width: mounted ? `${value}%` : "0%",
                    background: BAR_GRADIENT[key],
                    transition: "width 1.2s ease-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <hr className="my-4 border-white/10" />
      <p className="text-sm text-white/80">
        {t("archetype")}:{" "}
        <span className="inline-flex rounded-full bg-gradient-to-r from-gold/30 to-gold-bright/20 px-2 py-0.5 font-bold text-gold animate-pulse motion-reduce:animate-none">
          «{t(`archetypes.${dna.archetype}`)}»
        </span>
      </p>
      <p className="mt-1 text-xs text-white/50">
        {t("rival_archetype")}: «{t(`archetypes.${dna.rivalArchetype}`)}»
      </p>

      <button
        type="button"
        onClick={() => void share()}
        disabled={sharing}
        className="mt-4 w-full rounded-xl border border-gold/35 bg-gold/10 py-2.5 text-xs font-bold text-gold hover:bg-gold/20"
      >
        {t("share")}
      </button>
    </GlassCard>
  );
}
