"use client";

import { useTranslations } from "next-intl";

type Props = {
  publicSlug: string;
  locale: string;
};

export function ProfileShareExport({ publicSlug, locale }: Props) {
  const t = useTranslations("Growth.profileShare");

  const base = `/api/growth/profile/${encodeURIComponent(publicSlug)}/share-card?locale=${encodeURIComponent(locale)}`;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-sm font-bold text-white">{t("title")}</h3>
      <p className="mt-1 text-xs text-white/50">{t("hint")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`${base}&format=landscape`}
          download={`tenegta-${publicSlug}-landscape.png`}
          className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/20"
        >
          {t("downloadLandscape")}
        </a>
        <a
          href={`${base}&format=story`}
          download={`tenegta-${publicSlug}-story.png`}
          className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/20"
        >
          {t("downloadStory")}
        </a>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${base}&format=landscape`}
          alt={t("previewAlt")}
          className="w-full"
        />
      </div>
    </div>
  );
}
