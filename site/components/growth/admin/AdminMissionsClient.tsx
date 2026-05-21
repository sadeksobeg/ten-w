"use client";

import { useTranslations } from "next-intl";
import {
  adminApproveMissionRewardAction,
  adminDeleteMissionAction,
  adminRejectMissionRewardAction,
  adminUpsertMissionFormAction,
} from "@/lib/growth/actions";
import type { PendingMissionRewardRow } from "@/lib/growth/mission-rewards";

export type MissionRow = {
  id: string;
  key: string;
  title: string;
  xpReward: number;
  sortOrder: number;
  chainGroup: string | null;
  active: boolean;
  criteria: unknown;
};

type Props = {
  missions: MissionRow[];
  pendingRewards: PendingMissionRewardRow[];
};

export function AdminMissionsClient({ missions, pendingRewards }: Props) {
  const t = useTranslations("Growth.admin.missionsPage");

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
        <h2 className="text-sm font-bold text-gold">{t("pendingTitle")}</h2>
        <p className="mt-1 text-xs text-white/55">{t("pendingHint")}</p>
        {pendingRewards.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">{t("pendingEmpty")}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pendingRewards.map((row) => (
              <li
                key={`${row.kind}-${row.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm"
              >
                <div>
                  <div className="font-semibold text-white">{row.label}</div>
                  <div className="mt-0.5 text-xs text-white/50">
                    {row.partnerName} · {row.partnerEmail} · {row.day}
                    {row.kind === "chain" ? ` · ${t("chainBadge")}` : ""}
                  </div>
                  <div className="mt-1 text-xs font-bold text-gold">+{row.xpAmount} XP</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={adminApproveMissionRewardAction}>
                    <input type="hidden" name="kind" value={row.kind} />
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600/25 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600/35"
                    >
                      {t("approve")}
                    </button>
                  </form>
                  <form action={adminRejectMissionRewardAction}>
                    <input type="hidden" name="kind" value={row.kind} />
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-rose-600/20 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-600/30"
                    >
                      {t("reject")}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={adminUpsertMissionFormAction} className="grid gap-3 rounded-2xl border border-white/10 p-4">
        <h2 className="text-sm font-bold text-gold">{t("add")}</h2>
        <input name="key" required placeholder="daily_close" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
        <input name="title" required className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
        <input name="xpReward" type="number" defaultValue={25} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
        <input name="sortOrder" type="number" defaultValue={0} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
        <input name="chainGroup" placeholder="weekly_quest" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
        <textarea
          name="criteriaJson"
          required
          defaultValue='{"type":"close_deal","count":1}'
          className="min-h-[80px] rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-white"
        />
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" name="active" defaultChecked /> {t("active")}
        </label>
        <button type="submit" className="rounded-xl bg-gold/20 px-4 py-2 text-sm font-bold text-gold">
          {t("save")}
        </button>
      </form>
      <ul className="space-y-3">
        {missions.map((m) => (
          <li key={m.id} className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
            <div className="font-semibold text-white">
              {m.title} <span className="text-white/40">({m.key})</span>
            </div>
            <div className="mt-1 text-xs text-white/50">
              +{m.xpReward} XP · chain: {m.chainGroup ?? "—"}
            </div>
            <pre className="mt-2 overflow-x-auto text-[10px] text-white/40">
              {JSON.stringify(m.criteria)}
            </pre>
            <form action={adminDeleteMissionAction} className="mt-2">
              <input type="hidden" name="id" value={m.id} />
              <button type="submit" className="text-xs text-rose-400 hover:underline">
                {t("delete")}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
