import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BadgeGrid } from "@/components/growth/badges/BadgeGrid";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { ProfileViewTracker } from "@/components/growth/ProfileViewTracker";
import { ProfileQr } from "@/components/growth/ProfileQr";
import { ProfileShareButton } from "@/components/growth/ProfileShareButton";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { LevelBadge } from "@/components/growth/ui/LevelBadge";
import { getLevelVisual } from "@/lib/growth/level-visual";
import { getLevelI18nKey, LEVEL_COLORS } from "@/lib/growth/level-i18n";
import { IconChevronRight } from "@/components/growth/icons/GrowthIcons";
import { PartnerNetworkTree } from "@/components/growth/profile/PartnerNetworkTree";
import { getPublicProfileBySlug } from "@/lib/growth/get-public-profile";
import { getXpBrandLabel } from "@/lib/growth/xp-brand";
import {
  IconBadge,
  IconDeals,
  IconMission,
  IconQr,
  IconRank,
  IconStreak,
  IconXp,
  IconWhatsApp,
  IconLinkedIn,
  IconXSocial,
} from "@/components/growth/icons/GrowthIcons";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const data = await getPublicProfileBySlug(slug, locale);
  if (!data) return { title: "Partner" };
  const title = `${data.name} — T.E.N.E.G.T.A Partner`;
  const description =
    data.bio?.trim() ||
    `${data.name} — ${data.levelName}. انضم لشبكة T.E.N.E.G.T.A.`;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tenegta.com";
  const ogImage = `${baseUrl}/api/growth/profile/${slug}/share-card?format=landscape&locale=${locale}`;
  return {
    title,
    openGraph: { title, description, images: [{ url: ogImage, width: 1200, height: 630 }] },
    description,
  };
}

export default async function PublicPartnerProfilePage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations("Growth.publicProfile");
  const data = await getPublicProfileBySlug(slug, locale);
  if (!data) notFound();

  const xpLabel = getXpBrandLabel(locale);
  const registerHref = `/${locale}/growth/register?ref=${encodeURIComponent(data.referralCode)}`;
  const lv = getLevelVisual(data.levelName);
  const levelKey = getLevelI18nKey(data.levelCode, data.levelName);
  const heroColor = LEVEL_COLORS[levelKey] ?? LEVEL_COLORS.starter;

  return (
    <>
      <ProfileViewTracker slug={slug} />

      <div
        className="overflow-hidden rounded-2xl border border-[var(--growth-border)]"
        style={{
          background: `linear-gradient(135deg, ${heroColor}33, var(--growth-surface) 55%, ${heroColor}22)`,
        }}
      >
        <div className="flex flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:text-start">
          <div className="relative shrink-0">
            <svg width="112" height="112" className="-rotate-90" aria-hidden>
              <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <circle cx="56" cy="56" r="48" fill="none" stroke={lv.ringColor} strokeWidth="3" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <GrowthAvatar
                name={data.name}
                email={data.referralCode}
                avatarUrl={data.avatarUrl}
                size="lg"
                className="!size-24"
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-extrabold">{data.name}</h1>
            {data.displayTitle ? (
              <p className="mt-1 text-sm text-gold/90">{data.displayTitle}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <LevelBadge levelName={data.levelName} levelCode={data.levelCode} locale={locale} size="lg" />
              <span className="text-xs text-[var(--growth-text-sub)]">T.E.N.E.G.T.A</span>
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
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold hover:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/40"
                    >
                      {Icon ? <Icon size={14} /> : null}
                      {k}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {(
          [
            { label: xpLabel, value: String(data.totalXp), Icon: IconXp },
            { label: t("closedDeals"), value: String(data.closedDeals), Icon: IconDeals },
            { label: t("pending"), value: String(data.pendingDeals), Icon: IconMission },
            { label: t("streak"), value: String(data.streakCurrent), Icon: IconStreak },
            { label: t("memberDays"), value: String(data.memberDays), Icon: IconRank },
            { label: t("badges"), value: String(data.badgeCount), Icon: IconBadge },
            { label: t("views"), value: String(data.profileViews), Icon: IconRank },
          ] as const
        ).map((s) => (
          <GlassCard key={s.label} className="p-4 text-center">
            <s.Icon size={22} className="mx-auto text-gold/80" aria-hidden />
            <div className="mt-1 text-xl font-extrabold text-gold">{s.value}</div>
            <div className="text-[10px] text-[var(--growth-text-sub)]">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold">{t("badgesTitle")}</h2>
        <GlassCard className="mt-4">
          <BadgeGrid
            locale={locale}
            badges={data.allBadges.map((b) => ({
              key: b.key,
              name: b.earned ? b.name : "???",
              description: b.earned ? b.description : t("lockedBadge"),
              howTo: b.howTo,
              earned: b.earned,
              grantedAt: b.grantedAt,
              hidden: b.hidden,
            }))}
            size="md"
            showLocked
          />
        </GlassCard>
      </section>

      <section className="mt-8 growth-page-enter">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold text-gold">
          {t("teamTitle")}
        </h2>
        <p className="mt-1 text-sm text-[var(--growth-text-sub)]">{t("teamSubtitle")}</p>
        <GlassCard className="mt-4 p-4 sm:p-6">
          <PartnerNetworkTree
            tree={data.networkTree}
            stats={data.networkStats}
            locale={locale}
          />
        </GlassCard>
      </section>

      <GlassCard variant="highlight" className="mt-8 p-6 text-center sm:text-start">
        <h2 className="text-lg font-bold">{t("ctaTitle")}</h2>
        <p className="mt-2 text-sm text-[var(--growth-text-sub)]">{t("ctaBody")}</p>
        <Link href={registerHref} className="mt-4 inline-block">
          <GoldButton className="inline-flex items-center gap-2">
            {t("ctaButton")}
            <IconChevronRight size={18} className={locale === "ar" ? "scale-x-[-1]" : ""} aria-hidden />
          </GoldButton>
        </Link>
      </GlassCard>

      <GlassCard className="mt-6 flex flex-col items-center gap-4 p-6 text-center">
        <IconQr size={40} className="text-gold/60" aria-hidden />
        <p className="text-xs text-[var(--growth-text-sub)]">{t("qrSoon")}</p>
        <ProfileShareButton
          title={data.name}
          url={`https://tenegta.com/${locale}/growth/profile/${data.publicSlug}`}
        />
        <ProfileQr
          url={`https://tenegta.com/${locale}/growth/profile/${data.publicSlug}`}
          label={locale === "ar" ? "امسح لمشاركة البروفايل" : "Scan to share profile"}
        />
      </GlassCard>
    </>
  );
}
