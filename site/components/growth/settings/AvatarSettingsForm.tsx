"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { ImageUpload } from "@/components/growth/ui/ImageUpload";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { updatePartnerAvatarAction } from "@/lib/growth/actions";
import { useToast } from "@/hooks/useToast";

type Props = {
  locale: string;
  initialAvatar: string;
  name: string;
  email: string;
};

export function AvatarSettingsForm({ initialAvatar, name, email }: Props) {
  const t = useTranslations("Growth.settings");
  const { showToast } = useToast();
  const [avatar, setAvatar] = useState(initialAvatar);
  const [state, formAction, pending] = useActionState(updatePartnerAvatarAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) showToast({ type: "success", title: t("saved") });
    else showToast({ type: "error", title: t("error") });
  }, [state, showToast, t]);

  return (
    <GlassCard className="space-y-6">
      <div className="flex items-center gap-4">
        <GrowthAvatar name={name} email={email} avatarUrl={avatar || null} size="lg" />
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-xs text-[var(--growth-text-sub)]">{email}</p>
        </div>
      </div>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="avatarUrl" value={avatar} readOnly />
        <ImageUpload
          value={avatar}
          onChange={setAvatar}
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
