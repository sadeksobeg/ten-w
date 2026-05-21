"use client";

import { useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

type Props = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function GrowthCollapsibleSection({ title, children, defaultOpen = false }: Props) {
  const t = useTranslations("Growth.dashboard");
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold text-white">
          {title}
        </h2>
        <span className="text-xs font-semibold text-gold/80">
          {open ? t("collapse") : t("expand")}
        </span>
      </button>
      {open ? (
        <div id={id} className="border-t border-white/10 px-5 pb-5 pt-2">
          {children}
        </div>
      ) : null}
    </section>
  );
}
