import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { CinemaDemoClient } from "@/components/cinema-demo/CinemaDemoClient";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ presenter?: string; phase?: string }>;
};

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

export default async function CinemaDemoPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { presenter, phase } = await searchParams;
  setRequestLocale(locale);

  return <CinemaDemoClient presenter={presenter === "1"} phase={phase} />;
}
