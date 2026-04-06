import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { DemoKpiStrip } from "@/components/demos/DemoKpiStrip";
import { SystemFlow } from "@/components/visuals/SystemFlow";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "IntelligentSystemsPage",
  });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(
      locale as Locale,
      "/solutions/intelligent-systems",
    ),
  };
}

export default async function IntelligentSystemsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: "IntelligentSystemsPage",
  });

  return (
    <>
      <Section className="border-b border-white/10 pb-12 pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-bold md:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="mt-3 max-w-3xl text-muted md:text-lg">{t("hero.subtitle")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <TrackedLink
            href="/demo/explore"
            eventName="cta_primary_click"
            eventParams={{ location: "intelligent_systems_hero", target: "/demo/explore" }}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright"
          >
            {t("hero.ctaDemo")}
          </TrackedLink>
          <TrackedLink
            href="/contact"
            eventName="cta_secondary_click"
            eventParams={{ location: "intelligent_systems_hero", target: "/contact" }}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-gold/60 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim"
          >
            {t("hero.ctaContact")}
          </TrackedLink>
          <TrackedLink
            href="/projects"
            eventName="cta_tertiary_click"
            eventParams={{ location: "intelligent_systems_hero", target: "/projects" }}
            className="inline-flex min-h-11 items-center justify-center rounded-md px-3 py-2.5 text-sm font-medium text-muted underline-offset-4 hover:text-foreground"
          >
            {t("hero.ctaProjects")}
          </TrackedLink>
        </div>
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold">
          {t("flow.title")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t("flow.caption")}</p>
        <div className="mt-8 rounded-xl border border-white/10 bg-surface/40 p-4 md:p-6">
          <SystemFlow />
        </div>
      </Section>

      <Section className="bg-surface/30">
        <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold">
          {t("demo.title")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t("demo.caption")}</p>
        <div className="mt-8">
          <DemoKpiStrip />
        </div>
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold">
          {t("useCases.title")}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {(["one", "two", "three"] as const).map((key) => (
            <Card key={key}>
              <h3 className="text-base font-semibold text-gold">
                {t(`useCases.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {t(`useCases.${key}.body`)}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="border-t border-white/10 bg-surface/40">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold">
              {t("bottomCta.title")}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              {t("bottomCta.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TrackedLink
              href="/contact?intent=pilot&topic=systems"
              eventName="cta_primary_click"
              eventParams={{ location: "intelligent_systems_footer", target: "contact" }}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright"
            >
              {t("bottomCta.primary")}
            </TrackedLink>
            <TrackedLink
              href="/contact?intent=consult"
              eventName="cta_secondary_click"
              eventParams={{ location: "intelligent_systems_footer", target: "contact_consult" }}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-gold/60 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim"
            >
              {t("bottomCta.secondary")}
            </TrackedLink>
          </div>
        </div>
      </Section>
    </>
  );
}
