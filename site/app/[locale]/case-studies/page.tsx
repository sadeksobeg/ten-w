import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { deepCaseStudies } from "@/lib/case-studies-data";
import { pickLocalized } from "@/lib/locale-content";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CaseStudiesPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/case-studies"),
  };
}

export default async function CaseStudiesIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "CaseStudiesPage" });
  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-3xl text-muted md:text-lg">{t("subtitle")}</p>
      </Section>

      <Section>
        <ul className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {deepCaseStudies.map((cs) => (
            <li key={cs.slug}>
              <Card className="flex h-full flex-col border-white/12 p-5 transition-colors hover:border-gold/40 sm:p-6">
                <h2 className="font-[family-name:var(--font-cairo)] text-xl font-semibold text-gold">
                  {pickLocalized(cs.title, locale)}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-7 text-muted">
                  {pickLocalized(cs.excerpt, locale)}
                </p>
                <Link
                  href={`/case-studies/${cs.slug}`}
                  className="mt-5 inline-flex min-h-10 items-center rounded-md border border-gold/40 px-4 text-sm font-semibold text-gold transition-colors hover:border-gold/70 hover:bg-gold-dim/40"
                >
                  {t("readStudy")}
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
