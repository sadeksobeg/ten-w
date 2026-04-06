import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "InvestorsPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/investors"),
  };
}

export default async function InvestorsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "InvestorsPage" });

  const blocks = [
    "thesis",
    "opportunity",
    "model",
    "governance",
    "ir",
  ] as const;

  return (
    <>
      <Section className="border-b border-white/10 pb-14 pt-10 md:pb-16 md:pt-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold/85">
          {t("hero.kicker")}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-cairo)] text-3xl font-bold md:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {t("hero.title")}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-muted md:text-lg">{t("hero.subtitle")}</p>
      </Section>

      {blocks.map((key) => (
        <Section
          key={key}
          className={key === "ir" ? "bg-surface/25" : ""}
        >
          <h2 className="font-[family-name:var(--font-cairo)] text-xl font-bold text-gold md:text-2xl">
            {t(`${key}.title`)}
          </h2>
          <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted md:text-base">
            {t(`${key}.body`)}
          </p>
        </Section>
      ))}

      <Section className="border-t border-white/10 pb-20 pt-6">
        <TrackedLink
          href="/contact?intent=investors"
          eventName="investors_ir_contact"
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-gold px-8 py-3 text-sm font-semibold text-bg hover:bg-gold-bright"
        >
          {t("cta")}
        </TrackedLink>
        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted/90 md:text-sm">
          {t("disclaimer")}
        </p>
      </Section>
    </>
  );
}
