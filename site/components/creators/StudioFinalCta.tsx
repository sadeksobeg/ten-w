import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function StudioFinalCta() {
  const t = await getTranslations("Creators.studio");

  return (
    <section className="bg-[#060608] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/10 via-[#0A0A0F] to-purple-500/10 px-6 py-12 text-center sm:px-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold/80">
          {t("eyebrow")}
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-white sm:text-3xl">
          {t("finalCta.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/60">{t("finalCta.body")}</p>
        <Link
          href="/ascend"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#B07D2B,#E4B84D)] px-8 py-3 text-sm font-semibold text-black transition hover:brightness-110 motion-safe:hover:scale-[1.02]"
        >
          {t("finalCta.cta")}
        </Link>
      </div>
    </section>
  );
}
