import { getTranslations } from "next-intl/server";

const STEP_KEYS = ["discover", "assess", "pilot", "deploy", "evolve"] as const;

export async function MethodologyTimeline() {
  const t = await getTranslations("EngagementPage.methodology");

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold text-foreground md:text-3xl">
        {t("title")}
      </h2>
      <p className="mt-3 max-w-2xl text-muted">{t("subtitle")}</p>
      <ol className="relative mt-10 space-y-0 border-s border-gold/30 ps-8 md:ps-10">
        {STEP_KEYS.map((key, i) => (
          <li key={key} className="relative pb-10 last:pb-0">
            <span
              className="absolute -start-[calc(1rem+5px)] top-1 flex size-5 items-center justify-center rounded-full border-2 border-gold bg-bg text-[10px] font-bold text-gold md:-start-[calc(1.25rem+5px)]"
              aria-hidden
            >
              {i + 1}
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {t(`steps.${key}.phase`)}
            </p>
            <h3 className="mt-1 font-[family-name:var(--font-cairo)] text-lg font-bold text-foreground">
              {t(`steps.${key}.title`)}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {t(`steps.${key}.description`)}
            </p>
            <p className="mt-2 text-xs text-white/40">{t(`steps.${key}.duration`)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
