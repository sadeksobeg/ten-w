"use client";

import { useTranslations } from "next-intl";
import { CinemaIcon } from "@/components/cinema-demo/CinemaIcon";
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
      aria-pressed={soundEnabled}
    >
      <CinemaIcon name={soundEnabled ? "volume" : "volume-off"} size={18} />
    </button>
  );
}
