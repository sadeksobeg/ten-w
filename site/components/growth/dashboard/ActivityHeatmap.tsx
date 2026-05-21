"use client";

type Props = {
  locale: string;
  days: string[];
  memberDays: number;
};

/** Last 30 UTC days activity grid (GitHub-style). */
export function ActivityHeatmap({ locale, days, memberDays }: Props) {
  const active = new Set(days);
  const cells: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push(key);
  }

  const title =
    locale === "ar" ? "نشاطك (30 يوم)" : locale === "fr" ? "Activité (30 j)" : "Activity (30d)";
  const sub =
    locale === "ar"
      ? `عضو منذ ${memberDays} يوم · ${days.length} يوم نشط`
      : locale === "fr"
        ? `Membre depuis ${memberDays} j · ${days.length} actifs`
        : `Member ${memberDays}d · ${days.length} active days`;

  return (
    <section className="rounded-2xl border border-[var(--growth-border)] bg-[var(--growth-surface)]/80 p-4">
      <h3 className="text-sm font-bold text-[var(--growth-text)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--growth-text-sub)]">{sub}</p>
      <div className="mt-4 flex flex-wrap gap-1" aria-label={title}>
        {cells.map((key) => {
          const on = active.has(key);
          return (
            <span
              key={key}
              title={key}
              className={`size-3 rounded-sm ${on ? "bg-[var(--growth-gold)] shadow-[0_0_8px_rgba(228,184,77,0.5)]" : "bg-white/10"}`}
            />
          );
        })}
      </div>
    </section>
  );
}
