"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  renderShareCardBlob,
  renderShareCardCanvas,
  type ShareCardClientData,
} from "@/lib/growth/share-card-client";

type Props = {
  publicSlug: string;
  locale: string;
};

export function ProfileShareExport({ publicSlug, locale }: Props) {
  const t = useTranslations("Growth.profileShare");
  const [cardData, setCardData] = useState<ShareCardClientData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadData = useCallback(async () => {
    setLoadError(false);
    setDownloadError(null);
    const host = window.location.host;
    const url = `/api/growth/profile/${encodeURIComponent(publicSlug)}/share-data?locale=${encodeURIComponent(locale)}&host=${encodeURIComponent(host)}`;
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`load_${res.status}`);
    const json = (await res.json()) as ShareCardClientData & { profileUrl: string };
    const data: ShareCardClientData = {
      name: json.name,
      levelName: json.levelName,
      totalXp: json.totalXp,
      closedDeals: json.closedDeals,
      badgeCount: json.badgeCount,
      referralCode: json.referralCode,
      profileUrl: json.profileUrl,
      topBadges: json.topBadges ?? [],
      locale: json.locale ?? locale,
    };
    setCardData(data);
    const canvas = renderShareCardCanvas(data, "landscape");
    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [publicSlug, locale]);

  useEffect(() => {
    let revoked: string | null = null;
    loadData().catch(() => setLoadError(true));
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [loadData, reloadKey]);

  const retry = useCallback(() => {
    setPreviewUrl(null);
    setCardData(null);
    setReloadKey((k) => k + 1);
  }, []);

  const onDownload = useCallback(
    async (format: "landscape" | "story") => {
      if (!cardData) {
        setDownloadError(t("downloadError"));
        return;
      }
      setDownloading(format);
      setDownloadError(null);
      try {
        const blob = await renderShareCardBlob(cardData, format);
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = `tenegta-${publicSlug}-${format}.png`;
        a.click();
        URL.revokeObjectURL(objectUrl);
      } catch {
        setDownloadError(t("downloadError"));
      } finally {
        setDownloading(null);
      }
    },
    [cardData, publicSlug, t],
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-sm font-bold text-white">{t("title")}</h3>
      <p className="mt-1 text-xs text-white/50">{t("hint")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={downloading !== null || !cardData}
          onClick={() => onDownload("landscape")}
          className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/20 disabled:opacity-50"
        >
          {downloading === "landscape" ? "…" : t("downloadLandscape")}
        </button>
        <button
          type="button"
          disabled={downloading !== null || !cardData}
          onClick={() => onDownload("story")}
          className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/20 disabled:opacity-50"
        >
          {downloading === "story" ? "…" : t("downloadStory")}
        </button>
        {loadError ? (
          <button
            type="button"
            onClick={retry}
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
        {previewUrl && !loadError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={t("previewAlt")} className="w-full" />
        ) : loadError ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-rose-200/90" role="alert">
              {t("previewError")}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 text-xs font-semibold text-gold hover:underline"
            >
              {t("retryPreview")}
            </button>
            <p className="mt-2 text-[10px] text-white/40">{t("previewFallbackHint")}</p>
          </div>
        ) : (
          <p className="px-4 py-10 text-center text-xs text-white/40">{t("loadingPreview")}</p>
        )}
      </div>
    </div>
  );
}
