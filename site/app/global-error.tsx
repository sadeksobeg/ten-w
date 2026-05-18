"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

const COPY = {
  ar: {
    title: "خطأ حرج",
    body: "تعذّر تحميل التطبيق. يرجى تحديث الصفحة.",
    retry: "تحديث الصفحة",
  },
  en: {
    title: "Critical error",
    body: "The application failed to load. Please refresh the page.",
    retry: "Refresh page",
  },
  fr: {
    title: "Erreur critique",
    body: "L'application n'a pas pu se charger. Actualisez la page.",
    retry: "Actualiser",
  },
} as const;

function localeFromPath(): keyof typeof COPY {
  if (typeof window === "undefined") return "en";
  const seg = window.location.pathname.split("/").filter(Boolean)[0];
  if (seg === "ar" || seg === "fr" || seg === "en") return seg;
  return "en";
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = localeFromPath();
  const t = COPY[locale];

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    } else {
      console.error("[global-error]", error);
    }
  }, [error]);

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0c",
          color: "#f5f5f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <p style={{ color: "#c9a061", fontSize: 12, letterSpacing: "0.2em" }}>
            T.E.N.E.G.T.A
          </p>
          <h1 style={{ fontSize: 24, marginTop: 12 }}>{t.title}</h1>
          <p style={{ color: "#a1a1aa", marginTop: 12, lineHeight: 1.6 }}>{t.body}</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "10px 20px",
              background: "#c9a061",
              color: "#0a0a0c",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
