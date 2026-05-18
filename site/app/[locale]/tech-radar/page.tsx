import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import radar from "@/data/tech-radar.json";
import { Section } from "@/components/ui/Section";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "TechRadarPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/tech-radar"),
  };
}

const ringColors: Record<string, string> = {
  adopt: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  trial: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  assess: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  hold: "border-red-500/40 bg-red-500/10 text-red-200",
};

export default async function TechRadarPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "TechRadarPage" });

  const byRing = radar.rings.map((ring) => ({
    ring,
    items: radar.items.filter((i) => i.ring === ring),
  }));

  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8">
        <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-bold">{t("title")}</h1>
        <p className="mt-3 max-w-3xl text-muted">{t("subtitle")}</p>
      </Section>
      <Section>
        <div className="grid gap-8 md:grid-cols-2">
          {byRing.map(({ ring, items }) => (
            <div key={ring} className="rounded-xl border border-white/10 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gold">
                {t(`rings.${ring}`)}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {items.map((item) => (
                  <li
                    key={item.name}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${ringColors[ring] ?? ""}`}
                    title={item.quadrant}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
