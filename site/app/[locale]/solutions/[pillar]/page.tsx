import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { PillarSimPage } from "@/components/solutions/PillarSimPage";
import {
  isPillarSlug,
  type PillarSlug,
} from "@/components/solutions/pillar-types";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string; pillar: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, pillar } = await params;
  if (!isPillarSlug(pillar)) return {};
  const t = await getTranslations({
    locale,
    namespace: "SolutionPillarSim",
  });
  const p = pillar as PillarSlug;
  return {
    title: t(`${p}.meta.title`),
    description: t(`${p}.meta.description`),
    alternates: buildAlternates(locale as Locale, `/solutions/${pillar}`),
  };
}

export function generateStaticParams() {
  return (["ai", "cyber", "software", "infra"] as const).map((pillar) => ({
    pillar,
  }));
}

export default async function SolutionPillarPage({ params }: Props) {
  const { locale, pillar } = await params;
  if (!isPillarSlug(pillar)) notFound();
  setRequestLocale(locale);
  return <PillarSimPage pillar={pillar} />;
}
