import { getTranslations } from "next-intl/server";

const STEPS = ["join", "promote", "earn"] as const;

export async function StudioHowItWorks() {
  const t = await getTranslations("Creators.studio");

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-b border-white/10 bg-white/[0.02] px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-gold sm:text-3xl">
          {t("howItWorks.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-white/55">
          {t("howItWorks.subtitle")}
        </p>

        <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          <div
            aria-hidden
            className="pointer-events-none absolute start-[16.67%] end-[16.67%] top-5 hidden h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent md:block"
          />
          {STEPS.map((key, idx) => (
            <li key={key} className="relative text-center md:text-start">
              <span className="relative z-10 inline-flex size-10 items-center justify-center rounded-full border border-gold/40 bg-[#0A0A0F] text-sm font-black text-gold shadow-[0_0_24px_rgba(201,160,97,0.15)]">
                {idx + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold text-white">{t(`howItWorks.steps.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{t(`howItWorks.steps.${key}.body`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
