import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { ProjectsFeaturedBento } from "@/components/projects/ProjectsFeaturedBento";
import { ProjectsPortfolioExplorer } from "@/components/projects/ProjectsPortfolioExplorer";
import { ProjectsTrustStrip } from "@/components/projects/ProjectsTrustStrip";
import { groupProjectsByFormat } from "@/components/projects/project-helpers";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { getProjectMeta, type ProjectIndustryKey } from "@/lib/project-meta";
import { deepProjects, formatLabels } from "@/lib/projects-data";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProjectsPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/projects"),
  };
}

const pillarLabel: Record<string, { ar: string; en: string; fr: string }> = {
  ai: { ar: "ذكاء اصطناعي", en: "AI", fr: "IA" },
  cyber: { ar: "أمن سيبراني", en: "Cybersecurity", fr: "Cybersécurité" },
  software: { ar: "برمجيات", en: "Software", fr: "Logiciel" },
  infra: { ar: "بنية تحتية", en: "Infrastructure", fr: "Infrastructure" },
};

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ProjectsPage" });
  const loc = locale as Locale;
  const groups = groupProjectsByFormat(deepProjects);

  const featured = deepProjects.filter((p) => getProjectMeta(p.slug).featured);

  const cardLabels = {
    challenge: t("previewChallenge"),
    approach: t("previewApproach"),
    outcome: t("previewOutcome"),
    readCase: t("readCaseStudy"),
  };

  const industryLabels = {
    government: t("industries.government"),
    fintech: t("industries.fintech"),
    healthcare: t("industries.healthcare"),
    logistics: t("industries.logistics"),
    agriculture: t("industries.agriculture"),
    manufacturing: t("industries.manufacturing"),
    telecom: t("industries.telecom"),
    energy: t("industries.energy"),
    holding: t("industries.holding"),
    education: t("industries.education"),
    retail: t("industries.retail"),
    cyber: t("industries.cyber"),
  } satisfies Record<ProjectIndustryKey, string>;

  const industryBySlug = Object.fromEntries(
    deepProjects.map((p) => [p.slug, getProjectMeta(p.slug).industryKey]),
  );

  const formatLabelMap = {
    website: pickFormatLabel(locale, "website"),
    mobile: pickFormatLabel(locale, "mobile"),
    system: pickFormatLabel(locale, "system"),
  };

  const sectionLabels = {
    website: { title: t("sections.website"), desc: t("sections.websiteDesc") },
    mobile: { title: t("sections.mobile"), desc: t("sections.mobileDesc") },
    system: { title: t("sections.system"), desc: t("sections.systemDesc") },
  };

  const trustItems = [
    { title: t("trust.outcomes.title"), description: t("trust.outcomes.desc") },
    { title: t("trust.scale.title"), description: t("trust.scale.desc") },
    { title: t("trust.security.title"), description: t("trust.security.desc") },
    { title: t("trust.languages.title"), description: t("trust.languages.desc") },
  ];

  const processSteps = [
    { title: t("process.discover.title"), description: t("process.discover.desc") },
    { title: t("process.design.title"), description: t("process.design.desc") },
    { title: t("process.build.title"), description: t("process.build.desc") },
    { title: t("process.launch.title"), description: t("process.launch.desc") },
  ];

  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">
            {t("hero.kicker")}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
            {t("hero.title")}
          </h1>
          <p className="mt-3 text-muted md:text-lg">{t("hero.subtitle")}</p>
          <p className="mt-2 text-sm text-white/45">{t("listDisclaimer")}</p>
        </div>

        <dl className="mt-10 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-white/45">
              {t("stats.projects")}
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-cairo)] text-2xl font-bold text-gold">
              {deepProjects.length}
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-white/45">
              {t("stats.languages")}
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-cairo)] text-2xl font-bold text-foreground">
              3
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-white/45">
              {t("stats.delivery")}
            </dt>
            <dd className="mt-1 text-sm font-medium leading-relaxed text-muted">
              {t("stats.deliveryValue")}
            </dd>
          </div>
        </dl>
      </Section>

      <Section className="py-0 md:py-0">
        <ProjectsFeaturedBento
          projects={featured}
          locale={locale}
          labels={{
            kicker: t("featured.kicker"),
            title: t("featured.title"),
            subtitle: t("featured.subtitle"),
            readCase: t("readCaseStudy"),
            featured: t("featured.badge"),
          }}
        />
      </Section>

      <Section className="py-0 md:py-0">
        <ProjectsTrustStrip
          items={trustItems}
          processTitle={t("process.title")}
          steps={processSteps}
        />
      </Section>

      <Section className="py-0 md:py-0">
        <ProjectsPortfolioExplorer
          groups={groups}
          locale={locale}
          cardLabels={cardLabels}
          pillarLabels={Object.fromEntries(
            Object.entries(pillarLabel).map(([k, v]) => [k, v[loc]]),
          )}
          industryLabels={industryLabels}
          formatLabels={formatLabelMap}
          sectionLabels={sectionLabels}
          filterLabels={{
            allIndustries: t("filters.allIndustries"),
            allFormats: t("filters.allFormats"),
            industry: t("filters.industry"),
            format: t("filters.format"),
            showing: t("filters.showing"),
            clear: t("filters.clear"),
          }}
          industryBySlug={industryBySlug}
        />
      </Section>
    </>
  );
}

function pickFormatLabel(locale: string, format: "website" | "mobile" | "system") {
  const labels = formatLabels[format];
  return labels[locale as keyof typeof labels] ?? labels.en;
}
