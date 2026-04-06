"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "tenegta-cookie-consent";

type ConsentValue = "analytics" | "essential";

export function AnalyticsConsent() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const t = useTranslations("CookieConsent");
  const [hydrated, setHydrated] = useState(false);
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "analytics" || stored === "essential") {
      setConsent(stored);
    } else {
      setConsent(null);
    }
    setHydrated(true);
  }, []);

  function acceptAnalytics() {
    localStorage.setItem(STORAGE_KEY, "analytics");
    setConsent("analytics");
  }

  function essentialOnly() {
    localStorage.setItem(STORAGE_KEY, "essential");
    setConsent("essential");
  }

  if (!id) return null;
  if (!hydrated) return null;

  return (
    <>
      {consent === "analytics" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');
            `}
          </Script>
        </>
      ) : null}

      {consent === null ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-bg/95 px-4 py-4 shadow-[0_-8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md md:px-8"
          role="dialog"
          aria-label={t("ariaLabel")}
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-sm text-muted">{t("message")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/privacy"
                className="text-sm font-medium text-gold underline-offset-4 hover:underline"
              >
                {t("privacyLink")}
              </Link>
              <button
                type="button"
                onClick={essentialOnly}
                className="rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-elevated"
              >
                {t("essentialOnly")}
              </button>
              <button
                type="button"
                onClick={acceptAnalytics}
                className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-bg hover:bg-gold-bright"
              >
                {t("acceptAnalytics")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
