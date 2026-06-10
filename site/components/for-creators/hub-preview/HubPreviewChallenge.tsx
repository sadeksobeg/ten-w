"use client";

import { useTranslations } from "next-intl";

export function HubPreviewChallenge() {
  const t = useTranslations("Creators.public.bento.hubPreview");

  const rows = [
    { name: "Ahmad K.", pts: 1240, rank: 1 },
    { name: "Sara M.", pts: 1180, rank: 2 },
    { name: t("you"), pts: 980, rank: 3, highlight: true },
  ];

  return (
    <div className="flex h-full flex-col p-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-amber-300/90">{t("challenge")}</p>
      <p className="mt-1 font-[family-name:var(--font-cairo)] text-sm font-black text-white">{t("cupTitle")}</p>
      <ul className="mt-3 flex-1 space-y-1.5">
        {rows.map((r) => (
          <li
            key={r.rank}
            className={`flex items-center justify-between rounded-lg border px-2 py-1.5 text-[10px] ${r.highlight ? "border-[var(--creator-primary)]/40 bg-[var(--creator-primary)]/10" : "border-white/10 bg-black/30"}`}
          >
            <span className="font-bold text-white/80">
              #{r.rank} {r.name}
            </span>
            <span className="font-mono text-[var(--creator-secondary)]">{r.pts}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
