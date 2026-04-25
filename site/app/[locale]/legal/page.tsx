import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LegalPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/legal"),
  };
}

export default async function LegalPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "LegalPage" });

  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{t("hero.subtitle")}</p>
      </Section>

      <Section>
        <ul className="space-y-4 text-muted">
          <li>
            <Link href="/privacy" className="font-semibold text-gold hover:underline">
              {locale === "ar" ? "سياسة الخصوصية" : "Privacy policy"}
            </Link>
          </li>
          <li>
            <Link href="/terms" className="font-semibold text-gold hover:underline">
              {locale === "ar" ? "الشروط والأحكام" : "Terms & conditions"}
            </Link>
          </li>
        </ul>
      </Section>
    </>
  );
}
