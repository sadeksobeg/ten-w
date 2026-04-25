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
  const t = await getTranslations({ locale, namespace: "EngagementPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/engagement"),
  };
}

export default async function EngagementPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "EngagementPage" });

  const blocks = ["pilot", "project", "retainer"] as const;
  const ctaHref: Record<(typeof blocks)[number], string> = {
    pilot: "/contact?intent=pilot&topic=engagement",
    project: "/contact?intent=project&topic=engagement",
    retainer: "/contact?intent=retain&topic=engagement",
  };

  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-3xl text-muted md:text-lg">{t("subtitle")}</p>
        <p className="mt-4 max-w-2xl text-sm text-muted">{t("pricingNote")}</p>
      </Section>

      <Section>
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          {blocks.map((key) => (
            <Card key={key} className="p-4 sm:p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold text-gold">
                {t(`${key}.title`)}
              </h2>
              <p className="mt-2 text-sm text-muted">{t(`${key}.duration`)}</p>
              <ul className="mt-4 list-disc space-y-2 ps-5 text-sm text-muted md:text-base">
                <li>{t(`${key}.b1`)}</li>
                <li>{t(`${key}.b2`)}</li>
                <li>{t(`${key}.b3`)}</li>
              </ul>
              <TrackedLink
                href={ctaHref[key]}
                eventName="engagement_cta"
                eventParams={{ model: key }}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md border border-gold/60 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim"
              >
                {t(`${key}.ctaLabel`)}
              </TrackedLink>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
