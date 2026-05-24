"use client";

import { useLocale, useTranslations } from "next-intl";
import { PartnerNameBadges } from "@/components/growth/badges/PartnerNameBadges";
import { BadgeIdentityPill } from "@/components/growth/badges/BadgeIdentityPill";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { resolveBadgeCopy } from "@/lib/growth/badge-i18n";
import { CHAT_BADGE_KEYS } from "@/lib/growth/badge-visual";

type Props = {
  partnerName: string;
  partnerEmail: string;
  avatarUrl: string | null;
  earnedBadgeKeys: string[];
  grantBadgeKey: string;
};

export function BadgeGrantLivePreview({
  partnerName,
  partnerEmail,
  avatarUrl,
  earnedBadgeKeys,
  grantBadgeKey,
}: Props) {
  const t = useTranslations("Growth.admin.badgesPage.grantStudio");
  const locale = useLocale();
  const displayName = partnerName.trim() || partnerEmail;
  const previewKeys = earnedBadgeKeys.includes(grantBadgeKey)
    ? earnedBadgeKeys
    : [...earnedBadgeKeys, grantBadgeKey];
  const chatKeys = previewKeys.filter((k) => CHAT_BADGE_KEYS.includes(k));
  const grantCopy = resolveBadgeCopy(grantBadgeKey, locale);
  const isCreator = grantBadgeKey === "content_creator";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gold/80">
          {t("previewChat")}
        </p>
        <div className="flex gap-2">
          <GrowthAvatar name={displayName} email={partnerEmail} avatarUrl={avatarUrl} size="sm" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[11px] font-bold text-white/90">{displayName}</span>
              <PartnerNameBadges badgeKeys={chatKeys} size="xs" />
              {isCreator ? <BadgeIdentityPill variant="creator" locale={locale} size="sm" /> : null}
            </div>
            <div className="mt-1 inline-block max-w-[92%] rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white/80">
              {t("previewSampleMessage")}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gold/80">
          {t("previewProfile")}
        </p>
        <div className="flex items-center gap-3">
          <GrowthAvatar name={displayName} email={partnerEmail} avatarUrl={avatarUrl} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold text-white">{displayName}</p>
              <PartnerNameBadges badgeKeys={previewKeys} size="xs" />
            </div>
            <p className="mt-1 text-[10px] text-white/45">{partnerEmail}</p>
          </div>
          <BadgeIcon badgeKey={grantBadgeKey} earned size="lg" showGlow name={grantCopy.name} />
        </div>
      </div>
    </div>
  );
}
