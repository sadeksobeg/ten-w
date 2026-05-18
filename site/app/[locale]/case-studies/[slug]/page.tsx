import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyJsonLd } from "@/components/jsonld/CaseStudyJsonLd";
import { RelatedLinks } from "@/components/content/RelatedLinks";
import { Section } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { getDeepCaseStudy, deepCaseStudies } from "@/lib/case-studies-data";
import { pickLocalized } from "@/lib/locale-content";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    deepCaseStudies.map((c) => ({ locale, slug: c.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const cs = getDeepCaseStudy(slug);
  if (!cs) return { title: "Not found" };
  const loc = locale as Locale;
  return {
    title: `${pickLocalized(cs.title, locale)} – T.E.N.E.G.T.A`,
    description: pickLocalized(cs.excerpt, locale),
    alternates: buildAlternates(loc, `/case-studies/${slug}`),
  };
}

function ProseBlock({ text }: { text: string }) {
  return (
    <div className="mt-2 max-w-3xl space-y-4 whitespace-pre-line text-muted">{text}</div>
  );
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const cs = getDeepCaseStudy(slug);
  if (!cs) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "CaseStudiesPage" });

  const related = cs.relatedSlugs
    .map((s) => {
      const r = getDeepCaseStudy(s);
      if (!r) return null;
      return {
        href: `/case-studies/${s}`,
        label: pickLocalized(r.title, locale),
      };
    })
    .filter((x): x is { href: string; label: string } => x !== null);

  return (
    <>
      <CaseStudyJsonLd
        title={pickLocalized(cs.title, locale)}
        description={pickLocalized(cs.excerpt, locale)}
        urlPath={`/case-studies/${slug}`}
      />
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <Link
          href="/case-studies"
          className="text-sm font-medium text-gold hover:underline"
        >
          ← {t("backToList")}
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold/80">
          {pickLocalized(cs.industry, locale)} · {pickLocalized(cs.clientArchetype, locale)}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
          {pickLocalized(cs.title, locale)}
        </h1>
        <p className="mt-3 max-w-3xl text-muted md:text-lg">{pickLocalized(cs.excerpt, locale)}</p>
        {cs.readingTime ? (
          <p className="mt-2 text-xs text-white/40">
            {cs.readingTime} min read
          </p>
        ) : null}
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold">{t("problem")}</h2>
        <ProseBlock text={pickLocalized(cs.problem, locale)} />
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold">{t("approach")}</h2>
        <ProseBlock text={pickLocalized(cs.approach, locale)} />
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold">
          {t("architecturalDecisions")}
        </h2>
        <ul className="mt-4 max-w-3xl space-y-6">
          {cs.architecturalDecisions.map((d, i) => (
            <li key={i} className="rounded-xl border border-white/10 p-4">
              <h3 className="font-semibold text-gold">
                {pickLocalized(d.title, locale)}
              </h3>
              <p className="mt-2 text-sm text-muted">{pickLocalized(d.rationale, locale)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold">
          {t("technicalChallenges")}
        </h2>
        <ul className="mt-4 max-w-3xl space-y-6">
          {cs.technicalChallenges.map((c, i) => (
            <li key={i} className="rounded-xl border border-white/10 p-4">
              <p className="font-medium text-foreground">
                {pickLocalized(c.challenge, locale)}
              </p>
              <p className="mt-2 text-sm text-muted">{pickLocalized(c.resolution, locale)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold">{t("architecture")}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {cs.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/75"
            >
              {tech}
            </span>
          ))}
        </div>
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold">{t("results")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cs.metrics.map((m, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-surface-elevated/50 p-4 text-center"
            >
              <div
                className={`text-2xl font-bold ${
                  m.direction === "down"
                    ? "text-emerald-400"
                    : m.direction === "up"
                      ? "text-gold"
                      : "text-foreground"
                }`}
              >
                {m.value}
              </div>
              <p className="mt-1 text-xs text-muted">{pickLocalized(m.label, locale)}</p>
            </div>
          ))}
        </div>
      </Section>

      {cs.clientQuote ? (
        <Section className="border-y border-white/10 bg-surface/20">
          <blockquote className="max-w-3xl text-lg font-medium text-foreground">
            &ldquo;{pickLocalized(cs.clientQuote.quote, locale)}&rdquo;
          </blockquote>
          <footer className="mt-3 flex items-center gap-3 text-sm text-muted">
            {cs.clientQuote.initials ? (
              <span
                className="flex size-9 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold"
                aria-hidden
              >
                {cs.clientQuote.initials}
              </span>
            ) : null}
            <span>
              {pickLocalized(cs.clientQuote.role, locale)} —{" "}
              {pickLocalized(cs.clientQuote.org, locale)}
            </span>
          </footer>
        </Section>
      ) : null}

      <Section>
        <p className="max-w-3xl text-sm text-muted">{t("detailDisclaimer")}</p>
      </Section>

      {related.length > 0 ? (
        <Section>
          <RelatedLinks title={t("relatedStudies")} links={related} />
        </Section>
      ) : null}

      <Section className="pb-16">
        <div className="flex flex-wrap gap-4">
          <TrackedLink
            href="/contact?intent=project&topic=case_study"
            eventName="case_study_contact"
            eventParams={{ slug }}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright"
          >
            {t("ctaDiscuss")}
          </TrackedLink>
          <TrackedLink
            href={`/solutions/${cs.pillar}`}
            eventName="case_study_pillar"
            eventParams={{ slug, pillar: cs.pillar }}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-gold/60 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim"
          >
            {t("ctaPillar")}
          </TrackedLink>
          <TrackedLink
            href="/demo/explore"
            eventName="case_study_demo"
            eventParams={{ slug }}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/20 px-5 py-2.5 text-sm font-semibold text-foreground hover:border-gold/40"
          >
            {t("ctaDemo")}
          </TrackedLink>
        </div>
      </Section>
    </>
  );
}
