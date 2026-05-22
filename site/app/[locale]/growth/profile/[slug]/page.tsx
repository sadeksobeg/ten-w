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
import { RankEmblem } from "@/components/growth/ui/RankEmblem";
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
  IconCalendar,
  IconEye,
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
  const lv = getLevelVisual(data.levelName, data.levelCode);
  const levelKey = getLevelI18nKey(data.levelCode, data.levelName);
  const heroColor = LEVEL_COLORS[levelKey] ?? LEVEL_COLORS.starter;

  return (
    <>
      <ProfileViewTracker slug={slug} />

      <div
        className="growth-profile-hero relative overflow-hidden rounded-2xl border border-gold/25"
        style={{
          background: `linear-gradient(145deg, ${heroColor}44 0%, var(--growth-surface) 42%, #0a0a0f 100%)`,
          boxShadow: `0 0 60px ${heroColor}22`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(228,184,77,0.35), transparent)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col items-center gap-6 px-6 py-10 text-center sm:flex-row sm:items-center sm:text-start">
          <div className="relative shrink-0">
            <div
              className="absolute -inset-2 rounded-full motion-safe:animate-pulse motion-reduce:animate-none"
              style={{ boxShadow: `0 0 32px ${lv.ringColor}66` }}
              aria-hidden
            />
            <svg width="128" height="128" className="-rotate-90" aria-hidden>
              <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
              <circle
                cx="64"
                cy="64"
                r="54"
                fill="none"
                stroke={lv.ringColor}
                strokeWidth="4"
                strokeDasharray="8 4"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <GrowthAvatar
                name={data.name}
                email={data.referralCode}
                avatarUrl={data.avatarUrl}
                avatarPreset={data.avatarPreset}
                size="lg"
                className="!size-28 !text-base"
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold/70">
              T.E.N.E.G.T.A Partner
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-cairo)] text-3xl font-extrabold sm:text-4xl">
              {data.name}
            </h1>
            {data.displayTitle ? (
              <p className="mt-2 text-base font-semibold text-[var(--growth-gold-bright)]">
                {data.displayTitle}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              <RankEmblem levelCode={data.levelCode} levelName={data.levelName} size="lg" />
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
            { label: t("memberDays"), value: String(data.memberDays), Icon: IconCalendar },
            { label: t("badges"), value: String(data.badgeCount), Icon: IconBadge },
            { label: t("views"), value: String(data.profileViews), Icon: IconEye },
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
            size="lg"
            showLocked
          />
        </GlassCard>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/20 bg-[#0a0a0f]/95 p-3 backdrop-blur-md sm:hidden">
        <ProfileShareButton
          title={data.name}
          url={`https://tenegta.com/${locale}/growth/profile/${data.publicSlug}`}
        />
      </div>

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
