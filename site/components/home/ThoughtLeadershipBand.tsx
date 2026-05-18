import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function ThoughtLeadershipBand() {
  const t = await getTranslations("HomePage.thoughtLeadership");

  return (
    <section className="border-y border-white/10 bg-surface/25 py-12 md:py-14">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/80">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-cairo)] text-xl font-bold text-foreground md:text-2xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
            {t("description")}
          </p>
        </div>
        <Link
          href="/blog/legacy-siem-arabic-enterprise"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-gold/50 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold transition-colors hover:border-gold hover:bg-gold-dim"
        >
          {t("cta")}
        </Link>
      </div>
    </section>
  );
}
