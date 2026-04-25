import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Suspense } from "react";
import { InteractiveDemoExplore } from "@/components/demos/InteractiveDemoExplore";
import { Section } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DemoExplorePage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/demo/explore"),
  };
}

export default async function DemoExplorePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "DemoExplorePage" });

  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-bold sm:text-3xl md:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{t("hero.subtitle")}</p>
        <p className="mt-4 max-w-2xl text-sm text-muted/90">{t("hero.note")}</p>
      </Section>

      <Section>
        <Suspense
          fallback={
            <div className="mx-auto max-w-2xl animate-pulse rounded-xl border border-white/10 bg-surface-elevated/50 p-4 text-sm text-muted sm:p-8">
              …
            </div>
          }
        >
          <InteractiveDemoExplore />
        </Suspense>
        <div className="mx-auto mt-10 max-w-2xl flex flex-wrap justify-center gap-4">
          <TrackedLink
            href="/solutions/intelligent-systems"
            eventName="cta_tertiary_click"
            eventParams={{ location: "demo_explore", target: "/solutions/intelligent-systems" }}
            className="text-sm font-medium text-gold underline-offset-4 hover:underline"
          >
            {t("linkHowWeBuild")}
          </TrackedLink>
          <TrackedLink
            href="/contact?intent=demo&topic=explore"
            eventName="cta_primary_click"
            eventParams={{ location: "demo_explore", target: "/contact" }}
            className="text-sm font-medium text-gold underline-offset-4 hover:underline"
          >
            {t("linkContact")}
          </TrackedLink>
        </div>
      </Section>
    </>
  );
}
