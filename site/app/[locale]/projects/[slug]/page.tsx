import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { fallbackProjects } from "@/lib/fallback-data";
import { routing } from "@/i18n/routing";
import { contentLocale } from "@/lib/locale-content";
import { getProjectBySlug } from "@/lib/strapi";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    fallbackProjects.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale as Locale);
  if (!project) return { title: "Not found" };
  const loc = locale as Locale;
  const cl = contentLocale(locale);
  return {
    title: project.title[cl],
    description: project.excerpt[cl],
    alternates: buildAlternates(loc, `/projects/${slug}`),
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ProjectsPage" });
  const loc = locale as Locale;
  const cl = contentLocale(locale);
  const project = await getProjectBySlug(slug, loc);
  if (!project) notFound();

  return (
    <>
      <Section className="border-b border-white/10 pb-12 pt-10">
        <Link
          href="/projects"
          className="text-sm font-medium text-gold hover:underline"
        >
          ← {t("hero.title")}
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-cairo)] text-3xl font-bold md:text-4xl">
          {project.title[cl]}
        </h1>
        <p className="mt-3 max-w-3xl text-muted">{project.excerpt[cl]}</p>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <h2 className="text-sm font-semibold text-gold">{t("challenge")}</h2>
            <p className="mt-2 text-sm text-muted">{project.challenge[cl]}</p>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold text-gold">{t("solution")}</h2>
            <p className="mt-2 text-sm text-muted">{project.solution[cl]}</p>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold text-gold">{t("results")}</h2>
            <p className="mt-2 text-sm text-muted">{project.results[cl]}</p>
          </Card>
        </div>
      </Section>
    </>
  );
}
