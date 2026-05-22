"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { updatePartnerProfileAction } from "@/lib/growth/actions";
import { useToast } from "@/hooks/useToast";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import {
  IconLinkedIn,
  IconWhatsApp,
  IconXSocial,
} from "@/components/growth/icons/GrowthIcons";
import { usePartnerPreview } from "@/components/growth/settings/PartnerSettingsLayout";

type Props = {
  locale: string;
  social: { whatsapp?: string; linkedin?: string; twitter?: string };
};

export function PartnerProfileSettingsForm({ locale, social }: Props) {
  const t = useTranslations("Growth.settings.profile");
  const { showToast } = useToast();
  const { preview, setPreview } = usePartnerPreview();
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
            value={preview.displayTitle}
            onChange={(e) =>
              setPreview((p) => ({ ...p, displayTitle: e.target.value }))
            }
            disabled={pending}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          />
        </label>
        <label className="block">
          <span className="text-xs text-white/55">{t("bio")}</span>
          <textarea
            name="bio"
            maxLength={280}
            value={preview.bio}
            onChange={(e) => setPreview((p) => ({ ...p, bio: e.target.value }))}
            disabled={pending}
            rows={4}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          />
          <span className="mt-1 block text-end text-[10px] text-white/40">
            {preview.bio.length}/280
          </span>
        </label>
        <label className="block">
          <span className="flex items-center gap-2 text-xs text-white/55">
            <IconWhatsApp size={16} className="text-[#25D366]" aria-hidden />
            {t("socialWhatsapp")}
          </span>
          <input
            name="whatsapp"
            defaultValue={social.whatsapp ?? ""}
            disabled={pending}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          />
        </label>
        <label className="block">
          <span className="flex items-center gap-2 text-xs text-white/55">
            <IconLinkedIn size={16} className="text-[#0A66C2]" aria-hidden />
            {t("socialLinkedin")}
          </span>
          <input
            name="linkedin"
            defaultValue={social.linkedin ?? ""}
            disabled={pending}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40"
          />
        </label>
        <label className="block">
          <span className="flex items-center gap-2 text-xs text-white/55">
            <IconXSocial size={16} className="text-white/80" aria-hidden />
            {t("socialTwitter")}
          </span>
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
