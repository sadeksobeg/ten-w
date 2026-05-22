"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { adminUpdateOfficialProfileAction } from "@/lib/growth/actions";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { VerifiedBadge } from "@/components/growth/ui/VerifiedBadge";
import { useToast } from "@/hooks/useToast";

type Props = {
  isVerified: boolean;
  officialDisplayName: string;
};

export function AdminOfficialProfileCard({ isVerified, officialDisplayName }: Props) {
  const t = useTranslations("Growth.admin.official");
  const { showToast } = useToast();
  const [state, formAction, pending] = useActionState(adminUpdateOfficialProfileAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) showToast({ type: "success", title: t("saved") });
    else showToast({ type: "error", title: t("error") });
  }, [state, showToast, t]);

  return (
    <GlassCard className="border border-gold/20 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-bold text-gold">{t("title")}</h2>
        {isVerified ? <VerifiedBadge label={t("verified")} /> : null}
      </div>
      <p className="mt-1 text-xs text-white/50">{t("hint")}</p>
      <form action={formAction} className="mt-4 space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isVerifiedOfficial"
            defaultChecked={isVerified}
            className="size-4 rounded border-white/20"
          />
          {t("verifyToggle")}
        </label>
        <label className="block">
          <span className="text-xs text-white/55">{t("displayName")}</span>
          <input
            name="officialDisplayName"
            maxLength={48}
            defaultValue={officialDisplayName}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40"
            placeholder={t("displayNamePh")}
          />
        </label>
        <GoldButton type="submit" disabled={pending}>
          {t("save")}
        </GoldButton>
      </form>
    </GlassCard>
  );
}
