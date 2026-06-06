"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
import { CinemaBrandLogo } from "@/components/cinema-demo/CinemaBrandLogo";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaClosingPhase() {
  const t = useTranslations("CinemaDemo");
  const resetDemo = useCinemaDemoStore((s) => s.resetDemo);

  const features = [
    { title: t("closing.f1Title"), body: t("closing.f1Body") },
    { title: t("closing.f2Title"), body: t("closing.f2Body") },
    { title: t("closing.f3Title"), body: t("closing.f3Body") },
  ];

  const industries = [t("closing.ind1"), t("closing.ind2"), t("closing.ind3")];

  return (
    <section className="cinema-phase cinema-closing">
      <CinemaDemoHeader />
      <div className="cinema-container text-center">
        <CinemaBrandLogo variant="dark" className="mx-auto mb-6" />
        <p className="cinema-closing-eyebrow">{t("closing.eyebrow")}</p>
        <h2 className="cinema-title">{t("closing.title")}</h2>
        <p className="cinema-subtitle mb-8">{t("closing.subtitle")}</p>

        <div className="cinema-closing-features">
          {features.map((f, i) => (
            <article key={i} className={`cinema-closing-card cinema-reveal cinema-reveal--delay-${i + 1}`}>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>

        <div className="cinema-closing-pills">
          {industries.map((pill) => (
            <span key={pill} className="mgr-pill">
              {pill}
            </span>
          ))}
        </div>

        <Link href="/contact?intent=demo&topic=cinema" className="cinema-btn cinema-btn-primary mt-8 inline-block">
          {t("closing.cta")}
        </Link>
        <button type="button" className="cinema-btn cinema-btn-ghost block mx-auto mt-4" onClick={resetDemo}>
          {t("closing.restart")}
        </button>
        <p className="cinema-demo-note">{t("demoNote")}</p>
      </div>
    </section>
  );
}
