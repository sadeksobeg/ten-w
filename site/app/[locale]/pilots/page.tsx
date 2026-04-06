import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PilotsPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/pilots"),
  };
}

export default async function PilotsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "PilotsPage" });

  return (
    <>
      <Section className="border-b border-white/10 pb-12 pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-bold md:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{t("hero.subtitle")}</p>
      </Section>

      <Section>
        <p className="max-w-3xl text-muted">{t("body")}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <TrackedLink
            href="/pilots/showcase"
            eventName="cta_secondary_click"
            eventParams={{ location: "pilots_page", target: "/pilots/showcase" }}
            className="inline-flex min-h-11 items-center rounded-md border border-gold/60 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim"
          >
            {t("showcaseLink")}
          </TrackedLink>
          <TrackedLink
            href="/contact?intent=pilot"
            eventName="cta_primary_click"
            eventParams={{ location: "pilots_page", target: "/contact" }}
            className="inline-flex min-h-11 items-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright"
          >
            {t("cta.button")}
          </TrackedLink>
        </div>
      </Section>
    </>
  );
}
