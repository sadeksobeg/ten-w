"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  publicSlug: string;
  locale: string;
};

async function downloadShareCard(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("download_failed");
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

export function ProfileShareExport({ publicSlug, locale }: Props) {
  const t = useTranslations("Growth.profileShare");
  const [cacheBust] = useState(() => Date.now());
  const [downloading, setDownloading] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const base = useMemo(() => {
    if (!origin) return "";
    const host = window.location.host;
    return `${origin}/api/growth/profile/${encodeURIComponent(publicSlug)}/share-card?locale=${encodeURIComponent(locale)}&host=${encodeURIComponent(host)}&v=${cacheBust}`;
  }, [publicSlug, locale, cacheBust, origin]);

  const onDownload = useCallback(
    async (format: "landscape" | "story") => {
      if (!base) return;
      const key = format;
      setDownloading(key);
      try {
        await downloadShareCard(
          `${base}&format=${format}`,
          `tenegta-${publicSlug}-${format}.png`,
        );
      } finally {
        setDownloading(null);
      }
    },
    [base, publicSlug],
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-sm font-bold text-white">{t("title")}</h3>
      <p className="mt-1 text-xs text-white/50">{t("hint")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={downloading !== null || !base}
          onClick={() => onDownload("landscape")}
          className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/20 disabled:opacity-50"
        >
          {downloading === "landscape" ? "…" : t("downloadLandscape")}
        </button>
        <button
          type="button"
          disabled={downloading !== null || !base}
          onClick={() => onDownload("story")}
          className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/20 disabled:opacity-50"
        >
          {downloading === "story" ? "…" : t("downloadStory")}
        </button>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-gold/20 shadow-[0_0_40px_rgba(176,125,43,0.12)]">
        {base && !previewError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${base}&format=landscape`}
            alt={t("previewAlt")}
            className="w-full"
            onError={() => setPreviewError(true)}
          />
        ) : (
          <p className="px-4 py-8 text-center text-xs text-rose-200/90" role="alert">
            {t("previewError")}
          </p>
        )}
      </div>
    </div>
  );
}
