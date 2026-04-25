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
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <div className="max-w-3xl">
          <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
            {t("hero.title")}
          </h1>
          <p className="mt-3 text-muted">{t("hero.subtitle")}</p>
        </div>
      </Section>

      <Section>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <Card
              key={p.slug}
              className="flex h-full flex-col border-white/12 p-5 transition-colors hover:border-gold/40 sm:p-6"
            >
              <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                {p.title[cl]}
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted">{p.excerpt[cl]}</p>
              <Link
                href={`/projects/${p.slug}`}
                className="mt-5 inline-flex min-h-10 items-center rounded-md border border-gold/40 px-4 text-sm font-semibold text-gold transition-colors hover:border-gold/70 hover:bg-gold-dim/40"
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
