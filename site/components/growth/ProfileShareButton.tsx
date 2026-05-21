"use client";

import { useTranslations } from "next-intl";

type Props = {
  url: string;
  title: string;
};

export function ProfileShareButton({ url, title }: Props) {
  const t = useTranslations("Growth.publicProfile");

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    alert(t("linkCopied"));
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/20"
    >
      {t("share")}
    </button>
  );
}
