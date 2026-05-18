import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import statusData from "@/data/status.json";
import { Section } from "@/components/ui/Section";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { pickLocalized } from "@/lib/locale-content";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "StatusPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/status"),
  };
}

export default async function StatusPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "StatusPage" });

  return (
    <>
      <Section className="border-b border-white/10 pb-10 pt-8">
        <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-bold">{t("title")}</h1>
        <p className="mt-3 text-muted">{t("subtitle")}</p>
        <p className="mt-2 text-xs text-white/45">
          {t("updated")}: {new Date(statusData.updatedAt).toLocaleString(locale)}
        </p>
      </Section>
      <Section>
        <ul className="mx-auto max-w-2xl divide-y divide-white/10 rounded-xl border border-white/10">
          {statusData.components.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6"
            >
              <span className="font-medium">
                {pickLocalized(c.name as { ar: string; en: string; fr?: string }, locale)}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                  c.status === "operational"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-amber-500/15 text-amber-200"
                }`}
              >
                {t(`status.${c.status}`)}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
