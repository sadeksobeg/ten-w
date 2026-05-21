"use client";

import { useTranslations } from "next-intl";
import { adminDeleteMissionAction, adminUpsertMissionFormAction } from "@/lib/growth/actions";

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

type Props = { missions: MissionRow[] };

export function AdminMissionsClient({ missions }: Props) {
  const t = useTranslations("Growth.admin.missionsPage");

  return (
    <div className="space-y-8">
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
