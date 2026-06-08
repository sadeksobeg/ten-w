"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { downloadBlob, renderCreatorStoryFrame } from "@/lib/creators/story-frame";
import { trackCreatorVisitAction } from "@/lib/growth/creator-arena-actions";
import { useToast } from "@/hooks/useToast";

type Props = {
  title: string;
};

export function CreatorStudioShareTools({ title }: Props) {
  const t = useTranslations("Creators.studio");
  const locale = useLocale();
  const { showToast } = useToast();
  const [tracked, setTracked] = useState(false);

  const filmingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${locale}/creators/studio?utm_source=creator&utm_campaign=arena`
      : `https://tenegta.com/${locale}/creators/studio?utm_source=creator&utm_campaign=arena`;

  useEffect(() => {
    if (tracked) return;
    const params = new URLSearchParams(window.location.search);
    const fd = new FormData();
    fd.set("path", window.location.pathname);
    fd.set("utmSource", params.get("utm_source") ?? "direct");
    fd.set("utmCampaign", params.get("utm_campaign") ?? "");
    void trackCreatorVisitAction(fd);
    setTracked(true);
  }, [tracked]);

  async function copyFilmingLink() {
    try {
      await navigator.clipboard.writeText(filmingUrl);
      showToast({ type: "success", title: t("linkCopied") });
    } catch {
      showToast({ type: "error", title: t("copyError") });
    }
  }

  async function downloadStoryFrame() {
    try {
      const blob = await renderCreatorStoryFrame(title);
      downloadBlob(blob, "tenegta-creator-story.png");
      showToast({ type: "success", title: t("storyDownloaded") });
    } catch {
      showToast({ type: "error", title: t("storyError") });
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
      <button
        type="button"
        onClick={() => void copyFilmingLink()}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-bg transition hover:bg-gold-bright sm:w-auto sm:min-h-11 sm:py-2.5"
      >
        {t("copyFilmingLink")}
      </button>
      <button
        type="button"
        onClick={() => void downloadStoryFrame()}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-gold/40 bg-gold/10 px-6 py-3 text-sm font-bold text-gold transition hover:border-gold/60 sm:w-auto sm:min-h-11 sm:py-2.5"
      >
        {t("downloadStoryFrame")}
      </button>
    </div>
  );
}
