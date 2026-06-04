"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { ImageUpload } from "@/components/growth/ui/ImageUpload";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { updatePartnerAvatarAction } from "@/lib/growth/actions";
import { useToast } from "@/hooks/useToast";
import { AVATAR_PRESETS } from "@/lib/growth/avatar-presets";
import { AvatarPresetFace } from "@/components/growth/ui/AvatarPresetFace";
import { usePartnerPreview } from "@/components/growth/settings/PartnerSettingsLayout";

type Props = {
  locale: string;
  initialAvatar: string;
  initialPreset: string | null;
  name: string;
  email: string;
};

const TIER_ORDER = ["legend", "diamond", "platinum", "gold", "silver", "bronze"] as const;

export function AvatarSettingsForm({
  locale,
  initialAvatar,
  initialPreset,
  name,
  email,
}: Props) {
  const t = useTranslations("Growth.settings");
  const router = useRouter();
  const { setPreview } = usePartnerPreview();
  const [avatar, setAvatar] = useState(initialAvatar);
  const [preset, setPreset] = useState(initialPreset ?? "");
  const [state, formAction, pending] = useActionState(updatePartnerAvatarAction, null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      showToast({ type: "success", title: t("saved") });
      router.refresh();
    } else showToast({ type: "error", title: t("error") });
  }, [state, showToast, t, router]);

  const byTier = TIER_ORDER.map((tier) => ({
    tier,
    items: AVATAR_PRESETS.filter((p) => p.tier === tier),
  })).filter((g) => g.items.length > 0);

  return (
    <GlassCard className="space-y-6 overflow-hidden">
      <div className="relative rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 via-transparent to-violet-500/10 p-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <GrowthAvatar
            name={name}
            email={email}
            avatarUrl={avatar || null}
            avatarPreset={preset || null}
            size="lg"
            className="!size-20 !text-lg ring-4 ring-gold/30"
          />
          <div className="text-center sm:text-start">
            <p className="font-bold">{name}</p>
            <p className="text-xs text-[var(--growth-text-sub)]">{email}</p>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-gold/70">{t("avatarPresets")}</p>
          </div>
        </div>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="locale" value={locale} readOnly />
        <input type="hidden" name="avatarUrl" value={avatar} readOnly />
        <input type="hidden" name="avatarPreset" value={preset} readOnly />

        {byTier.map(({ tier, items }) => (
          <div key={tier}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{tier}</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {items.map((p) => {
                const active = preset === p.id && !avatar;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPreset(p.id);
                      setAvatar("");
                      setPreview((prev) => ({
                        ...prev,
                        avatarPreset: p.id,
                        avatarUrl: "",
                      }));
                    }}
                    className={`growth-touch-target rounded-2xl border p-2 transition focus-visible:ring-2 focus-visible:ring-gold/40 ${
                      active
                        ? "border-gold bg-gold/10 ring-2 ring-gold/35 shadow-[0_0_24px_-6px_rgba(228,184,77,0.5)]"
                        : "border-white/10 bg-white/[0.03] hover:border-gold/30"
                    }`}
                    aria-pressed={active}
                    aria-label={t(p.labelKey as "presetGold1")}
                  >
                    <AvatarPresetFace preset={p} size={56} className="mx-auto" />
                    <span className="mt-1.5 block truncate text-center text-[9px] font-semibold text-white/55">
                      {t(p.labelKey as "presetGold1")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="mb-3 text-xs font-semibold text-white/55">{t("uploadHint")}</p>
          <ImageUpload
            value={avatar}
            onChange={(v) => {
              setAvatar(v);
              if (v) setPreset("");
              setPreview((prev) => ({
                ...prev,
                avatarUrl: v,
                avatarPreset: v ? "" : prev.avatarPreset,
              }));
            }}
            aspectRatio="1/1"
            placeholder={t("uploadHint")}
            hint="2MB"
          />
        </div>

        <GoldButton type="submit" disabled={pending}>
          {t("save")}
        </GoldButton>
      </form>
    </GlassCard>
  );
}
