import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { contentLocale } from "@/lib/locale-content";
import { getProjects } from "@/lib/strapi";

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

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ProjectsPage" });
  const loc = locale as Locale;
  const cl = contentLocale(locale);
  const projects = await getProjects(loc);

  return (
    <>
      <Section className="border-b border-white/10 pb-12 pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-bold md:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{t("hero.subtitle")}</p>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.slug}>
              <h2 className="text-lg font-semibold text-foreground">
                {p.title[cl]}
              </h2>
              <p className="mt-2 text-sm text-muted">{p.excerpt[cl]}</p>
              <Link
                href={`/projects/${p.slug}`}
                className="mt-4 inline-block text-sm font-semibold text-gold hover:underline"
              >
                {t("readMore")}
              </Link>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
