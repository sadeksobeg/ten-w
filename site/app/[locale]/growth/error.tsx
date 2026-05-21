"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function GrowthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Growth.errors");

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/80">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-white">
        {t("title")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-white/55">{t("body")}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-gradient-to-r from-gold/35 to-gold/15 px-5 py-2.5 text-sm font-bold text-white"
        >
          {t("retry")}
        </button>
        <Link
          href="/"
          className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 hover:border-gold/30"
        >
          {t("home")}
        </Link>
      </div>
    </div>
  );
}
