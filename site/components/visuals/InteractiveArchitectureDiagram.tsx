"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const NODES = ["ingest", "store", "model", "api", "observe"] as const;

export function InteractiveArchitectureDiagram() {
  const t = useTranslations("IntelligentSystemsPage.diagram");
  const [active, setActive] = useState<(typeof NODES)[number]>("ingest");

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/40 p-6 md:p-8">
      <p className="text-sm text-muted">{t("hint")}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {NODES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setActive(n)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
              active === n
                ? "border-gold/50 bg-gold/15 text-gold"
                : "border-white/10 text-white/70 hover:border-gold/30"
            }`}
          >
            {t(`nodes.${n}`)}
          </button>
        ))}
      </div>
      <p className="mt-6 min-h-[4rem] text-center text-sm leading-relaxed text-foreground md:text-base">
        {t(`descriptions.${active}`)}
      </p>
    </div>
  );
}
