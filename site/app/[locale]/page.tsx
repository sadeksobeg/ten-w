import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { CinematicHero } from "@/components/hero/CinematicHero";
import { HomeContactBand } from "@/components/home/HomeContactBand";
import { HomeScrollEnhancements } from "@/components/home/HomeScrollEnhancements";
import {
  ProjectsRail,
} from "@/components/home/ProjectsRail";
import {
  ServicesMotionGrid,
  type ServiceItem,
} from "@/components/home/ServicesMotionGrid";
import { OrganizationJsonLd } from "@/components/jsonld/OrganizationJsonLd";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/metadata-helpers";
import { getProjects } from "@/lib/strapi";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildAlternates(locale as Locale, "/"),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const loc = locale as Locale;
  const projects = (await getProjects(loc)).slice(0, 4);

  const services: ServiceItem[] = [
    {
      id: "ai",
      title: t("services.ai.title"),
      description: t("services.ai.desc"),
    },
    {
      id: "security",
      title: t("services.security.title"),
      description: t("services.security.desc"),
    },
    {
      id: "software",
      title: t("services.software.title"),
      description: t("services.software.desc"),
    },
    {
      id: "infra",
      title: t("services.infra.title"),
      description: t("services.infra.desc"),
    },
  ];

  return (
    <>
      <OrganizationJsonLd />
      <HomeScrollEnhancements>
        <CinematicHero
          brandLabel="T.E.N.E.G.T.A"
          title={t("hero.title")}
          subtitle={t("hero.subtitle")}
          lead={t("hero.lead")}
          ctaPrimary={t("hero.ctaPrimary")}
          ctaSecondary={t("hero.ctaSecondary")}
          ctaPrimaryHref="/solutions/intelligent-systems"
          ctaSecondaryHref="/contact?intent=consult"
        />

        <ServicesMotionGrid
          sectionTitle={t("services.title")}
          items={services}
        />

        <section className="border-y border-white/10 bg-surface/20 py-10 md:py-12">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="font-[family-name:var(--font-cairo)] text-base leading-relaxed text-muted md:text-lg">
              {t("services.valueProposition")}
            </p>
          </div>
        </section>

        <ProjectsRail
          title={t("featured.title")}
          viewAllLabel={t("featured.viewAll")}
          detailLabel={loc === "ar" ? "التفاصيل" : "Details"}
          projects={projects}
          locale={loc}
        />

        <HomeContactBand title={t("cta.title")} subtitle={t("cta.subtitle")} />
      </HomeScrollEnhancements>
    </>
  );
}
