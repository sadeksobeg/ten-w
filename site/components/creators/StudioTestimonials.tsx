import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/growth/ui/GlassCard";

const ARCHETYPES = ["growth", "lifestyle", "business"] as const;

export async function StudioTestimonials() {
  const t = await getTranslations("Creators.studio");

  return (
    <section className="border-b border-white/10 bg-white/[0.02] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-gold sm:text-3xl">
          {t("testimonials.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-white/55">
          {t("testimonials.subtitle")}
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {ARCHETYPES.map((key) => (
            <GlassCard key={key} className="flex flex-col border border-white/10 bg-black/25">
              <div className="mb-4 flex size-11 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-sm font-bold text-gold">
                {t(`testimonials.archetypes.${key}.initials`)}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-white/75">
                &ldquo;{t(`testimonials.archetypes.${key}.quote`)}&rdquo;
              </blockquote>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold/80">
                {t(`testimonials.archetypes.${key}.role`)}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
