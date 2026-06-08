"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { useToast } from "@/hooks/useToast";
import { adminCloseCreatorCupSeasonAction } from "@/lib/growth/creator-arena-actions";
import type { CreatorCupRow } from "./creator-admin-types";

type Props = {
  leaderboard: CreatorCupRow[];
};

export function AdminCreatorCupManager({ leaderboard }: Props) {
  const t = useTranslations("Growth.creators.admin.cup");
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gold">{t("title")}</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/50">{t("subtitle")}</p>
        </div>
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

      <GlassCard className="overflow-hidden border border-white/10 p-0">
        {leaderboard.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-white/45">{t("empty")}</p>
        ) : (
          <div className="growth-table-scroll">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-wide text-white/45">
                  <th className="px-4 py-3 text-start font-bold">{t("colRank")}</th>
                  <th className="px-4 py-3 text-start font-bold">{t("colCreator")}</th>
                  <th className="px-4 py-3 text-end font-bold">{t("colScore")}</th>
                  <th className="px-4 py-3 text-end font-bold">{t("colPosts")}</th>
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
                      {row.name ?? t("anonymous")}
                    </td>
                    <td className="px-4 py-3 text-end font-bold text-white">{row.score}</td>
                    <td className="px-4 py-3 text-end text-white/55">{row.submissions}</td>
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
