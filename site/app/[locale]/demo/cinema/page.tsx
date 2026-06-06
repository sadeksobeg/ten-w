import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { CinemaDemoExperience } from "@/components/cinema-demo/CinemaDemoExperience";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CinemaDemo" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/demo/cinema"),
    robots: { index: false, follow: false },
  };
}

export default async function CinemaDemoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CinemaDemoExperience />;
}
