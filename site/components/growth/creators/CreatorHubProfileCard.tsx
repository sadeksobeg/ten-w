"use client";

import { useTranslations } from "next-intl";
import { CreatorHubSettingsLink } from "./CreatorHubSettingsLink";
import type { CreatorWorkflowStatus } from "@prisma/client";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { LevelBadge } from "@/components/growth/ui/LevelBadge";
import { CreatorNameWithConsentBadge } from "./CreatorConsentVerifiedBadge";
import { IconSettings } from "@/components/growth/icons/GrowthIcons";

type Props = {
  name: string;
  email: string;
  avatarUrl: string | null;
  avatarPreset?: string | null;
  levelCode: string;
  locale: string;
  status: CreatorWorkflowStatus;
  hasBadge: boolean;
  consentGiven: boolean;
  viewerRank?: number | null;
  compact?: boolean;
};

export function CreatorHubProfileCard({
  name,
  email,
  avatarUrl,
  avatarPreset,
  levelCode,
  locale,
  status,
  hasBadge,
  consentGiven,
  viewerRank,
  compact = false,
}: Props) {
  const t = useTranslations("Creators.hub");
  const tStatus = useTranslations("Creators.status");
  const tConsent = useTranslations("Creators.consent");

  return (
    <div className={`creator-profile-card ${compact ? "creator-profile-card--compact" : ""}`}>
      <div className="creator-profile-card__glow" aria-hidden />
      <div className="creator-profile-card__inner">
        <div className="flex items-start gap-3">
          <div className="creator-profile-card__avatar-wrap relative shrink-0">
            <div className="creator-profile-card__ring" aria-hidden />
            <GrowthAvatar
              name={name}
              email={email}
              avatarUrl={avatarUrl}
              avatarPreset={avatarPreset}
              size={compact ? "md" : "lg"}
            />
            {hasBadge ? (
              <span className="absolute -bottom-0.5 -end-0.5 rounded-full bg-[var(--creator-surface)] p-0.5">
                <BadgeIcon badgeKey="content_creator" earned size="sm" />
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CreatorNameWithConsentBadge
                name={name}
                verified={consentGiven}
                label={tConsent("verifiedBadge")}
                nameClassName={`truncate font-[family-name:var(--font-cairo)] font-extrabold text-white ${compact ? "text-sm" : "text-base"}`}
                badgeSize={compact ? "sm" : "md"}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="creator-profile-chip creator-profile-chip--member">{t("memberChip")}</span>
              <span className="creator-profile-chip creator-profile-chip--status">
                {tStatus(status.toLowerCase())}
              </span>
              {viewerRank ? (
                <span className="creator-profile-chip creator-profile-chip--rank">
                  {t("cupRankChip", { rank: viewerRank })}
                </span>
              ) : null}
            </div>
            <div className="mt-2">
              <LevelBadge levelName={levelCode} levelCode={levelCode} locale={locale} size="sm" />
            </div>
          </div>
        </div>
        <CreatorHubSettingsLink className="creator-profile-card__edit mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--creator-secondary)]/35 bg-[var(--creator-secondary)]/8 px-3 py-2.5 text-xs font-bold text-[var(--creator-secondary)] transition hover:border-[var(--creator-secondary)]/60 hover:bg-[var(--creator-secondary)]/15 active:scale-[0.98]">
          <IconSettings size={14} aria-hidden />
          {t("editProfile")}
        </CreatorHubSettingsLink>
      </div>
    </div>
  );
}
