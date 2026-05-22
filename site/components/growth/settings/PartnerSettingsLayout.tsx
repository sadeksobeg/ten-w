"use client";

import { useState, type ReactNode } from "react";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { LevelBadge } from "@/components/growth/ui/LevelBadge";

type Props = {
  name: string;
  email: string;
  avatarUrl: string;
  levelName: string;
  levelCode?: string;
  locale: string;
  children: ReactNode;
  previewFields: {
    displayTitle: string;
    bio: string;
  };
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
  const [preview, setPreview] = useState(previewFields);

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
      <GlassCard variant="elevated" className="h-fit p-5 lg:sticky lg:top-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--growth-text-sub)]">
          Live preview
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
      <div
        className="space-y-6"
        onChange={(e) => {
          const t = e.target as HTMLInputElement | HTMLTextAreaElement;
          if (!t.name) return;
          if (t.name === "displayTitle" || t.name === "bio") {
            setPreview((p) => ({ ...p, [t.name]: t.value }));
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
