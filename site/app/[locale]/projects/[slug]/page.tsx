import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectAtAGlance } from "@/components/projects/ProjectAtAGlance";
import { ProjectCtaBand } from "@/components/projects/ProjectCtaBand";
import { ProjectDeliveryProcess } from "@/components/projects/ProjectDeliveryProcess";
import { ProjectMetricsStrip } from "@/components/projects/ProjectMetricsStrip";
import { ProjectQuoteBlock } from "@/components/projects/ProjectQuoteBlock";
import { RelatedLinks } from "@/components/content/RelatedLinks";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { pickLocalized } from "@/lib/locale-content";
import { deepProjects, getDeepProject } from "@/lib/projects-data";
import { accentGradients, getProjectMeta } from "@/lib/project-meta";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    deepProjects.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getDeepProject(slug);
  if (!project) return { title: "Not found" };
  const loc = locale as Locale;
  return {
    title: `${pickLocalized(project.title, locale)} – T.E.N.E.G.T.A`,
    description: pickLocalized(project.excerpt, locale),
    alternates: buildAlternates(loc, `/projects/${slug}`),
  };
}

function ProseBlock({ text }: { text: string }) {
  return (
    <div className="mt-3 max-w-none space-y-4 whitespace-pre-line text-base leading-8 text-muted">
      {text}
    </div>
  );
}

function SectionBlock({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-white/10 py-10 last:border-0 md:py-12">
      <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold sm:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const project = getDeepProject(slug);
  if (!project) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ProjectsPage" });

  const related = project.relatedSlugs
    .map((s) => {
      const r = getDeepProject(s);
      if (!r) return null;
      return {
        href: `/projects/${s}`,
        label: pickLocalized(r.title, locale),
      };
    })
    .filter((x): x is { href: string; label: string } => x !== null);

  const glanceLabels = {
    title: t("atAGlance"),
    industry: t("industry"),
    client: t("clientProfile"),
    timeline: t("timeline"),
    scope: t("scope"),
    services: t("services"),
    delivery: t("deliveryTypes"),
    technologies: t("technologies"),
  };

  const meta = getProjectMeta(slug);

  const deliverySteps = [
    { title: t("process.discover.title"), description: t("process.discover.desc") },
    { title: t("process.design.title"), description: t("process.design.desc") },
    { title: t("process.build.title"), description: t("process.build.desc") },
    { title: t("process.launch.title"), description: t("process.launch.desc") },
  ];

  return (
    <>
      <Section
        className={`relative overflow-hidden border-b border-white/10 pb-10 pt-8 sm:pb-14 sm:pt-10`}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentGradients[meta.accent]} opacity-60`}
          aria-hidden
        />
        <div className="relative">
        <Link
          href="/projects"
          className="text-sm font-medium text-gold hover:underline"
        >
          ← {t("backToList")}
        </Link>

        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-gold">
          {pickLocalized(project.industry, locale)}
        </p>
        <h1 className="mt-2 max-w-4xl font-[family-name:var(--font-cairo)] text-2xl font-bold leading-tight sm:text-3xl md:text-4xl lg:text-[2.75rem]">
          {pickLocalized(project.title, locale)}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted md:text-xl">
          {pickLocalized(project.excerpt, locale)}
        </p>

        <ProjectMetricsStrip project={project} locale={locale} />
        </div>
      </Section>

      <Section className="py-0 md:py-0">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <SectionBlock id="context" title={t("context")}>
              <ProseBlock text={pickLocalized(project.context, locale)} />
            </SectionBlock>

            <SectionBlock id="challenge" title={t("challenge")}>
              <ProseBlock text={pickLocalized(project.challenge, locale)} />
            </SectionBlock>

            <SectionBlock id="approach" title={t("approach")}>
              <ProseBlock text={pickLocalized(project.solution, locale)} />
            </SectionBlock>

            {project.clientQuote ? (
              <ProjectQuoteBlock
                quote={project.clientQuote}
                locale={locale}
                disclaimer={t("quoteDisclaimer")}
              />
            ) : null}

            <ProjectDeliveryProcess title={t("process.title")} steps={deliverySteps} />

            <SectionBlock id="deliverables" title={t("deliverables")}>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {project.deliverables.map((d, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                  >
                    <h3 className="font-semibold text-gold">
                      {pickLocalized(d.title, locale)}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      {pickLocalized(d.description, locale)}
                    </p>
                  </li>
                ))}
              </ul>
            </SectionBlock>

            <SectionBlock id="results" title={t("results")}>
              <ProseBlock text={pickLocalized(project.results, locale)} />
            </SectionBlock>

            <SectionBlock id="technologies" title={t("techStack")}>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/75"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </SectionBlock>

            <p className="py-8 text-sm text-white/45">{t("detailDisclaimer")}</p>
          </div>

          <div className="lg:pt-10">
            <ProjectAtAGlance
              project={project}
              locale={locale}
              labels={glanceLabels}
            />
          </div>
        </div>
      </Section>

      {related.length > 0 ? (
        <Section className="border-t border-white/10">
          <RelatedLinks title={t("relatedProjects")} links={related} />
        </Section>
      ) : null}

      <ProjectCtaBand
        title={t("ctaBandTitle")}
        subtitle={t("ctaBandSubtitle")}
        primaryLabel={t("ctaDiscuss")}
        secondaryLabel={t("ctaPillar")}
        slug={slug}
        pillar={project.pillar}
      />
    </>
  );
}
