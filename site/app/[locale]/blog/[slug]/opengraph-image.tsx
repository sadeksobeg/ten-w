import { getBlogPostBySlug } from "@/lib/blog";
import { pickLocalized } from "@/lib/locale-content";
import { generateOgImage, ogContentType, ogSize } from "@/lib/og/generate-og-image";

export const alt = "T.E.N.E.G.T.A Blog";
export const size = ogSize;
export const contentType = ogContentType;

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function Image({ params }: Props) {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug, locale);
  if (!post) {
    return generateOgImage({ locale, title: "Blog", eyebrow: "T.E.N.E.G.T.A" });
  }
  return generateOgImage({
    locale,
    eyebrow: "Blog",
    title: pickLocalized(post.title, locale),
    subtitle: pickLocalized(post.excerpt, locale),
  });
}
