"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { updatePartnerProfileAction } from "@/lib/growth/actions";
import { useToast } from "@/hooks/useToast";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";

type Props = {
  locale: string;
  displayTitle: string;
  bio: string;
  social: { whatsapp?: string; linkedin?: string; twitter?: string };
};

export function PartnerProfileSettingsForm({
  locale,
  displayTitle,
  bio,
  social,
}: Props) {
  const t = useTranslations("Growth.settings.profile");
  const { showToast } = useToast();
  const [bioVal, setBioVal] = useState(bio);
  const [state, formAction, pending] = useActionState(updatePartnerProfileAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) showToast({ type: "success", title: t("saved") });
    else showToast({ type: "error", title: t("error") });
  }, [state, showToast, t]);

  return (
    <GlassCard className="space-y-4">
      <h2 className="text-sm font-bold text-gold">{t("title")}</h2>
      <p className="text-xs text-white/55">{t("hint")}</p>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <label className="block">
          <span className="text-xs text-white/55">{t("displayTitle")}</span>
          <input
            name="displayTitle"
            maxLength={60}
            defaultValue={displayTitle}
            disabled={pending}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          />
        </label>
        <label className="block">
          <span className="text-xs text-white/55">{t("bio")}</span>
          <textarea
            name="bio"
            maxLength={280}
            value={bioVal}
            onChange={(e) => setBioVal(e.target.value)}
            disabled={pending}
            rows={4}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          />
          <span className="mt-1 block text-end text-[10px] text-white/40">
            {bioVal.length}/280
          </span>
        </label>
        <label className="block">
          <span className="text-xs text-white/55">WhatsApp</span>
          <input
            name="whatsapp"
            defaultValue={social.whatsapp ?? ""}
            disabled={pending}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          />
        </label>
        <label className="block">
          <span className="text-xs text-white/55">LinkedIn</span>
          <input
            name="linkedin"
            defaultValue={social.linkedin ?? ""}
            disabled={pending}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          />
        </label>
        <label className="block">
          <span className="text-xs text-white/55">X / Twitter</span>
          <input
            name="twitter"
            defaultValue={social.twitter ?? ""}
            disabled={pending}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          />
        </label>
        <GoldButton type="submit" disabled={pending}>
          {t("save")}
        </GoldButton>
      </form>
    </GlassCard>
  );
}
