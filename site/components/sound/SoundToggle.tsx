"use client";

import { useLocale } from "next-intl";
import { useSound } from "@/components/sound/SoundProvider";

export function SoundToggle() {
  const { enabled, toggle } = useSound();
  const locale = useLocale();
  const label =
    locale === "ar"
      ? enabled
        ? "إيقاف أصوات الواجهة"
        : "تفعيل أصوات الواجهة"
      : enabled
        ? "Disable UI sounds"
        : "Enable UI sounds";

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-xs text-muted underline-offset-2 hover:text-gold hover:underline"
    >
      {label}
    </button>
  );
}
