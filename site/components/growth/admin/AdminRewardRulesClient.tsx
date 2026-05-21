"use client";

import { useTranslations } from "next-intl";
import {
  adminDeleteRewardRuleAction,
  adminUpsertRewardRuleFormAction,
} from "@/lib/growth/actions";

export type RewardRuleRow = {
  id: string;
  name: string;
  windowMs: string;
  rankMin: number;
  rankMax: number;
  bonusCents: number;
  badgeKey: string | null;
  active: boolean;
};

type Props = { rules: RewardRuleRow[] };

export function AdminRewardRulesClient({ rules }: Props) {
  const t = useTranslations("Growth.admin.rewardsPage");

  return (
    <div className="space-y-8">
      <form action={adminUpsertRewardRuleFormAction} className="grid gap-3 rounded-2xl border border-white/10 p-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-sm font-bold text-gold">{t("addRule")}</h2>
        <input name="name" required placeholder={t("name")} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
        <input name="windowMs" type="number" defaultValue={2592000000} required className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
        <input name="rankMin" type="number" defaultValue={1} required className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
        <input name="rankMax" type="number" defaultValue={3} required className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
        <input name="bonusCents" type="number" defaultValue={0} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
        <input name="badgeKey" placeholder="top_performer" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" name="active" defaultChecked /> {t("active")}
        </label>
        <button type="submit" className="rounded-xl bg-gold/20 px-4 py-2 text-sm font-bold text-gold sm:col-span-2">
          {t("save")}
        </button>
      </form>
      <ul className="space-y-3">
        {rules.map((r) => (
          <li key={r.id} className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
            <div className="font-semibold text-white">{r.name}</div>
            <div className="mt-1 text-xs text-white/50">
              #{r.rankMin}–{r.rankMax} · ${(r.bonusCents / 100).toFixed(0)} · {r.badgeKey ?? "—"}
            </div>
            <form action={adminDeleteRewardRuleAction} className="mt-2">
              <input type="hidden" name="id" value={r.id} />
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
