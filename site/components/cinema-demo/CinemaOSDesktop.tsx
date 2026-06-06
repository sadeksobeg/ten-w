"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CinemaAmbientLayer } from "@/components/cinema-demo/CinemaAmbientLayer";
import { CinemaSoundToggle } from "@/components/cinema-demo/CinemaSoundToggle";
import { AnalyticsPanel } from "@/components/cinema-demo/os/AnalyticsPanel";
import { ApiIntegrationsPanel } from "@/components/cinema-demo/os/ApiIntegrationsPanel";
import { BookingFeedLive } from "@/components/cinema-demo/os/BookingFeedLive";
import { CompetitorPanel } from "@/components/cinema-demo/os/CompetitorPanel";
import { FloatingWidgets } from "@/components/cinema-demo/os/FloatingWidgets";
import { IncidentPanel } from "@/components/cinema-demo/os/IncidentPanel";
import { LiveTicker } from "@/components/cinema-demo/os/LiveTicker";
import { NotificationSystem } from "@/components/cinema-demo/os/NotificationSystem";
import { OsTopBar } from "@/components/cinema-demo/os/OsTopBar";
import { ProjectorControlPanel } from "@/components/cinema-demo/os/ProjectorControlPanel";
import { ReportsPanel } from "@/components/cinema-demo/os/ReportsPanel";
import { RevenueGauge } from "@/components/cinema-demo/os/RevenueGauge";
import { ScreenMonitors } from "@/components/cinema-demo/os/ScreenMonitors";
import { StaffPanel } from "@/components/cinema-demo/os/StaffPanel";
import { WeatherIntel } from "@/components/cinema-demo/os/WeatherIntel";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

type Props = { children: ReactNode };

export function CinemaOSDesktop({ children }: Props) {
  const t = useTranslations("CinemaDemo");
  const phase = useCinemaDemoStore((s) => s.phase);
  const showSidePanels = phase !== "sessionReveal" && phase !== "closing";

  return (
    <div className="cinema-os">
      <CinemaAmbientLayer />
      <FloatingWidgets />
      <NotificationSystem />
      <LiveTicker />
      <OsTopBar />

      <div className={`cinema-os-grid ${showSidePanels ? "" : "cinema-os-grid--full"}`}>
        {showSidePanels ? (
          <aside className="cinema-os-col cinema-os-col--left">
            <h3 className="cinema-os-col-title">{t("os.screensTitle")}</h3>
            <ScreenMonitors />
          </aside>
        ) : null}

        <main className="cinema-os-col cinema-os-col--center">{children}</main>

        {showSidePanels ? (
          <aside className="cinema-os-col cinema-os-col--right">
            <h3 className="cinema-os-col-title">{t("os.feedTitle")}</h3>
            <BookingFeedLive />
            <RevenueGauge />
            <WeatherIntel />
            {phase === "seats" ? <ProjectorControlPanel /> : null}
            <StaffPanel />
            <AnalyticsPanel />
            <CompetitorPanel />
            <IncidentPanel />
            <ReportsPanel />
            <ApiIntegrationsPanel />
          </aside>
        ) : null}
      </div>

      <div className="cinema-os-sound">
        <CinemaSoundToggle />
      </div>
    </div>
  );
}
