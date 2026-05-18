import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { TeamMemberAvatar } from "@/components/team/TeamMemberAvatar";
import { founderProfile, teamPrinciples, workModel } from "@/data/team-data";
import { pickLocalized } from "@/lib/locale-content";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "TeamPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/team"),
  };
}

function displayName(locale: string) {
  return locale === "ar" ? founderProfile.nameAr : founderProfile.name;
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "TeamPage" });

  return (
    <>
      <Section className="border-b border-white/10 pb-12 pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/80">
          {pickLocalized(workModel.subtitle, locale)}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-cairo)] text-3xl font-bold md:text-4xl">
          {pickLocalized(workModel.title, locale)}
        </h1>
        <p className="mt-4 max-w-3xl text-muted md:text-lg">
          {pickLocalized(workModel.description, locale)}
        </p>
      </Section>

      {/* Layer 1 — Founder */}
      <Section className="border-b border-white/10 bg-surface/20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
          {t("founder.eyebrow")}
        </p>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-12">
          <div>
            <TeamMemberAvatar
              portraitAlt={displayName(locale)}
              portraitSrc={founderProfile.portraitSrc}
              envPortraitUrl={process.env.NEXT_PUBLIC_TEAM_LEAD_PORTRAIT_URL}
            />
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <a
                href={founderProfile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gold hover:underline"
              >
                LinkedIn
              </a>
              <a
                href={founderProfile.tryhackme}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gold hover:underline"
              >
                TryHackMe
              </a>
            </div>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold md:text-3xl">
              {displayName(locale)}
            </h2>
            <p className="mt-1 text-gold">{pickLocalized(founderProfile.role, locale)}</p>
            <p className="mt-4 text-lg font-medium text-foreground/95">
              {pickLocalized(founderProfile.tagline, locale)}
            </p>
            <div className="mt-6 space-y-4 whitespace-pre-line text-sm leading-relaxed text-muted md:text-base">
              {pickLocalized(founderProfile.bio, locale)}
            </div>
            <blockquote className="mt-8 border-s-2 border-gold/50 ps-4 text-base italic text-foreground/90 md:text-lg">
              {pickLocalized(founderProfile.philosophy, locale)}
            </blockquote>
          </div>
        </div>
      </Section>

      <Section className="border-b border-white/10">
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold md:text-2xl">
          {pickLocalized(founderProfile.intersection.title, locale)}
        </h2>
        <p className="mt-3 max-w-3xl text-muted">
          {pickLocalized(founderProfile.intersection.description, locale)}
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {founderProfile.intersection.pillars.map((p) => (
            <li key={p.label.en} className="rounded-xl border border-white/10 p-5">
              <span className="text-2xl" aria-hidden>
                {p.icon}
              </span>
              <h3 className="mt-3 font-semibold text-gold">{pickLocalized(p.label, locale)}</h3>
              <p className="mt-1 text-sm text-muted">{pickLocalized(p.note, locale)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="border-b border-white/10 bg-surface/20">
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold md:text-2xl">
          {t("founder.perspectivesTitle")}
        </h2>
        <ul className="mt-6 max-w-4xl space-y-6">
          {founderProfile.perspectives.map((p) => (
            <li key={p.title.en} className="rounded-xl border border-white/10 p-5">
              <h3 className="font-semibold text-foreground">
                {t("founder.on")} {pickLocalized(p.title, locale)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {pickLocalized(p.stance, locale)}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="border-b border-white/10">
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold">
          {t("founder.credentialsTitle")}
        </h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
              {t("founder.certifications")}
            </h3>
            <ul className="mt-3 space-y-2">
              {founderProfile.certifications.map((c) => (
                <li key={c.name} className="text-sm text-muted">
                  <span className="text-foreground/90">{c.name}</span>
                  <span className="text-white/35"> · {c.org}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
              {t("founder.techStack")}
            </h3>
            <ul className="mt-3 space-y-4">
              {founderProfile.techDomains.map((d) => (
                <li key={d.domain.en}>
                  <p className="text-sm font-medium text-gold">{pickLocalized(d.domain, locale)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {d.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Layer 2 — Work model */}
      <Section className="border-b border-white/10 bg-surface/20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/80">
          {t("workModel.eyebrow")}
        </p>
        <p className="mt-4 max-w-3xl text-lg text-muted">
          {pickLocalized(workModel.networkNote, locale)}
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {workModel.benefits.map((b) => (
            <li key={b.title.en}>
              <Card className="h-full p-5">
                <span className="text-2xl" aria-hidden>
                  {b.icon}
                </span>
                <h3 className="mt-3 font-semibold text-gold">{pickLocalized(b.title, locale)}</h3>
                <p className="mt-2 text-sm text-muted">{pickLocalized(b.description, locale)}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      {/* Layer 3 — Methodology */}
      <Section className="border-b border-white/10">
        <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold">
          {t("engagement.title")}
        </h2>
        <ul className="mt-6 max-w-3xl space-y-6">
          <li>
            <h3 className="font-semibold text-gold">{t("engagement.assess")}</h3>
            <p className="mt-2 text-sm text-muted">{pickLocalized(workModel.engagement.assess, locale)}</p>
          </li>
          <li>
            <h3 className="font-semibold text-gold">{t("engagement.staff")}</h3>
            <p className="mt-2 text-sm text-muted">{pickLocalized(workModel.engagement.staff, locale)}</p>
          </li>
          <li>
            <h3 className="font-semibold text-gold">{t("engagement.decline")}</h3>
            <p className="mt-2 text-sm text-muted">{pickLocalized(workModel.engagement.decline, locale)}</p>
          </li>
        </ul>
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold">
          {t("howWeThink.title")}
        </h2>
        <ul className="mt-6 grid max-w-5xl gap-4 md:grid-cols-3">
          {teamPrinciples.map((p) => (
            <li key={p.title.en} className="rounded-xl border border-white/10 p-4">
              <span className="text-2xl" aria-hidden>
                {p.icon}
              </span>
              <h3 className="mt-2 font-semibold text-gold">{pickLocalized(p.title, locale)}</h3>
              <p className="mt-2 text-sm text-muted">{pickLocalized(p.description, locale)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Link
            href="/contact?intent=project&topic=team"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright"
          >
            {t("cta")}
          </Link>
        </div>
      </Section>
    </>
  );
}
