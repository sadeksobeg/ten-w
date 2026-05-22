"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { LevelBadge } from "@/components/growth/ui/LevelBadge";

type PreviewState = {
  displayTitle: string;
  bio: string;
};

const PartnerPreviewContext = createContext<{
  preview: PreviewState;
  setPreview: React.Dispatch<React.SetStateAction<PreviewState>>;
} | null>(null);

export function usePartnerPreview() {
  const ctx = useContext(PartnerPreviewContext);
  if (!ctx) {
    throw new Error("usePartnerPreview must be used within PartnerSettingsLayout");
  }
  return ctx;
}

type Props = {
  name: string;
  email: string;
  avatarUrl: string;
  levelName: string;
  levelCode?: string;
  locale: string;
  children: ReactNode;
  previewFields: PreviewState;
};

export function PartnerSettingsLayout({
  name,
  email,
  avatarUrl,
  levelName,
  levelCode,
  locale,
  children,
  previewFields,
}: Props) {
  const t = useTranslations("Growth.settings");
  const [preview, setPreview] = useState(previewFields);

  return (
    <PartnerPreviewContext.Provider value={{ preview, setPreview }}>
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
        <GlassCard variant="elevated" className="h-fit p-5 lg:sticky lg:top-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--growth-text-sub)]">
            {t("live_preview")}
          </p>
          <div className="flex flex-col items-center gap-3 text-center">
            <GrowthAvatar name={name} email={email} avatarUrl={avatarUrl || null} size="lg" />
            <h3 className="text-lg font-bold">{name}</h3>
            {preview.displayTitle ? (
              <p className="text-sm text-gold/90">{preview.displayTitle}</p>
            ) : null}
            <LevelBadge levelName={levelName} levelCode={levelCode} locale={locale} size="sm" />
            {preview.bio ? (
              <p className="line-clamp-3 text-xs text-[var(--growth-text-sub)]">{preview.bio}</p>
            ) : null}
          </div>
        </GlassCard>
        <div className="space-y-6">{children}</div>
      </div>
    </PartnerPreviewContext.Provider>
  );
}
