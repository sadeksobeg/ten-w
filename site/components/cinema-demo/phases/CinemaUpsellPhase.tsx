"use client";

import { useLocale, useTranslations } from "next-intl";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
import { UPSELL_BUNDLE } from "@/lib/cinema-demo/vip-data";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaUpsellPhase() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const isAr = locale === "ar";
  const addUpsell = useCinemaDemoStore((s) => s.addUpsell);
  const skipUpsell = useCinemaDemoStore((s) => s.skipUpsell);

  return (
    <section className="cinema-phase">
      <CinemaDemoHeader />
      <div className="cinema-container cinema-upsell">
        <h2 className="cinema-title text-center">{t("upsell.title")}</h2>
        <p className="cinema-subtitle text-center">{t("upsell.subtitle")}</p>

        <div className="cinema-upsell-card">
          <span className="cinema-upsell-badge">{t("upsell.badge")}</span>
          <h3>{isAr ? UPSELL_BUNDLE.labelAr : UPSELL_BUNDLE.labelEn}</h3>
          <p className="cinema-movie-meta">{isAr ? UPSELL_BUNDLE.descAr : UPSELL_BUNDLE.descEn}</p>
          <p className="cinema-sticky-price">
            {UPSELL_BUNDLE.price.toLocaleString("ar-SY")} {t("currency")}
            <span className="cinema-upsell-save">
              {t("upsell.save")} {UPSELL_BUNDLE.save.toLocaleString("ar-SY")}
            </span>
          </p>
          <div className="cinema-upsell-actions">
            <button type="button" className="cinema-btn cinema-btn-primary" onClick={() => addUpsell(UPSELL_BUNDLE.id)}>
              {t("upsell.add")}
            </button>
            <button type="button" className="cinema-btn cinema-btn-ghost" onClick={skipUpsell}>
              {t("upsell.skip")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
