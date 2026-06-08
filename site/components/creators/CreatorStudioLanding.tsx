import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { StudioHero } from "@/components/creators/StudioHero";
import { StudioHowItWorks } from "@/components/creators/StudioHowItWorks";
import { StudioPackages } from "@/components/creators/StudioPackages";
import { StudioToolsShowcase } from "@/components/creators/StudioToolsShowcase";
import { StudioFaq } from "@/components/creators/StudioFaq";
import { StudioFinalCta } from "@/components/creators/StudioFinalCta";

const EXPERIENCES = [
  { key: "order", href: "/order" },
  { key: "cinema", href: "/demo/cinema?presenter=1" },
  { key: "ascend", href: "/ascend" },
] as const;

export async function CreatorStudioLanding() {
  const t = await getTranslations("Creators.studio");

  return (
    <div className="relative overflow-hidden">
      <StudioHero />
      <StudioHowItWorks />
      <StudioPackages />

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-gold">
            {t("experiencesTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-white/55">
            {t("experiencesSubtitle")}
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERIENCES.map((exp) => (
              <Link
                key={exp.key}
                href={exp.href}
                className={`group block rounded-2xl border border-white/10 bg-gradient-to-br ${
                  exp.key === "order"
                    ? "from-gold/15"
                    : exp.key === "cinema"
                      ? "from-rose-500/20"
                      : "from-purple-500/20"
                } to-transparent p-6 transition hover:border-gold/35`}
              >
                <h3 className="text-lg font-bold text-white">{t(`experiences.${exp.key}.title`)}</h3>
                <p className="mt-2 text-sm text-white/60">{t(`experiences.${exp.key}.body`)}</p>
                <span className="mt-4 inline-flex text-sm font-semibold text-gold group-hover:underline">
                  {t("openExperience")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <StudioToolsShowcase />
      <StudioFaq />
      <StudioFinalCta />
    </div>
  );
}
