"use client";

import { useLocale, useTranslations } from "next-intl";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
import { CinemaIcon } from "@/components/cinema-demo/CinemaIcon";
import { UPSELL_BUNDLE } from "@/lib/cinema-demo/vip-data";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaUpsellPhase() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const isAr = locale === "ar";
  const addUpsell = useCinemaDemoStore((s) => s.addUpsell);
  const skipUpsell = useCinemaDemoStore((s) => s.skipUpsell);

  const bundleLabel = isAr ? UPSELL_BUNDLE.labelAr : UPSELL_BUNDLE.labelEn;
  const bundleDesc = isAr ? UPSELL_BUNDLE.descAr : UPSELL_BUNDLE.descEn;

  return (
    <section className="cinema-phase">
      <CinemaDemoHeader />
      <div className="cinema-container cinema-upsell">
        <h2 className="cinema-title text-center cinema-reveal">{t("upsell.title")}</h2>
        <p className="cinema-subtitle text-center cinema-reveal cinema-reveal--delay-1">{t("upsell.subtitle")}</p>

        <div className="cinema-upsell-compare cinema-reveal cinema-reveal--delay-2">
          <div className="cinema-upsell-compare-col cinema-upsell-compare-col--plain">
            <h3>{t("upsell.without")}</h3>
            <p>{t("upsell.withoutDesc")}</p>
            <span className="cinema-upsell-compare-price">—</span>
          </div>
          <div className="cinema-upsell-compare-col cinema-upsell-compare-col--bundle">
            <span className="cinema-upsell-badge">{t("upsell.badge")}</span>
            <span className="cinema-upsell-icon">
              <CinemaIcon name="popcorn" size={32} />
            </span>
            <h3>{bundleLabel}</h3>
            <p className="cinema-movie-meta">{bundleDesc}</p>
            <p className="cinema-sticky-price">
              {UPSELL_BUNDLE.price.toLocaleString("ar-SY")} {t("currency")}
              <span className="cinema-upsell-save">
                {t("upsell.save")} {UPSELL_BUNDLE.save.toLocaleString("ar-SY")}
              </span>
            </p>
            <button type="button" className="cinema-btn cinema-btn-primary w-full" onClick={() => addUpsell(UPSELL_BUNDLE.id)}>
              {t("upsell.add")}
            </button>
          </div>
        </div>

        <button type="button" className="cinema-btn cinema-btn-ghost mx-auto block mt-6" onClick={skipUpsell}>
          {t("upsell.skip")}
        </button>
      </div>
    </section>
  );
}
