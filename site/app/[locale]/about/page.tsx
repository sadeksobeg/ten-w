import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { buildAlternates } from "@/lib/metadata-helpers";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AboutPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/about"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "AboutPage" });

  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
          {t("hero.title")}
        </h1>
      </Section>

      <Section>
        <div className="max-w-3xl space-y-5 text-muted md:text-lg">
          <p>{t("intro.p1")}</p>
          <p>{t("intro.p2")}</p>
          <p>{t("intro.p3")}</p>
        </div>
      </Section>

      <Section className="bg-surface/40">
        <p className="max-w-3xl font-[family-name:var(--font-cairo)] text-lg font-semibold leading-relaxed text-foreground md:text-xl">
          {t("valuesStatement")}
        </p>
      </Section>
    </>
  );
}
