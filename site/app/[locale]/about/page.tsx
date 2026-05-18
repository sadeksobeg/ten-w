import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { RelatedLinks } from "@/components/content/RelatedLinks";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/metadata-helpers";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AboutPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/about"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "AboutPage" });
  const n = await getTranslations({ locale, namespace: "Nav" });

  const relatedLinks = [
    { href: "/solutions", label: n("solutions") },
    { href: "/why-us", label: n("whyUs") },
    { href: "/case-studies", label: n("caseStudies") },
    { href: "/blog", label: n("blog") },
    { href: "/contact", label: n("contact") },
  ];

  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
          {t("hero.title")}
        </h1>
      </Section>

      <Section>
        <div className="max-w-3xl space-y-5 text-muted md:text-lg">
          <p>{t("intro.p1")}</p>
          <p>{t("intro.p2")}</p>
          <p>{t("intro.p3")}</p>
        </div>
      </Section>

      <Section className="bg-surface/40">
        <p className="max-w-3xl font-[family-name:var(--font-cairo)] text-lg font-semibold leading-relaxed text-foreground md:text-xl">
          {t("valuesStatement")}
        </p>
        <div className="mt-8">
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold/90"
          >
            {n("contact")}
          </Link>
        </div>
      </Section>

      <Section className="border-t border-white/10">
        <RelatedLinks title={t("relatedTitle")} links={relatedLinks} />
      </Section>
    </>
  );
}
