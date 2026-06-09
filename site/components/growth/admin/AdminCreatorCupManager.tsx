"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { useToast } from "@/hooks/useToast";
import { CreatorNameWithConsentBadge } from "@/components/growth/creators/CreatorConsentVerifiedBadge";
import {
  adminCloseCreatorCupSeasonAction,
  adminResetCreatorCupBonusesAction,
  adminSetCreatorCupBonusAction,
} from "@/lib/growth/creator-arena-actions";
import type { CreatorCupRow } from "./creator-admin-types";

type Props = {
  leaderboard: CreatorCupRow[];
};

export function AdminCreatorCupManager({ leaderboard }: Props) {
  const t = useTranslations("Growth.creators.admin.cup");
  const tConsent = useTranslations("Creators.consent");
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [bonusDraft, setBonusDraft] = useState<Record<string, string>>({});

  function closeSeason() {
    if (!window.confirm(t("closeConfirm"))) return;
    startTransition(async () => {
      const res = await adminCloseCreatorCupSeasonAction();
      if (res.ok) {
        showToast({ type: "success", title: t("toastClosed") });
      } else {
        showToast({ type: "error", title: t("toastError") });
      }
    });
  }

  function resetBonuses() {
    if (!window.confirm(t("resetConfirm"))) return;
    startTransition(async () => {
      const res = await adminResetCreatorCupBonusesAction();
      if (res.ok) {
        setBonusDraft({});
        showToast({ type: "success", title: t("toastReset") });
      } else {
        showToast({ type: "error", title: t("toastError") });
      }
    });
  }

  function saveBonus(userId: string) {
    const raw = bonusDraft[userId] ?? "0";
    const bonus = Number(raw);
    if (!Number.isFinite(bonus)) {
      showToast({ type: "error", title: t("toastError") });
      return;
    }
    startTransition(async () => {
      const res = await adminSetCreatorCupBonusAction(userId, bonus);
      if (res.ok) {
        showToast({ type: "success", title: t("toastBonusSaved") });
      } else {
        showToast({ type: "error", title: t("toastError") });
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gold">{t("title")}</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/50">{t("subtitle")}</p>
          <p className="mt-2 text-[11px] text-amber-200/70">{t("bonusHint")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <GoldButton
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={resetBonuses}
            className="!px-4 !py-2 text-xs"
          >
            {t("resetBonuses")}
          </GoldButton>
          <GoldButton
            type="button"
            variant="danger"
            disabled={pending || leaderboard.length === 0}
            onClick={closeSeason}
            className="!px-4 !py-2 text-xs"
          >
            {pending ? "…" : t("closeSeason")}
          </GoldButton>
        </div>
      </div>

      <GlassCard className="overflow-hidden border border-white/10 p-0">
        {leaderboard.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-white/45">{t("empty")}</p>
        ) : (
          <div className="growth-table-scroll">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-wide text-white/45">
                  <th className="px-4 py-3 text-start font-bold">{t("colRank")}</th>
                  <th className="px-4 py-3 text-start font-bold">{t("colCreator")}</th>
                  <th className="px-4 py-3 text-end font-bold">{t("colScore")}</th>
                  <th className="px-4 py-3 text-end font-bold">{t("colPosts")}</th>
                  <th className="px-4 py-3 text-end font-bold">{t("colBonus")}</th>
                  <th className="px-4 py-3 text-end font-bold">{t("colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr
                    key={row.userId}
                    className="border-b border-white/5 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-black text-gold">#{row.rank}</td>
                    <td className="px-4 py-3 font-semibold text-white">
                      <CreatorNameWithConsentBadge
                        name={row.name ?? t("anonymous")}
                        verified={row.consentGiven}
                        label={tConsent("verifiedBadge")}
                        nameClassName="font-semibold text-white"
                      />
                    </td>
                    <td className="px-4 py-3 text-end font-bold text-white">{row.score}</td>
                    <td className="px-4 py-3 text-end text-white/55">{row.submissions}</td>
                    <td className="px-4 py-3 text-end">
                      <input
                        type="number"
                        min={-500}
                        max={500}
                        step={5}
                        value={bonusDraft[row.userId] ?? String(row.cupScoreBonus ?? 0)}
                        onChange={(e) =>
                          setBonusDraft((prev) => ({ ...prev, [row.userId]: e.target.value }))
                        }
                        className="w-20 rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-end text-xs text-white outline-none focus:border-gold/40"
                        aria-label={t("colBonus")}
                      />
                    </td>
                    <td className="px-4 py-3 text-end">
                      <GoldButton
                        type="button"
                        className="!px-3 !py-1.5 text-[10px]"
                        disabled={pending}
                        onClick={() => saveBonus(row.userId)}
                      >
                        {t("saveBonus")}
                      </GoldButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <p className="text-[10px] text-white/35">{t("closeHint")}</p>
    </div>
  );
}
