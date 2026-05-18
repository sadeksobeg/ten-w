import { getTranslations } from "next-intl/server";

export async function ProblemSolutionSection() {
  const t = await getTranslations("HomePage.problemSolution");

  return (
    <section className="border-b border-white/10 py-14 md:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/80">
          {t("eyebrow")}
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-cairo)] text-2xl font-bold leading-snug md:text-3xl">
          {t("problem")}
        </h2>
        <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">
          {t("solution")}
        </p>
      </div>
    </section>
  );
}
