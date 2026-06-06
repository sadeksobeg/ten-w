"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
import { LOUNGE_ITEMS, VIP_MESSAGES } from "@/lib/cinema-demo/vip-data";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaVipPhase() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const isAr = locale === "ar";
  const goToRoi = useCinemaDemoStore((s) => s.goToRoi);
  const [subPhase, setSubPhase] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    if (subPhase !== 1) return;
    const timers = VIP_MESSAGES.map((msg) =>
      window.setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg.id]);
      }, msg.delayMs),
    );
    const next = window.setTimeout(() => setSubPhase(2), 8000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(next);
    };
  }, [subPhase]);

  const cartTotal = cart.reduce((sum, id) => {
    const item = LOUNGE_ITEMS.find((i) => i.id === id);
    return sum + (item?.price ?? 0);
  }, 0);

  return (
    <section className={`cinema-phase cinema-vip cinema-vip--phase-${subPhase}`}>
      <CinemaDemoHeader />
      <div className="cinema-container">
        {subPhase === 0 ? (
          <div className="cinema-vip-entry">
            <div className="cinema-vip-rope" aria-hidden />
            <div className="cinema-vip-spotlight" aria-hidden />
            <h2 className="cinema-title text-center">{t("vip.entryTitle")}</h2>
            <p className="cinema-subtitle text-center">{t("vip.entrySubtitle")}</p>
            <button type="button" className="cinema-btn cinema-btn-primary mx-auto block mt-8" onClick={() => setSubPhase(1)}>
              {t("vip.enter")}
            </button>
          </div>
        ) : null}

        {subPhase >= 1 ? (
          <div className="cinema-vip-chat">
            <h3>{t("vip.concierge")}</h3>
            <div className="cinema-vip-messages">
              {VIP_MESSAGES.filter((m) => visibleMessages.includes(m.id)).map((msg) => (
                <div key={msg.id} className={`cinema-vip-msg cinema-vip-msg--${msg.from}`}>
                  <p>{isAr ? msg.textAr : msg.textEn}</p>
                  <span>{msg.time}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {subPhase >= 2 ? (
          <div className="cinema-vip-lounge">
            <h3>{t("vip.lounge")}</h3>
            <div className="cinema-vip-menu">
              {LOUNGE_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`cinema-vip-menu-btn ${cart.includes(item.id) ? "is-active" : ""}`}
                  onClick={() =>
                    setCart((c) => (c.includes(item.id) ? c.filter((x) => x !== item.id) : [...c, item.id]))
                  }
                >
                  {isAr ? item.labelAr : item.labelEn}
                  <span>{item.price.toLocaleString("ar-SY")}</span>
                </button>
              ))}
            </div>
            <p className="cinema-sticky-price text-center mt-4">
              {cartTotal.toLocaleString("ar-SY")} {t("currency")}
            </p>
            <button type="button" className="cinema-btn cinema-btn-primary w-full mt-4" onClick={goToRoi}>
              {t("vip.continue")}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
