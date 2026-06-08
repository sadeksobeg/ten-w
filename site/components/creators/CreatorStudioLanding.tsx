import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { StudioHero } from "@/components/creators/StudioHero";
import { StudioHowItWorks } from "@/components/creators/StudioHowItWorks";
import { StudioToolsShowcase } from "@/components/creators/StudioToolsShowcase";
import { StudioTestimonials } from "@/components/creators/StudioTestimonials";
import { StudioFaq } from "@/components/creators/StudioFaq";
import { StudioFinalCta } from "@/components/creators/StudioFinalCta";

const EXPERIENCES = [
  { key: "invite", href: "/invite/demo", accent: "from-rose-500/20", external: true },
  { key: "ascend", href: "/ascend", accent: "from-purple-500/20" },
  { key: "visualizer", href: "/?demo=ai", accent: "from-cyan-500/20" },
] as const;

export async function CreatorStudioLanding() {
  const t = await getTranslations("Creators.studio");

  return (
    <div className="relative overflow-hidden">
      <StudioHero />

      <StudioHowItWorks />

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
              <article
                key={exp.key}
                className={`rounded-2xl border border-white/10 bg-gradient-to-br ${exp.accent} to-transparent p-6`}
              >
                <h3 className="text-lg font-bold text-white">{t(`experiences.${exp.key}.title`)}</h3>
                <p className="mt-2 text-sm text-white/60">{t(`experiences.${exp.key}.body`)}</p>
                {"external" in exp && exp.external ? (
                  <a
                    href={exp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex text-sm font-semibold text-gold hover:underline"
                  >
                    {t("openExperience")}
                  </a>
                ) : (
                  <Link href={exp.href} className="mt-4 inline-flex text-sm font-semibold text-gold hover:underline">
                    {t("openExperience")}
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <StudioToolsShowcase />
      <StudioTestimonials />
      <StudioFaq />
      <StudioFinalCta />
    </div>
  );
}
