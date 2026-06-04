import { getTranslations } from "next-intl/server";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { ProfileAppreciationButton } from "@/components/growth/profile/ProfileAppreciationButton";
import { AuraRing } from "@/components/growth/ui/AuraRing";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { LevelBadge } from "@/components/growth/ui/LevelBadge";
import { RankEmblem } from "@/components/growth/ui/RankEmblem";
import { StatCard } from "@/components/growth/ui/StatCard";
import {
  IconBadge,
  IconCalendar,
  IconDeals,
  IconEye,
  IconMission,
  IconStreak,
  IconWhatsApp,
  IconLinkedIn,
  IconXSocial,
  IconXp,
} from "@/components/growth/icons/GrowthIcons";
import { getLevelVisual } from "@/lib/growth/level-visual";
import { getLevelI18nKey, LEVEL_COLORS } from "@/lib/growth/level-i18n";
import { BadgeIdentityPill } from "@/components/growth/badges/BadgeIdentityPill";
import { ProfileBadgeStack } from "@/components/growth/profile/ProfileBadgeStack";
import { getXpBrandLabel } from "@/lib/growth/xp-brand";
import type { PublicProfileData } from "@/lib/growth/get-public-profile";

type Props = {
  locale: string;
  data: PublicProfileData;
  canAppreciate: boolean;
};

export async function ProfileHeroPublic({ locale, data, canAppreciate }: Props) {
  const t = await getTranslations("Growth.publicProfile");
  const xpLabel = getXpBrandLabel(locale);
  const lv = getLevelVisual(data.levelName, data.levelCode);
  const levelKey = getLevelI18nKey(data.levelCode, data.levelName);
  const heroColor = LEVEL_COLORS[levelKey] ?? LEVEL_COLORS.starter;
  const keys = new Set(data.earnedBadgeKeys);
  const isVerified = keys.has("verified_partner");
  const isCreator = keys.has("content_creator");
  const isFounding = keys.has("founding_partner");

  const xpPercent = data.nextLevel
    ? Math.min(
        100,
        Math.round(
          ((data.totalXp - data.currentLevelMinXp) /
            Math.max(1, data.nextLevel.minXp - data.currentLevelMinXp)) *
            100,
        ),
      )
    : 100;

  const primaryStats = [
    { label: xpLabel, value: data.totalXp, Icon: IconXp },
    { label: t("closedDeals"), value: data.closedDeals, Icon: IconDeals },
    { label: t("pending"), value: data.pendingDeals, Icon: IconMission },
    { label: t("streak"), value: data.streakCurrent, Icon: IconStreak },
  ] as const;

  const extraStats = [
    { label: t("memberDays"), value: data.memberDays, Icon: IconCalendar },
    { label: t("badges"), value: data.badgeCount, Icon: IconBadge },
    { label: t("views"), value: data.profileViews, Icon: IconEye },
  ] as const;

  return (
    <>
      <GlassCard
        variant="highlight"
        className="relative overflow-hidden p-0"
        style={{
          background: `linear-gradient(145deg, ${heroColor}44 0%, var(--growth-surface) 42%, #0a0a0f 100%)`,
          boxShadow: `0 0 60px ${heroColor}22`,
        }}
      >
        <div className="relative flex flex-col items-center gap-6 px-6 py-10 text-center lg:flex-row lg:items-center lg:justify-between lg:text-start">
          <AuraRing
            size={132}
            percent={xpPercent}
            levelCode={data.levelCode}
            levelName={data.levelName}
            className={isFounding ? "rounded-full p-[3px] [background:linear-gradient(135deg,#B07D2B,#E4B84D,#B07D2B)]" : undefined}
          >
            <GrowthAvatar
              name={data.name}
              email={data.referralCode}
              avatarUrl={data.avatarUrl}
              avatarPreset={data.avatarPreset}
              size="lg"
              className="!size-24 !text-base"
            />
          </AuraRing>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold/70">
              T.E.N.E.G.T.A Partner
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-extrabold sm:text-4xl">
                {data.name}
              </h1>
              {isVerified ? <BadgeIdentityPill variant="verified" locale={locale} size="md" /> : null}
              {isCreator ? <BadgeIdentityPill variant="creator" locale={locale} size="md" /> : null}
            </div>
            {data.displayTitle ? (
              <p className="mt-2 text-base font-semibold text-[var(--growth-gold-bright)]">
                {data.displayTitle}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <LevelBadge
                levelName={data.levelName}
                levelCode={data.levelCode}
                locale={locale}
                size="lg"
              />
              <RankEmblem levelCode={data.levelCode} levelName={data.levelName} size="lg" />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${xpPercent}%`, background: lv.ringColor }}
              />
            </div>
            {data.bio ? (
              <p className="mt-4 text-sm leading-relaxed text-[var(--growth-text-sub)]">{data.bio}</p>
            ) : null}
            {data.socialLinks ? (
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {Object.entries(data.socialLinks).map(([k, url]) => {
                  const key = k.toLowerCase();
                  const Icon =
                    key.includes("whatsapp")
                      ? IconWhatsApp
                      : key.includes("linkedin")
                        ? IconLinkedIn
                        : key === "x" || key.includes("twitter")
                          ? IconXSocial
                          : null;
                  return (
                    <a
                      key={k}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold hover:border-gold/30"
                    >
                      {Icon ? <Icon size={14} /> : null}
                      {k}
                    </a>
                  );
                })}
              </div>
            ) : null}
            {canAppreciate ? (
              <div className="mt-4 flex justify-center sm:justify-start">
                <ProfileAppreciationButton slug={data.publicSlug} partnerName={data.name} />
              </div>
            ) : null}
          </div>

          {data.showcasedBadges.length > 0 ? (
            <div className="hidden shrink-0 lg:block lg:w-[min(100%,380px)]">
              <ProfileBadgeStack
                locale={locale}
                keys={data.showcasedBadges}
                earnedBadges={data.earnedBadges.map((b) => ({ key: b.key, name: b.name }))}
                size="showcase"
                compact
              />
            </div>
          ) : null}
        </div>
      </GlassCard>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {primaryStats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={<s.Icon size={22} className="text-gold/80" />}
          />
        ))}
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-center text-xs font-semibold text-gold/80 hover:text-gold">
          {t("moreStats")}
        </summary>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {extraStats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={<s.Icon size={20} className="text-gold/70" />}
              animateValue={false}
            />
          ))}
        </div>
      </details>
    </>
  );
}
