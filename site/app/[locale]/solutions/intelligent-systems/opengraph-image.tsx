import { getTranslations } from "next-intl/server";
import { generateOgImage, ogContentType, ogSize } from "@/lib/og/generate-og-image";

export const alt = "Intelligent systems – T.E.N.E.G.T.A";
export const size = ogSize;
export const contentType = ogContentType;

type Props = { params: Promise<{ locale: string }> };

export default async function Image({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "IntelligentSystemsPage" });
  return generateOgImage({
    locale,
    eyebrow: "Solutions",
    title: t("hero.title"),
    subtitle: t("hero.subtitle"),
  });
}
