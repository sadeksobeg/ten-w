"use client";

import { useTranslations } from "next-intl";
import { CinemaDemoHeader } from "@/components/cinema-demo/CinemaDemoHeader";
import { AlertsPanel } from "@/components/cinema-demo/manager/AlertsPanel";
import { BookingsFeed } from "@/components/cinema-demo/manager/BookingsFeed";
import { KpiCards } from "@/components/cinema-demo/manager/KpiCards";
import { ManagerTopBar } from "@/components/cinema-demo/manager/ManagerTopBar";
import { PeakHeatmap } from "@/components/cinema-demo/manager/PeakHeatmap";
import { RevenueChart } from "@/components/cinema-demo/manager/RevenueChart";
import { ScreensStatus } from "@/components/cinema-demo/manager/ScreensStatus";
import { StaffOverview } from "@/components/cinema-demo/manager/StaffOverview";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaManagerPhase() {
  const t = useTranslations("CinemaDemo");
  const goToRoi = useCinemaDemoStore((s) => s.goToRoi);

  return (
    <section className="cinema-phase cinema-manager">
      <CinemaDemoHeader />
      <div className="cinema-container mgr-layout">
        <ManagerTopBar />
        <KpiCards />
        <ScreensStatus />
        <div className="mgr-row-2">
          <RevenueChart />
          <PeakHeatmap />
        </div>
        <div className="mgr-row-2">
          <div className="mgr-panel">
            <h3>{t("manager.liveBookings")}</h3>
            <BookingsFeed />
          </div>
          <div className="mgr-panel">
            <h3>{t("manager.alerts")}</h3>
            <AlertsPanel />
            <h3 className="mt-6">{t("manager.staff")}</h3>
            <StaffOverview />
          </div>
        </div>
        <button type="button" className="cinema-btn cinema-btn-primary w-full mt-6" onClick={goToRoi}>
          {t("manager.continueRoi")}
        </button>
      </div>
    </section>
  );
}
