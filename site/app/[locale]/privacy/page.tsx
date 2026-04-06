import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PrivacyPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/privacy"),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "PrivacyPage" });

  const sectionKeys = [
    "controller",
    "collect",
    "purposes",
    "legalBasis",
    "cookies",
    "retention",
    "rights",
    "transfers",
    "children",
    "contact",
    "changes",
  ] as const;

  return (
    <>
      <Section className="border-b border-white/10 pb-12 pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-bold md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("lastUpdated")}</p>
      </Section>
      <Section>
        <p className="max-w-3xl text-muted leading-relaxed">{t("intro")}</p>
        <div className="mt-10 space-y-10">
          {sectionKeys.map((key) => (
            <section key={key} className="max-w-3xl">
              <h2 className="font-[family-name:var(--font-cairo)] text-xl font-semibold text-gold">
                {t(`sections.${key}.title`)}
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-muted leading-relaxed">
                {t(`sections.${key}.body`)}
              </p>
            </section>
          ))}
        </div>
      </Section>
    </>
  );
}
