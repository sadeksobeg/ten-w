"use client";

import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaSoundToggle() {
  const t = useTranslations("CinemaDemo");
  const soundEnabled = useCinemaDemoStore((s) => s.soundEnabled);
  const setSoundEnabled = useCinemaDemoStore((s) => s.setSoundEnabled);

  return (
    <button
      type="button"
      className="cinema-sound-toggle"
      onClick={() => setSoundEnabled(!soundEnabled)}
      aria-label={soundEnabled ? t("soundOff") : t("soundOn")}
    >
      {soundEnabled ? "🔊" : "🔇"}
    </button>
  );
}
