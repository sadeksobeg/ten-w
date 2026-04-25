import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import {
  fallbackCaseStudies,
  getCaseStudyBySlug,
} from "@/lib/fallback-data";
import { routing } from "@/i18n/routing";
import { contentLocale } from "@/lib/locale-content";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    fallbackCaseStudies.map((c) => ({ locale, slug: c.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) return { title: "Not found" };
  const cl = contentLocale(locale);
  const loc = locale as Locale;
  return {
    title: `${cs.title[cl]} – T.E.N.E.G.T.A`,
    description: cs.excerpt[cl],
    alternates: buildAlternates(loc, `/case-studies/${slug}`),
  };
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "CaseStudiesPage" });
  const loc = locale as Locale;
  const cl = contentLocale(locale);

  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <Link
          href="/case-studies"
          className="text-sm font-medium text-gold hover:underline"
        >
          ← {t("backToList")}
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
          {cs.title[cl]}
        </h1>
        <p className="mt-3 max-w-3xl text-muted md:text-lg">{cs.excerpt[cl]}</p>
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold">
          {t("problem")}
        </h2>
        <p className="mt-2 max-w-3xl text-muted">{cs.problem[cl]}</p>
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold">
          {t("approach")}
        </h2>
        <p className="mt-2 max-w-3xl text-muted">{cs.approach[cl]}</p>
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold">
          {t("architecture")}
        </h2>
        <p className="mt-2 max-w-3xl text-muted">{cs.architecture[cl]}</p>
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold">
          {t("results")}
        </h2>
        <p className="mt-2 max-w-3xl text-muted">{cs.results[cl]}</p>
      </Section>

      <Section>
        <p className="max-w-3xl text-sm text-muted">{t("detailDisclaimer")}</p>
      </Section>

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
            href="/demo/explore"
            eventName="case_study_demo"
            eventParams={{ slug }}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-gold/60 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim"
          >
            {t("ctaDemo")}
          </TrackedLink>
        </div>
      </Section>
    </>
  );
}
