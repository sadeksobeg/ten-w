"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { ImageUpload } from "@/components/growth/ui/ImageUpload";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { updatePartnerAvatarAction } from "@/lib/growth/actions";

type Props = {
  locale: string;
  initialAvatar: string;
  name: string;
  email: string;
};

export function AvatarSettingsForm({ initialAvatar, name, email }: Props) {
  const t = useTranslations("Growth.settings");
  const [avatar, setAvatar] = useState(initialAvatar);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function save() {
    setStatus("idle");
    const fd = new FormData();
    fd.set("avatarUrl", avatar);
    const res = await updatePartnerAvatarAction(fd);
    setStatus(res.ok ? "ok" : "err");
  }

  return (
    <GlassCard className="space-y-6">
      <div className="flex items-center gap-4">
        <GrowthAvatar name={name} email={email} avatarUrl={avatar || null} size="lg" />
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-xs text-[var(--growth-text-sub)]">{email}</p>
        </div>
      </div>
      <ImageUpload
        value={avatar}
        onChange={setAvatar}
        aspectRatio="1/1"
        placeholder={t("uploadHint")}
        hint="2MB"
      />
      {status === "ok" ? <p className="text-sm text-emerald-400">{t("saved")}</p> : null}
      {status === "err" ? <p className="text-sm text-rose-400">{t("error")}</p> : null}
      <GoldButton type="button" onClick={() => void save()}>
        {t("save")}
      </GoldButton>
    </GlassCard>
  );
}
