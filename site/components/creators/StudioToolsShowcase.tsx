import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";

const TOOLS = [
  { key: "orderPage", href: "/order" },
  { key: "register", href: "/growth/register" },
  { key: "lounge", href: "/growth/creators" },
] as const;

export async function StudioToolsShowcase() {
  const t = await getTranslations("Creators.studio");

  return (
    <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-gold sm:text-3xl">
          {t("tools.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-white/55">
          {t("tools.subtitle")}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(({ key, href }) => (
            <Link key={key} href={href} className="group block h-full">
              <GlassCard className="h-full border border-white/10 bg-white/[0.04] p-5 transition group-hover:border-gold/35 group-hover:bg-gold/5">
                <h3 className="text-lg font-bold text-white">{t(`tools.${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{t(`tools.${key}.body`)}</p>
                <span className="mt-4 inline-flex text-xs font-semibold text-gold group-hover:underline">
                  {t("openLink")} →
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
