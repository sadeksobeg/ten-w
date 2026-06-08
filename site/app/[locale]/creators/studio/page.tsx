import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { CreatorStudioLanding } from "@/components/creators/CreatorStudioLanding";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Creators.studio" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates(locale as Locale, "/creators/studio"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
    },
  };
}

export default async function CreatorStudioPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CreatorStudioLanding />;
}
