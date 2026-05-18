"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error, reset }: Props) {
  const t = useTranslations("ErrorPage");
  const home = useTranslations("Common");

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    } else {
      console.error("[locale-error]", error);
    }
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/80">
        Error
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-cairo)] text-2xl font-bold text-foreground">
        {t("errorTitle")}
      </h1>
      <p className="mt-3 text-muted">{t("errorBody")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg hover:bg-gold-bright"
        >
          {t("tryAgain")}
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-gold/60 px-5 py-2.5 text-sm font-semibold text-gold hover:bg-gold-dim"
        >
          {home("backHome")}
        </Link>
      </div>
    </div>
  );
}
