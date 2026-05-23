import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { AscendLanding } from "@/components/ascend/AscendLanding";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Ascend.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale as Locale, "/ascend"),
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function AscendProductPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AscendLanding />;
}
