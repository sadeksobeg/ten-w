import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { BadgeGrid } from "@/components/growth/badges/BadgeGrid";
import { ProfileViewTracker } from "@/components/growth/ProfileViewTracker";
import { ProfileQr } from "@/components/growth/ProfileQr";
import { ProfileShareButton } from "@/components/growth/ProfileShareButton";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { IconChevronRight, IconQr } from "@/components/growth/icons/GrowthIcons";
import { ProfileHeroPublic } from "@/components/growth/profile/ProfileHeroPublic";
import { PartnerNetworkTree } from "@/components/growth/profile/PartnerNetworkTree";
import { ProfileActivityList } from "@/components/growth/profile/ProfileActivityList";
import { ProfileShowcaseStrip } from "@/components/growth/profile/ProfileShowcaseStrip";
import { BusinessCard } from "@/components/growth/profile/BusinessCard";
import { getBadgeDisplay } from "@/lib/growth/badge-display";
import { PartnerCard } from "@/components/growth/cards/PartnerCard";
import { getPublicProfileBySlug } from "@/lib/growth/get-public-profile";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ print?: string; view?: string }>;
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

export default async function PublicPartnerProfilePage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const t = await getTranslations("Growth.publicProfile");
  const session = await auth();
  const data = await getPublicProfileBySlug(slug, locale);
  if (!data) notFound();

  const canAppreciate =
    session?.user?.id &&
    session.user.role === UserRole.PARTNER &&
    session.user.id !== data.userId;

  const signInHref = `/${locale}/growth/sign-in`;
  const profileUrl = `https://tenegta.com/${locale}/growth/profile/${data.publicSlug}`;
  if (sp.view === "card" || sp.print === "card") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] p-8">
        <PartnerCard
          name={data.name}
          email={data.userId}
          displayTitle={data.displayTitle}
          levelCode={data.levelCode}
          levelName={data.levelName}
          locale={locale}
          cardNumber={data.cardNumber ?? 0}
          totalXp={data.totalXp}
          closedDeals={data.closedDeals}
          badgeCount={data.badgeCount}
          showcasedBadges={data.showcasedBadges}
          dnaDimensions={data.dnaProfile.dimensions}
          archetype={data.dnaProfile.archetype}
          avatarUrl={data.avatarUrl}
          avatarPreset={data.avatarPreset}
        />
      </div>
    );
  }

  return (
    <>
      <ProfileViewTracker slug={slug} />

      <ProfileHeroPublic locale={locale} data={data} canAppreciate={Boolean(canAppreciate)} />

      <ProfileShowcaseStrip
        locale={locale}
        keys={data.showcasedBadges}
        earnedBadges={data.earnedBadges.map((b) => ({ key: b.key, name: b.name }))}
        title={t("showcaseTitle")}
      />

      <section className="mt-8 flex flex-col items-center">
        <h2 className="mb-4 text-lg font-bold">{t("cardTitle")}</h2>
        <PartnerCard
          name={data.name}
          email={data.userId}
          displayTitle={data.displayTitle}
          levelCode={data.levelCode}
          levelName={data.levelName}
          locale={locale}
          cardNumber={data.cardNumber ?? 0}
          totalXp={data.totalXp}
          closedDeals={data.closedDeals}
          badgeCount={data.badgeCount}
          showcasedBadges={data.showcasedBadges}
          dnaDimensions={data.dnaProfile.dimensions}
          archetype={data.dnaProfile.archetype}
          avatarUrl={data.avatarUrl}
          avatarPreset={data.avatarPreset}
        />
        <Link
          href={`/${locale}/growth/profile/${data.publicSlug}?view=card`}
          className="mt-3 text-xs font-semibold text-gold hover:underline"
        >
          {t("cardFullView")}
        </Link>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">{t("badgesTitle")}</h2>
        <GlassCard className="mt-4">
          <BadgeGrid
            locale={locale}
            badges={data.allBadges.map((b) => {
              const display = getBadgeDisplay(b.key, locale, {
                earned: b.earned,
                hidden: b.hidden,
                dbFallback: { name: b.name, description: b.description },
              });
              return {
                key: b.key,
                name: display.secret ? t("secret") : display.name,
                description: display.secret ? t("secretHint") : display.description || t("lockedBadge"),
                howTo: display.howTo,
                earned: b.earned,
                grantedAt: b.grantedAt,
                hidden: b.hidden,
              };
            })}
            size="xl"
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

      {data.publicActivity.length > 0 ? (
        <section className="mt-8 growth-page-enter">
          <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold text-gold">
            {t("activityTitle")}
          </h2>
          <GlassCard className="mt-4 divide-y divide-white/10 p-0">
            <ProfileActivityList items={data.publicActivity} />
          </GlassCard>
        </section>
      ) : null}

      {data.oath ? (
        <GlassCard className="mt-8 border-gold/20 p-5 growth-page-enter">
          <h2 className="text-sm font-bold text-gold">{t("oathTitle")}</h2>
          {data.oathDate ? (
            <p className="mt-1 text-xs text-white/50">
              {t("oathOn", {
                date: new Date(data.oathDate).toLocaleDateString(
                  locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US",
                ),
              })}
            </p>
          ) : null}
          <p className="mt-3 whitespace-pre-line text-sm italic text-white/75 line-clamp-4">
            {data.oath.slice(0, 200)}
            {data.oath.length > 200 ? "…" : ""}
          </p>
        </GlassCard>
      ) : null}

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

      {data.oath ? (
        <GlassCard className="mt-8 border-gold/20 p-6">
          <h2 className="text-sm font-bold text-gold">{t("oathTitle")}</h2>
          {data.oathDate ? (
            <p className="mt-1 text-xs text-white/50">
              {t("oathOn", {
                date: new Date(data.oathDate).toLocaleDateString(
                  locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US",
                ),
              })}
            </p>
          ) : null}
          <p className="mt-3 whitespace-pre-line text-sm italic leading-relaxed text-white/75">
            {data.oath.length > 200 ? `${data.oath.slice(0, 200)}…` : data.oath}
          </p>
        </GlassCard>
      ) : null}

      <GlassCard variant="highlight" className="mt-8 p-6 text-center sm:text-start">
        <h2 className="text-lg font-bold">{t("ctaTitle")}</h2>
        <p className="mt-2 text-sm text-[var(--growth-text-sub)]">{t("ctaBody")}</p>
        <Link href={signInHref} className="mt-4 inline-block">
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
