import { getTranslations } from "next-intl/server";
import { generateOgImage, ogContentType, ogSize } from "@/lib/og/generate-og-image";

export const alt = "TENEGTA Creator Studio";
export const size = ogSize;
export const contentType = ogContentType;

type Props = { params: Promise<{ locale: string }> };

export default async function Image({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Creators.studio" });
  return generateOgImage({
    locale,
    eyebrow: t("eyebrow"),
    title: t("title"),
    subtitle: t("metaDescription"),
  });
}
