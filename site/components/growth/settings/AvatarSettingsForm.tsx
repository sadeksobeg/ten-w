"use client";

import { useActionState, useEffect, useState } from "react";
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

export function AvatarSettingsForm({
  initialAvatar,
  initialPreset,
  name,
  email,
}: Props) {
  const t = useTranslations("Growth.settings");
  const { setPreview } = usePartnerPreview();
  const [avatar, setAvatar] = useState(initialAvatar);
  const [preset, setPreset] = useState(initialPreset ?? "");
  const [state, formAction, pending] = useActionState(updatePartnerAvatarAction, null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!state) return;
    if (state.ok) showToast({ type: "success", title: t("saved") });
    else showToast({ type: "error", title: t("error") });
  }, [state, showToast, t]);

  return (
    <GlassCard className="space-y-6">
      <div className="flex items-center gap-4">
        <GrowthAvatar
          name={name}
          email={email}
          avatarUrl={avatar || null}
          avatarPreset={preset || null}
          size="lg"
        />
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-xs text-[var(--growth-text-sub)]">{email}</p>
        </div>
      </div>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="avatarUrl" value={avatar} readOnly />
        <input type="hidden" name="avatarPreset" value={preset} readOnly />
        <div>
          <p className="mb-2 text-xs font-semibold text-white/55">{t("avatarPresets")}</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {AVATAR_PRESETS.map((p) => {
              const active = preset === p.id;
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
                  className={`growth-touch-target rounded-xl border p-1 transition focus-visible:ring-2 focus-visible:ring-gold/40 ${
                    active ? "border-gold ring-2 ring-gold/40" : "border-white/10 hover:border-gold/30"
                  }`}
                  aria-pressed={active}
                  aria-label={t(p.labelKey as "presetGold1")}
                >
                  <AvatarPresetFace preset={p} size={40} className="mx-auto ring-0 ring-offset-0" />
                </button>
              );
            })}
          </div>
        </div>
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
        <GoldButton type="submit" disabled={pending}>
          {t("save")}
        </GoldButton>
      </form>
    </GlassCard>
  );
}
