"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  publicSlug: string;
  locale: string;
};

async function downloadShareCard(url: string, filename: string) {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`download_${res.status}`);
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
  const [cacheBust, setCacheBust] = useState(() => Date.now());
  const [downloading, setDownloading] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const base = useMemo(() => {
    if (!origin) return "";
    const host = window.location.host;
    return `${origin}/api/growth/profile/${encodeURIComponent(publicSlug)}/share-card?locale=${encodeURIComponent(locale)}&host=${encodeURIComponent(host)}&v=${cacheBust}`;
  }, [publicSlug, locale, cacheBust, origin]);

  const retryPreview = useCallback(() => {
    setPreviewError(false);
    setDownloadError(null);
    setCacheBust(Date.now());
  }, []);

  const onDownload = useCallback(
    async (format: "landscape" | "story") => {
      if (!base) return;
      const key = format;
      setDownloading(key);
      setDownloadError(null);
      try {
        await downloadShareCard(
          `${base}&format=${format}`,
          `tenegta-${publicSlug}-${format}.png`,
        );
      } catch {
        setDownloadError(t("downloadError"));
      } finally {
        setDownloading(null);
      }
    },
    [base, publicSlug, t],
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
        {previewError ? (
          <button
            type="button"
            onClick={retryPreview}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 hover:border-gold/30"
          >
            {t("retryPreview")}
          </button>
        ) : null}
      </div>
      {downloadError ? (
        <p className="mt-2 text-xs text-rose-200/90" role="alert">
          {downloadError}
        </p>
      ) : null}
      <div className="mt-4 overflow-hidden rounded-xl border border-gold/20 shadow-[0_0_40px_rgba(176,125,43,0.12)]">
        {base && !previewError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={cacheBust}
            src={`${base}&format=landscape`}
            alt={t("previewAlt")}
            className="w-full"
            onError={() => setPreviewError(true)}
          />
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-rose-200/90" role="alert">
              {t("previewError")}
            </p>
            <button
              type="button"
              onClick={retryPreview}
              className="mt-3 text-xs font-semibold text-gold hover:underline"
            >
              {t("retryPreview")}
            </button>
            <p className="mt-2 text-[10px] text-white/40">{t("previewFallbackHint")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
