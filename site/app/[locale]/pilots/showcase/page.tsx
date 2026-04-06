import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { toVideoEmbedSrc } from "@/lib/video-embed";

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

  const rawUrl = process.env.NEXT_PUBLIC_SHOWCASE_VIDEO_URL?.trim() ?? "";
  const embedSrc = rawUrl ? toVideoEmbedSrc(rawUrl) : null;

  return (
    <>
      <Section className="border-b border-white/10 pb-12 pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-bold md:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="mt-3 max-w-3xl text-muted">{t("hero.subtitle")}</p>
      </Section>

      <Section>
        {embedSrc ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
            <iframe
              src={embedSrc}
              title={t("videoTitle")}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-surface/50 p-10 text-center">
            <p className="max-w-md text-muted">{t("videoPlaceholder")}</p>
            <p className="mt-4 text-xs text-muted/80">{t("videoHint")}</p>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          <TrackedLink
            href="/contact?intent=pilot&topic=showcase"
            eventName="cta_primary_click"
            eventParams={{ location: "pilots_showcase", target: "/contact" }}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright"
          >
            {t("ctaPrimary")}
          </TrackedLink>
          <TrackedLink
            href="/solutions/intelligent-systems"
            eventName="cta_secondary_click"
            eventParams={{ location: "pilots_showcase", target: "/solutions/intelligent-systems" }}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-gold/60 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim"
          >
            {t("ctaSecondary")}
          </TrackedLink>
        </div>
      </Section>
    </>
  );
}
