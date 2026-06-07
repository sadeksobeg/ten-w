"use client";

import { type ReactNode, useState } from "react";
import { useTranslations } from "next-intl";
import { CinemaProgressBar } from "@/components/cinema-demo/CinemaProgressBar";
import { CinemaSoundToggle } from "@/components/cinema-demo/CinemaSoundToggle";
import { AnalyticsPanel } from "@/components/cinema-demo/os/AnalyticsPanel";
import { ApiIntegrationsPanel } from "@/components/cinema-demo/os/ApiIntegrationsPanel";
import { BookingFeedLive } from "@/components/cinema-demo/os/BookingFeedLive";
import { CinemaCustomerTopBar } from "@/components/cinema-demo/os/CinemaCustomerTopBar";
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
import {
  isAdminOsPhase,
  isCustomerBookingPhase,
} from "@/lib/cinema-demo/phase-modes";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import type { CinemaDemoPhase } from "@/stores/cinema-demo-store";

type Props = { children: ReactNode };

const ACTION_BAR_PHASES: CinemaDemoPhase[] = ["seats"];

type SidebarTab = "live" | "ops" | "commercial";

export function CinemaOSDesktop({ children }: Props) {
  const t = useTranslations("CinemaDemo");
  const phase = useCinemaDemoStore((s) => s.phase);
  const isCustomer = isCustomerBookingPhase(phase);
  const isAdmin = isAdminOsPhase(phase);
  const showSidePanels = isAdmin;
  const hasActionBar = ACTION_BAR_PHASES.includes(phase);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("live");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const tabs: { id: SidebarTab; label: string }[] = [
    { id: "live", label: t("os.sidebarLive") },
    { id: "ops", label: t("os.sidebarOps") },
    { id: "commercial", label: t("os.sidebarCommercial") },
  ];

  const shellClass = [
    "cinema-os",
    hasActionBar ? "cinema-os--action-bar" : "",
    isCustomer ? "cinema-os--customer" : "",
    isAdmin ? "cinema-os--admin" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClass}>
      <header className="cinema-os-chrome">
        <CinemaProgressBar />
        {isAdmin ? <LiveTicker /> : null}
        <div className="cinema-os-topbar-row">
          {isAdmin ? <OsTopBar /> : <CinemaCustomerTopBar />}
          <CinemaSoundToggle />
        </div>
      </header>

      {isAdmin ? (
        <>
          <FloatingWidgets />
          <NotificationSystem />
        </>
      ) : null}

      <div className={`cinema-os-grid ${showSidePanels ? "" : "cinema-os-grid--full"}`}>
        {showSidePanels ? (
          <aside className="cinema-os-col cinema-os-col--left">
            <h3 className="cinema-os-col-title">{t("os.screensTitle")}</h3>
            <ScreenMonitors />
          </aside>
        ) : null}

        <main className="cinema-os-col cinema-os-col--center">{children}</main>

        {showSidePanels ? (
          <aside className={`cinema-os-col cinema-os-col--right ${sidebarExpanded ? "is-expanded" : ""}`}>
            <button
              type="button"
              className="cinema-os-sidebar-mobile-toggle"
              onClick={() => setSidebarExpanded((open) => !open)}
              aria-expanded={sidebarExpanded}
            >
              <span>{t("os.sidebarToggle")}</span>
              <span aria-hidden>{sidebarExpanded ? "▾" : "▴"}</span>
            </button>
            <h3 className="cinema-os-col-title">{t("os.feedTitle")}</h3>
            <div className="cinema-os-sidebar-tabs" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={sidebarTab === tab.id}
                  className={`cinema-os-sidebar-tab ${sidebarTab === tab.id ? "is-active" : ""}`}
                  onClick={() => setSidebarTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="cinema-os-sidebar-scroll">
              {sidebarTab === "live" ? (
                <div className="cinema-os-sidebar-section">
                  <BookingFeedLive />
                  <RevenueGauge />
                  <WeatherIntel />
                </div>
              ) : null}
              {sidebarTab === "ops" ? (
                <div className="cinema-os-sidebar-section">
                  <ProjectorControlPanel />
                  <StaffPanel />
                  <IncidentPanel />
                  <ReportsPanel />
                </div>
              ) : null}
              {sidebarTab === "commercial" ? (
                <div className="cinema-os-sidebar-section">
                  <AnalyticsPanel />
                  <CompetitorPanel />
                  <ApiIntegrationsPanel />
                </div>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
