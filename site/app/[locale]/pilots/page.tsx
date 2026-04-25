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
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <div className="max-w-3xl">
          <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
            {t("hero.title")}
          </h1>
          <p className="mt-3 text-muted">{t("hero.subtitle")}</p>
        </div>
      </Section>

      <Section>
        <div className="max-w-4xl rounded-2xl border border-white/10 bg-surface-elevated/70 p-5 shadow-lg shadow-black/20 sm:p-7">
          <p className="text-muted">{t("body")}</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <TrackedLink
            href="/pilots/showcase"
            eventName="cta_secondary_click"
            eventParams={{ location: "pilots_page", target: "/pilots/showcase" }}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-gold/60 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim sm:w-auto"
          >
            {t("showcaseLink")}
          </TrackedLink>
          <TrackedLink
            href="/contact?intent=pilot"
            eventName="cta_primary_click"
            eventParams={{ location: "pilots_page", target: "/contact" }}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright sm:w-auto"
          >
            {t("cta.button")}
          </TrackedLink>
        </div>
      </Section>
    </>
  );
}
