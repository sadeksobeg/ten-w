import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site";
import { buildAlternates } from "@/lib/metadata-helpers";
import { fallbackPosts } from "@/lib/fallback-data";
import { routing } from "@/i18n/routing";
import { contentLocale } from "@/lib/locale-content";
import { getBlogPostBySlug } from "@/lib/strapi";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    fallbackPosts.map((post) => ({ locale, slug: post.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug, locale as Locale);
  if (!post) return { title: "Not found" };
  const loc = locale as Locale;
  const cl = contentLocale(locale);
  return {
    title: post.title[cl],
    description: post.excerpt[cl],
    alternates: buildAlternates(loc, `/blog/${slug}`),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "BlogPage" });
  const loc = locale as Locale;
  const cl = contentLocale(locale);
  const post = await getBlogPostBySlug(slug, loc);
  if (!post) notFound();

  const url = `${getSiteUrl().origin}/${locale}/blog/${slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title[cl],
    datePublished: post.date,
    description: post.excerpt[cl],
    url,
    author: { "@type": "Organization", name: "T.E.N.E.G.T.A" },
    publisher: { "@type": "Organization", name: "T.E.N.E.G.T.A" },
  };

  const body = post.body?.[cl] ?? post.excerpt[cl];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
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
          {post.title[cl]}
        </h1>
      </Section>

      <Section>
        <article className="max-w-3xl">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-muted">
            {body}
          </p>
        </article>
      </Section>

      <Section className="border-t border-white/10 pb-16">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-semibold text-gold">
          {t("relatedTitle")}
        </h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm">
          <li>
            <TrackedLink
              href="/solutions"
              eventName="blog_related_click"
              eventParams={{ target: "solutions_index", slug }}
              className="font-medium text-gold underline-offset-4 hover:underline"
            >
              {t("relatedSolutionsHub")}
            </TrackedLink>
          </li>
          <li>
            <TrackedLink
              href="/demo/explore"
              eventName="blog_related_click"
              eventParams={{ target: "demo", slug }}
              className="font-medium text-gold underline-offset-4 hover:underline"
            >
              {t("relatedDemo")}
            </TrackedLink>
          </li>
          <li>
            <TrackedLink
              href="/solutions/intelligent-systems"
              eventName="blog_related_click"
              eventParams={{ target: "intelligent_systems", slug }}
              className="font-medium text-gold underline-offset-4 hover:underline"
            >
              {t("relatedIntelligentSystems")}
            </TrackedLink>
          </li>
        </ul>
      </Section>
    </>
  );
}
