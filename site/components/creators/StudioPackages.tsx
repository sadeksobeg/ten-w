import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";

const PACKAGES = ["website", "automation", "mobile"] as const;

export async function StudioPackages() {
  const t = await getTranslations("Creators.studio");

  return (
    <section className="border-b border-white/10 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-gold sm:text-3xl">
          {t("packages.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-white/55">
          {t("packages.subtitle")}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PACKAGES.map((key) => (
            <GlassCard
              key={key}
              className="border border-white/10 bg-white/[0.03] p-5 text-center md:text-start"
            >
              <p className="text-2xl font-black text-gold">{t(`packages.items.${key}.price`)}</p>
              <h3 className="mt-2 font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
                {t(`packages.items.${key}.name`)}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-white/55">
                {t(`packages.items.${key}.body`)}
              </p>
            </GlassCard>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-white/45">{t("packages.note")}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/order"
            className="inline-flex min-h-11 items-center rounded-[10px] bg-[linear-gradient(135deg,#B07D2B,#E4B84D)] px-6 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
          >
            {t("packages.orderCta")}
          </Link>
          <Link
            href="/growth/register"
            className="inline-flex min-h-11 items-center rounded-[10px] border border-gold/40 bg-gold/10 px-6 py-2.5 text-sm font-semibold text-gold transition hover:border-gold/60"
          >
            {t("packages.registerCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
