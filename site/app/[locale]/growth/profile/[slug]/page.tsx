import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { getPublicProfileBySlug } from "@/lib/growth/get-public-profile";
import { ProfileViewTracker } from "@/components/growth/ProfileViewTracker";
import { XpProgressBar } from "@/components/growth/XpProgressBar";
import { getXpBrandLabel } from "@/lib/growth/xp-brand";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicProfileBySlug(slug);
  if (!data) return { title: "Partner" };
  const title = `${data.name} — T.E.N.E.G.T.A Partner`;
  const description =
    data.bio?.trim() ||
    `${data.name} — ${data.levelName}. انضم لشبكة T.E.N.E.G.T.A.`;
  return {
    title,
    openGraph: { title, description },
    description,
  };
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "P";
}

export default async function PublicPartnerProfilePage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations("Growth.publicProfile");
  const data = await getPublicProfileBySlug(slug);
  if (!data) notFound();

  const xpLabel = getXpBrandLabel(locale);
  const registerHref = `/${locale}/growth/register?ref=${encodeURIComponent(data.referralCode)}`;

  return (
    <>
      <ProfileViewTracker slug={slug} />

      <GlassCard className="border border-white/12 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-start">
          {data.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.avatarUrl}
              alt=""
              className="size-24 rounded-2xl border border-white/15 object-cover"
            />
          ) : (
            <div
              className="flex size-24 items-center justify-center rounded-2xl border border-gold/30 bg-gold/15 text-2xl font-extrabold text-gold"
              aria-hidden
            >
              {initials(data.name)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">
              {data.name}
            </h1>
            {data.displayTitle ? (
              <p className="mt-1 text-sm text-gold/90">{data.displayTitle}</p>
            ) : null}
            <p className="mt-2 text-xs tracking-wide text-white/50">T.E.N.E.G.T.A Partner</p>
            <span className="mt-3 inline-flex rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-100">
              {data.levelName}
            </span>
            {data.bio ? (
              <p className="mt-4 text-sm leading-relaxed text-white/70">{data.bio}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-8">
          <XpProgressBar
            locale={locale}
            currentXp={data.totalXp}
            currentLevel={{
              name: data.levelName,
              order: data.levelOrder,
              minXp: data.currentLevelMinXp,
            }}
            nextLevel={
              data.nextLevel
                ? { name: data.nextLevel.name, minXp: data.nextLevel.minXp, order: 0 }
                : null
            }
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-center">
            <div className="text-xs text-white/50">{xpLabel}</div>
            <div className="mt-1 text-xl font-bold text-gold">{data.totalXp}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-center">
            <div className="text-xs text-white/50">{t("closedDeals")}</div>
            <div className="mt-1 text-xl font-bold text-white">{data.closedDeals}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-center">
            <div className="text-xs text-white/50">{t("badges")}</div>
            <div className="mt-1 text-xl font-bold text-white">{data.badgeCount}</div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mt-6 border border-white/12 bg-white/[0.03] p-6">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold">{t("badgesTitle")}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.allBadges.map((b) => (
            <span
              key={b.key}
              className={
                b.earned
                  ? "rounded-full border border-purple-400/25 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-100"
                  : "rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/35"
              }
            >
              {b.name}
            </span>
          ))}
        </div>
      </GlassCard>

      {data.socialLinks && Object.keys(data.socialLinks).length > 0 ? (
        <GlassCard className="mt-6 border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-bold">{t("channels")}</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {Object.entries(data.socialLinks).map(([k, v]) => (
              <li key={k}>
                <span className="text-white/45">{k}: </span>
                {v.startsWith("http") ? (
                  <a href={v} className="text-gold hover:underline" target="_blank" rel="noreferrer">
                    {v}
                  </a>
                ) : (
                  v
                )}
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}

      <GlassCard className="mt-6 border border-gold/20 bg-gold/5 p-6 text-center">
        <h2 className="text-lg font-bold">{t("ctaTitle")}</h2>
        <p className="mt-2 text-sm text-white/65">{t("ctaBody")}</p>
        <Link
          href={registerHref}
          className="mt-5 inline-flex rounded-2xl bg-gradient-to-r from-gold/35 via-gold to-gold-bright px-8 py-3 text-sm font-extrabold text-bg"
        >
          {t("ctaButton")}
        </Link>
      </GlassCard>

      <div
        id="qr-placeholder"
        className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-12 text-center"
      >
        <div className="text-4xl opacity-40" aria-hidden>
          ▦
        </div>
        <p className="mt-3 text-sm font-semibold text-white/50">{t("qrSoon")}</p>
      </div>
    </>
  );
}
