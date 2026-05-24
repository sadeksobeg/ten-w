"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { updatePartnerTerritoryAction } from "@/lib/growth/actions";
import { TERRITORY_KEYS } from "@/lib/growth/territories";
import { useToast } from "@/hooks/useToast";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";

type Props = {
  locale: string;
  currentTerritory: string | null;
};

export function TerritorySettingsForm({ locale, currentTerritory }: Props) {
  const t = useTranslations("Growth.map");
  const { showToast } = useToast();
  const [state, formAction, pending] = useActionState(updatePartnerTerritoryAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) showToast({ type: "success", title: t("territorySaved") });
    else showToast({ type: "error", title: t("territoryError") });
  }, [state, showToast, t]);

  return (
    <GlassCard className="space-y-4">
      <h2 className="text-sm font-bold text-gold">{t("title")}</h2>
      <p className="text-xs text-white/55">{t("pick_territory")}</p>
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="locale" value={locale} />
        <label className="min-w-[200px] flex-1">
          <span className="text-xs text-white/55">{t("my_territory")}</span>
          <select
            name="territory"
            defaultValue={currentTerritory ?? ""}
            disabled={pending}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          >
            <option value="">{t("unclaimed")}</option>
            {TERRITORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`territories.${key}`)}
              </option>
            ))}
          </select>
        </label>
        <GoldButton type="submit" disabled={pending}>
          {pending ? "…" : t("saveTerritory")}
        </GoldButton>
      </form>
    </GlassCard>
  );
}
