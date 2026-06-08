"use client";

import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaPresenterOverlay() {
  const t = useTranslations("CinemaDemo.presenter");
  const presenterMode = useCinemaDemoStore((s) => s.presenterMode);
  const presenterReady = useCinemaDemoStore((s) => s.presenterReady);
  const startPresenterShow = useCinemaDemoStore((s) => s.startPresenterShow);

  if (!presenterMode || presenterReady) return null;

  return (
    <div className="cinema-presenter-overlay">
      <div className="cinema-presenter-overlay__card">
        <p className="cinema-presenter-overlay__eyebrow">{t("eyebrow")}</p>
        <h2 className="cinema-presenter-overlay__title">{t("title")}</h2>
        <p className="cinema-presenter-overlay__body">{t("body")}</p>
        <button type="button" className="cinema-btn cinema-btn-primary" onClick={startPresenterShow}>
          {t("start")}
        </button>
      </div>
      <div className="cinema-presenter-watermark" aria-hidden>
        TENEGTA · Creator Studio
      </div>
    </div>
  );
}

export function CinemaPresenterWatermark() {
  const presenterMode = useCinemaDemoStore((s) => s.presenterMode);
  const presenterReady = useCinemaDemoStore((s) => s.presenterReady);
  if (!presenterMode || !presenterReady) return null;
  return (
    <div className="cinema-presenter-watermark cinema-presenter-watermark--live" aria-hidden>
      TENEGTA
    </div>
  );
}
