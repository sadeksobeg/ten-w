import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { TeamMemberAvatar } from "@/components/team/TeamMemberAvatar";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import type { Locale } from "@/i18n/routing";
import { fallbackTeam } from "@/lib/fallback-data";
import { contentLocale } from "@/lib/locale-content";
import { buildAlternates } from "@/lib/metadata-helpers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "TeamPage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/team"),
  };
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "TeamPage" });
  const loc = locale as Locale;
  const cl = contentLocale(locale);

  return (
    <>
      <Section className="border-b border-white/10 pb-12 pt-10">
        <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-bold md:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{t("hero.subtitle")}</p>
      </Section>

      <Section>
        <div className="mx-auto grid max-w-lg gap-6">
          {fallbackTeam.map((m) => (
            <Card key={m.name.en}>
              <TeamMemberAvatar
                portraitAlt={m.portraitAlt[cl]}
                portraitSrc={m.portraitSrc}
                envPortraitUrl={process.env.NEXT_PUBLIC_TEAM_LEAD_PORTRAIT_URL}
              />
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                {m.name[cl]}
              </h2>
              <p className="text-sm text-gold">{m.role[cl]}</p>
              <p className="mt-2 text-sm text-muted">{m.highlight[cl]}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
