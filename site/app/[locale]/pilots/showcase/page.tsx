import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { PilotsShowcaseAnimation } from "@/components/pilots/PilotsShowcaseAnimation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PilotsShowcasePage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/pilots/showcase"),
  };
}

export default async function PilotsShowcasePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "PilotsShowcasePage" });

  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="mt-3 max-w-3xl text-muted">{t("hero.subtitle")}</p>
      </Section>

      <Section>
        <div className="mx-auto max-w-5xl space-y-8">
          <PilotsShowcaseAnimation />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-surface-elevated/70 p-5 shadow-lg shadow-black/20 sm:p-7">
              <p className="text-xs font-semibold text-gold">{t("sections.what.title")}</p>
              <p className="mt-2 text-sm leading-7 text-muted">{t("sections.what.body")}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/80" />
                  <span>{t("sections.what.b1")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/80" />
                  <span>{t("sections.what.b2")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/80" />
                  <span>{t("sections.what.b3")}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface-elevated/70 p-5 shadow-lg shadow-black/20 sm:p-7">
              <p className="text-xs font-semibold text-gold">{t("sections.deliver.title")}</p>
              <p className="mt-2 text-sm leading-7 text-muted">
                {t("sections.deliver.body")}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/80" />
                  <span>{t("sections.deliver.b1")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/80" />
                  <span>{t("sections.deliver.b2")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/80" />
                  <span>{t("sections.deliver.b3")}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-surface-elevated/70 p-5 shadow-lg shadow-black/20 sm:p-7">
            <p className="text-xs font-semibold text-gold">{t("sections.samples.title")}</p>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
              {t("sections.samples.body")}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-foreground">{t("sections.samples.c1.title")}</p>
                <p className="mt-2 text-sm leading-7 text-muted">{t("sections.samples.c1.body")}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-foreground">{t("sections.samples.c2.title")}</p>
                <p className="mt-2 text-sm leading-7 text-muted">{t("sections.samples.c2.body")}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-foreground">{t("sections.samples.c3.title")}</p>
                <p className="mt-2 text-sm leading-7 text-muted">{t("sections.samples.c3.body")}</p>
              </div>
            </div>
            <p className="mt-5 text-xs text-muted/80">{t("sections.samples.disclaimer")}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <TrackedLink
            href="/contact?intent=pilot&topic=showcase"
            eventName="cta_primary_click"
            eventParams={{ location: "pilots_showcase", target: "/contact" }}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright sm:w-auto"
          >
            {t("ctaPrimary")}
          </TrackedLink>
          <TrackedLink
            href="/solutions/intelligent-systems"
            eventName="cta_secondary_click"
            eventParams={{ location: "pilots_showcase", target: "/solutions/intelligent-systems" }}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-gold/60 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim sm:w-auto"
          >
            {t("ctaSecondary")}
          </TrackedLink>
        </div>
      </Section>
    </>
  );
}
