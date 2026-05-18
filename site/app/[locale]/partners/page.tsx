import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { ecosystemPartners } from "@/data/partners-ecosystem";
import { pickLocalized } from "@/lib/locale-content";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PartnersPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/partners"),
  };
}

export default async function PartnersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "PartnersPage" });

  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-3xl text-muted md:text-lg">{t("subtitle")}</p>
        <p className="mt-4 max-w-2xl text-sm text-white/45">{t("note")}</p>
      </Section>

      <Section>
        <ul className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ecosystemPartners.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-white/10 bg-surface/40 px-5 py-4 transition-colors hover:border-gold/35"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gold/70">
                {pickLocalized(p.category, locale)}
              </p>
              <p className="mt-2 font-medium text-foreground">{p.name}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-4">
          <TrackedLink
            href="/tech-stack"
            eventName="partners_tech_stack"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-gold/50 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim"
          >
            {t("ctaTech")}
          </TrackedLink>
          <TrackedLink
            href="/contact?topic=partners"
            eventName="partners_contact"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright"
          >
            {t("ctaContact")}
          </TrackedLink>
        </div>
      </Section>
    </>
  );
}
