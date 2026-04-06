import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WhyUsPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/why-us"),
  };
}

const POINTS = ["p1", "p2", "p3", "p4", "p5"] as const;
const STEPS = ["s1", "s2", "s3", "s4", "s5"] as const;

export default async function WhyUsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "WhyUsPage" });

  return (
    <>
      <Section className="border-b border-white/10 pb-12 pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-bold md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-3xl text-muted md:text-lg">{t("intro")}</p>
        <p className="mt-3 max-w-3xl text-muted md:text-lg">{t("intro2")}</p>
      </Section>

      <Section>
        <ul className="max-w-3xl list-inside list-disc space-y-3 text-muted md:text-base">
          {POINTS.map((key) => (
            <li key={key}>{t(`points.${key}`)}</li>
          ))}
        </ul>
      </Section>

      <Section className="bg-surface/30">
        <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold">
          {t("process.title")}
        </h2>
        <ol className="mt-6 max-w-3xl list-decimal space-y-3 ps-5 text-muted md:text-base">
          {STEPS.map((key) => (
            <li key={key}>{t(`process.${key}`)}</li>
          ))}
        </ol>
        <p className="mt-8 max-w-3xl text-sm font-medium text-foreground md:text-base">
          {t("process.summary")}
        </p>
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold">
          {t("whyNow.title")}
        </h2>
        <p className="mt-3 max-w-3xl text-muted">{t("whyNow.body")}</p>
      </Section>

      <Section className="pb-16">
        <div className="flex flex-wrap gap-4">
          <TrackedLink
            href="/contact"
            eventName="why_us_contact"
            eventParams={{ location: "why_us" }}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright"
          >
            {t("ctaContact")}
          </TrackedLink>
          <TrackedLink
            href="/engagement"
            eventName="why_us_engagement"
            eventParams={{ location: "why_us" }}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-gold/60 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim"
          >
            {t("ctaEngagement")}
          </TrackedLink>
        </div>
      </Section>
    </>
  );
}
