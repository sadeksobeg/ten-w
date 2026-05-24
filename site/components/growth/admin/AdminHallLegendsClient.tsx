"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { addToHallOfLegendAction } from "@/lib/growth/actions";
import { useToast } from "@/hooks/useToast";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";

type PartnerOption = { userId: string; label: string };

type Props = {
  locale: string;
  partners: PartnerOption[];
};

export function AdminHallLegendsClient({ locale, partners }: Props) {
  const t = useTranslations("Growth.admin.legends");
  const { showToast } = useToast();
  const [state, formAction, pending] = useActionState(addToHallOfLegendAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) showToast({ type: "success", title: t("toastOk") });
    else showToast({ type: "error", title: t("toastError") });
  }, [state, showToast, t]);

  return (
    <GlassCard className="max-w-xl space-y-4">
      <h2 className="text-sm font-bold text-gold">{t("formTitle")}</h2>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <label className="block">
          <span className="text-xs text-white/55">{t("partner")}</span>
          <select
            name="partnerUserId"
            required
            disabled={pending}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"
          >
            <option value="">{t("selectPartner")}</option>
            {partners.map((p) => (
              <option key={p.userId} value={p.userId}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-white/55">{t("achievement")}</span>
          <input
            name="achievement"
            required
            maxLength={200}
            disabled={pending}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"
          />
        </label>
        <label className="block">
          <span className="text-xs text-white/55">{t("quote")}</span>
          <textarea
            name="quote"
            maxLength={300}
            rows={2}
            disabled={pending}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"
          />
        </label>
        <GoldButton type="submit" disabled={pending}>
          {t("submit")}
        </GoldButton>
      </form>
    </GlassCard>
  );
}
