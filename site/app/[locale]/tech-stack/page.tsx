import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { techStackItems } from "@/lib/fallback-data";
import { buildAlternates } from "@/lib/metadata-helpers";
import { TechStackShowcase } from "@/components/tech/TechStackShowcase";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "TechPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/tech-stack"),
  };
}

export default async function TechStackPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TechStackShowcase items={techStackItems} />;
}
