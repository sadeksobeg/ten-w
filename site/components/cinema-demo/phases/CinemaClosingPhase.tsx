"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CinemaBrandLogo } from "@/components/cinema-demo/CinemaBrandLogo";
import { CinemaProgressBar } from "@/components/cinema-demo/CinemaProgressBar";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaClosingPhase() {
  const t = useTranslations("CinemaDemo");
  const tContact = useTranslations("Contact");
  const resetDemo = useCinemaDemoStore((s) => s.resetDemo);

  const industries = [t("closing.ind1"), t("closing.ind2"), t("closing.ind3")];

  return (
    <section className="cinema-phase cinema-closing cinema-closing-v2">
      <CinemaProgressBar />
      <div className="cinema-closing-aurora" aria-hidden />
      <div className="cinema-os-center-panel text-center">
        <CinemaBrandLogo variant="dark" className="mx-auto mb-6" />
        <h2 className="cinema-closing-headline">{t("closing.v2Headline")}</h2>
        <Link href="/contact?intent=demo&topic=cinema" className="cinema-btn cinema-btn-primary cinema-closing-cta">
          {t("closing.v2Cta")}
        </Link>
        <p className="cinema-closing-contact">
          {t("closing.v2Phone", { phone: tContact("phoneDisplay") })}
        </p>
        <p className="cinema-closing-contact">{t("closing.v2Email", { email: tContact("emailValue") })}</p>
        <p className="cinema-demo-note">{t("closing.v2Note")}</p>

        <div className="cinema-closing-pills">
          {industries.map((pill) => (
            <span key={pill} className="mgr-pill">{pill}</span>
          ))}
        </div>

        <button type="button" className="cinema-btn cinema-btn-ghost block mx-auto mt-4" onClick={resetDemo}>
          {t("closing.restart")}
        </button>
      </div>
    </section>
  );
}
