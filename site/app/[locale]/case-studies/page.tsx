import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { fallbackCaseStudies } from "@/lib/fallback-data";
import { contentLocale } from "@/lib/locale-content";

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
  const loc = locale as Locale;
  const cl = contentLocale(locale);

  return (
    <>
      <Section className="border-b border-white/10 pb-12 pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-bold md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-3xl text-muted md:text-lg">{t("subtitle")}</p>
      </Section>

      <Section>
        <ul className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {fallbackCaseStudies.map((cs) => (
            <li key={cs.slug}>
              <Card className="flex h-full flex-col p-6">
                <h2 className="font-[family-name:var(--font-cairo)] text-xl font-semibold text-gold">
                  {cs.title[cl]}
                </h2>
                <p className="mt-2 flex-1 text-sm text-muted">{cs.excerpt[cl]}</p>
                <Link
                  href={`/case-studies/${cs.slug}`}
                  className="mt-4 inline-flex text-sm font-medium text-gold underline-offset-4 hover:underline"
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
