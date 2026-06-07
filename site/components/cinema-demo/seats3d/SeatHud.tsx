"use client";

import { useTranslations } from "next-intl";
import { CinemaIcon } from "@/components/cinema-demo/CinemaIcon";
import type { Seat3D } from "@/lib/cinema-demo/seat-layout-3d";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

type Props = {
  seats: Seat3D[];
  tooltipSeatId: string | null;
  variant: "controls" | "overlay";
};

export function SeatHud({ seats, tooltipSeatId, variant }: Props) {
  const t = useTranslations("CinemaDemo");
  const cameraPreset = useCinemaDemoStore((s) => s.cameraPreset);
  const setCameraPreset = useCinemaDemoStore((s) => s.setCameraPreset);
  const seatView = useCinemaDemoStore((s) => s.seatView);
  const setSeatView = useCinemaDemoStore((s) => s.setSeatView);
  const smartPickSeats = useCinemaDemoStore((s) => s.smartPickSeats);
  const setFocusedSeatId = useCinemaDemoStore((s) => s.setFocusedSeatId);

  const tooltipSeat = tooltipSeatId ? seats.find((s) => s.id === tooltipSeatId) : null;
  const rowCount = new Set(seats.map((s) => s.rowIndex)).size;

  if (variant === "controls") {
    return (
      <div className="cinema-seat-hud-controls" aria-label={t("seats.mapLabel")}>
        <div className="cinema-seat-hud-toolbar cinema-seat-hud-toolbar--primary">
          <button
            type="button"
            className={`cinema-hud-btn ${seatView === "3d" ? "is-active" : ""}`}
            onClick={() => setSeatView("3d")}
          >
            {t("seats.view3d")}
          </button>
          <button
            type="button"
            className={`cinema-hud-btn ${seatView === "2d" ? "is-active" : ""}`}
            onClick={() => setSeatView("2d")}
          >
            {t("seats.view2d")}
          </button>
          <span className="cinema-seat-hud-divider" />
          <button
            type="button"
            className={`cinema-hud-btn ${cameraPreset === "overview" ? "is-active" : ""}`}
            onClick={() => setCameraPreset("overview")}
          >
            {t("seats.cameraOverview")}
          </button>
          <button
            type="button"
            className={`cinema-hud-btn ${cameraPreset === "immersive" ? "is-active" : ""}`}
            onClick={() => setCameraPreset("immersive")}
          >
            {t("seats.cameraImmersive")}
          </button>
          <button
            type="button"
            className={`cinema-hud-btn ${cameraPreset === "vip" ? "is-active" : ""}`}
            onClick={() => setCameraPreset("vip")}
          >
            {t("seats.vipCamera")}
          </button>
          <button
            type="button"
            className={`cinema-hud-btn ${cameraPreset === "birdsEye" ? "is-active" : ""}`}
            onClick={() => setCameraPreset("birdsEye")}
          >
            {t("seats.cameraMap")}
          </button>
          <button type="button" className="cinema-hud-btn cinema-hud-btn--accent" onClick={() => smartPickSeats(2)}>
            <CinemaIcon name="seat" size={14} />
            {t("seats.smartPick")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cinema-seat-hud-overlay">
      {tooltipSeat ? (
        <div className="cinema-seat-hud-tooltip cinema-seat-hologram">
          <strong>
            {tooltipSeat.row}
            {tooltipSeat.number}
          </strong>
          <span className="cinema-seat-hud-tier">
            {tooltipSeat.tier === "vip" ? t("seats.vipPremium") : tooltipSeat.tier}
          </span>
          <span>
            {tooltipSeat.price.toLocaleString("ar-SY")} {t("currency")}
          </span>
          <span>✓ {t("seats.available")}</span>
        </div>
      ) : (
        <span className="cinema-seat-hud-hint">{t("seats.dragHint")}</span>
      )}

      <div className="cinema-minimap" aria-hidden>
        <p className="cinema-minimap-label">{t("seats.screen")}</p>
        <div className="cinema-minimap-grid">
          {Array.from({ length: rowCount }, (_, ri) => (
            <button
              key={ri}
              type="button"
              className="cinema-minimap-row"
              onClick={() => {
                const rowSeat = seats.find((s) => s.rowIndex === ri);
                if (rowSeat) {
                  setFocusedSeatId(rowSeat.id);
                  setCameraPreset("focus");
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
