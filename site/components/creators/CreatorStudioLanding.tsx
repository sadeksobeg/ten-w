import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CreatorStudioShareTools } from "@/components/creators/CreatorStudioShareTools";

const EXPERIENCES = [
  { key: "cinema", href: "/demo/cinema?presenter=1", accent: "from-amber-500/20" },
  { key: "invite", href: "/invite/demo", accent: "from-rose-500/20", external: true },
  { key: "ascend", href: "/ascend", accent: "from-purple-500/20" },
  { key: "visualizer", href: "/?demo=ai", accent: "from-cyan-500/20" },
] as const;

export async function CreatorStudioLanding() {
  const t = await getTranslations("Creators.studio");

  return (
    <div className="relative overflow-hidden">
      <section className="relative border-b border-white/10 px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(228,184,77,0.25),transparent_55%),radial-gradient(700px_circle_at_90%_20%,rgba(220,38,38,0.18),transparent_50%)]"
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold/80">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-cairo)] text-3xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm text-white/70 sm:text-base">{t("subtitle")}</p>
          <div className="mt-8 flex justify-center">
            <CreatorStudioShareTools title={t("title")} />
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-gold">
            {t("experiencesTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-white/55">
            {t("experiencesSubtitle")}
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
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

      <section className="border-t border-white/10 bg-white/[0.02] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gold/25 bg-black/30 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-cairo)] text-xl font-extrabold text-gold">
            {t("scriptTitle")}
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/70">{t("scriptBody")}</p>
        </div>
      </section>

      <section className="px-4 py-14 text-center sm:px-6">
        <p className="text-sm text-white/55">{t("privateRoomHint")}</p>
        <Link
          href="/growth/sign-in"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-8 py-3 text-sm font-bold text-bg hover:bg-gold-bright"
        >
          {t("ascendCta")}
        </Link>
      </section>
    </div>
  );
}
