import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CareersPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/careers"),
  };
}

export default async function CareersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "CareersPage" });

  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-3xl text-muted md:text-lg">{t("subtitle")}</p>
      </Section>

      <Section>
        <Card className="mx-auto max-w-3xl p-6 sm:p-8">
          <p className="leading-relaxed text-muted">{t("body")}</p>
          <h2 className="mt-8 font-[family-name:var(--font-cairo)] text-lg font-bold text-gold">
            {t("valuesTitle")}
          </h2>
          <ul className="mt-4 list-disc space-y-2 ps-5 text-sm text-muted">
            <li>{t("v1")}</li>
            <li>{t("v2")}</li>
            <li>{t("v3")}</li>
          </ul>
          <TrackedLink
            href="/contact?intent=careers&topic=careers"
            eventName="careers_contact"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright"
          >
            {t("cta")}
          </TrackedLink>
        </Card>
      </Section>
    </>
  );
}
