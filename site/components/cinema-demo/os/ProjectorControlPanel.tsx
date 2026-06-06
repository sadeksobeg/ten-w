"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function ProjectorControlPanel() {
  const t = useTranslations("CinemaDemo");
  const markFeatureSeen = useCinemaDemoStore((s) => s.markFeatureSeen);
  const setScreenMode = useCinemaDemoStore((s) => s.setScreenMode);
  const screenMode = useCinemaDemoStore((s) => s.screenMode);

  useEffect(() => {
    markFeatureSeen(16);
  }, [markFeatureSeen]);

  return (
    <div className="cinema-os-panel">
      <h4>{t("os.projectorTitle")}</h4>
      <p>{t("os.projectorHall")}</p>
      <label className="cinema-os-slider-label">
        {t("os.brightness")}
        <input type="range" min={0} max={100} defaultValue={85} className="cinema-os-slider" />
      </label>
      <div className="cinema-os-panel-actions">
        <button type="button" className="cinema-hud-btn" onClick={() => setScreenMode("playing")}>
          {t("os.startShow")}
        </button>
        <button type="button" className="cinema-hud-btn" onClick={() => setScreenMode("intermission")}>
          {screenMode === "playing" ? t("os.pauseShow") : t("os.resumeShow")}
        </button>
      </div>
    </div>
  );
}
