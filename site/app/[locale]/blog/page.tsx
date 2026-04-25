import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { contentLocale } from "@/lib/locale-content";
import { getBlogPosts } from "@/lib/strapi";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BlogPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/blog"),
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "BlogPage" });
  const loc = locale as Locale;
  const cl = contentLocale(locale);
  const posts = await getBlogPosts(loc);

  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{t("hero.subtitle")}</p>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Card key={post.slug}>
              <p className="text-xs text-muted">{post.date}</p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">
                {post.title[cl]}
              </h2>
              <p className="mt-2 text-sm text-muted">{post.excerpt[cl]}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-block text-sm font-semibold text-gold hover:underline"
              >
                {t("read")}
              </Link>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
