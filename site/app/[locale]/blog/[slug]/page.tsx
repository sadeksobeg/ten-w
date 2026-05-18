import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RelatedLinks } from "@/components/content/RelatedLinks";
import { ArticleJsonLd } from "@/components/jsonld/ArticleJsonLd";
import { Section } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { getBlogPostBySlug, getMdxPostSlugs } from "@/lib/blog";
import { pickLocalized } from "@/lib/locale-content";
import { routing } from "@/i18n/routing";
import { fallbackPosts } from "@/lib/fallback-data";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const mdx = getMdxPostSlugs();
  const slugs = mdx.length > 0 ? mdx : fallbackPosts.map((p) => p.slug);
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug, locale);
  if (!post) return { title: "Not found" };
  const loc = locale as Locale;
  return {
    title: pickLocalized(post.title, locale),
    description: pickLocalized(post.excerpt, locale),
    alternates: buildAlternates(loc, `/blog/${slug}`),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "BlogPage" });
  const post = await getBlogPostBySlug(slug, locale);
  if (!post) notFound();

  const relatedLinks = [
    { href: "/solutions", label: t("relatedSolutionsHub") },
    { href: "/demo/explore", label: t("relatedDemo") },
    ...(post.relatedCaseStudy
      ? [
          {
            href: `/case-studies/${post.relatedCaseStudy}`,
            label: t("relatedCaseStudy"),
          },
        ]
      : []),
  ];

  return (
    <>
      <ArticleJsonLd
        title={pickLocalized(post.title, locale)}
        description={pickLocalized(post.excerpt, locale)}
        datePublished={post.date}
        urlPath={`/${locale}/blog/${slug}`}
      />
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <Link
          href="/blog"
          className="text-sm font-medium text-gold hover:underline"
        >
          ← {t("hero.title")}
        </Link>
        <p className="mt-4 text-xs text-muted">{post.date}</p>
        <h1 className="mt-2 font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
          {pickLocalized(post.title, locale)}
        </h1>
        <p className="mt-3 max-w-3xl text-muted">{pickLocalized(post.excerpt, locale)}</p>
      </Section>

      <Section>
        <article className="prose prose-invert max-w-3xl prose-headings:font-[family-name:var(--font-cairo)] prose-a:text-gold">
          {post.content}
        </article>
      </Section>

      <Section className="border-t border-white/10 pb-16">
        <RelatedLinks title={t("relatedTitle")} links={relatedLinks} />
        <div className="mt-8">
          <TrackedLink
            href="/contact?intent=consult&topic=blog"
            eventName="blog_cta_contact"
            eventParams={{ slug }}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright"
          >
            {t("ctaContact")}
          </TrackedLink>
        </div>
      </Section>
    </>
  );
}
