"use client";

import { useTranslations } from "next-intl";
import { AdminToastForm } from "@/components/growth/admin/AdminToastForm";
import { updateLevelPerksAdminAction } from "@/lib/growth/actions";
import { parseLevelPerks } from "@/lib/growth/parse-level-perks";

type Props = {
  levelId: string;
  perksJson: unknown;
};

export function LevelPerksEditor({ levelId, perksJson }: Props) {
  const t = useTranslations("Growth.admin.levelsPage.perksEditor");
  const initial = parseLevelPerks(perksJson).join("\n");

  return (
    <AdminToastForm action={updateLevelPerksAdminAction} className="mt-4 grid gap-2">
      <input type="hidden" name="levelId" value={levelId} />
      <label className="block">
        <span className="text-xs text-white/55">{t("label")}</span>
        <textarea
          name="perksLines"
          rows={4}
          defaultValue={initial}
          placeholder={t("placeholder")}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
        />
      </label>
      <button
        type="submit"
        className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white hover:border-gold/35 sm:w-fit"
      >
        {t("save")}
      </button>
    </AdminToastForm>
  );
}
