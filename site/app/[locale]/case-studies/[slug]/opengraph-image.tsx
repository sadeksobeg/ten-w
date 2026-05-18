import { getDeepCaseStudy } from "@/lib/case-studies-data";
import { pickLocalized } from "@/lib/locale-content";
import { generateOgImage, ogContentType, ogSize } from "@/lib/og/generate-og-image";

export const alt = "T.E.N.E.G.T.A Case Study";
export const size = ogSize;
export const contentType = ogContentType;

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function Image({ params }: Props) {
  const { locale, slug } = await params;
  const cs = getDeepCaseStudy(slug);
  if (!cs) {
    return generateOgImage({
      locale,
      title: "Case study",
      eyebrow: "T.E.N.E.G.T.A",
    });
  }
  return generateOgImage({
    locale,
    eyebrow: pickLocalized(cs.industry, locale),
    title: pickLocalized(cs.title, locale),
    subtitle: pickLocalized(cs.excerpt, locale),
  });
}
