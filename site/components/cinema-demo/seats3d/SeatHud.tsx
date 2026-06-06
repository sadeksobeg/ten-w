"use client";

import { useTranslations } from "next-intl";
import { CinemaIcon } from "@/components/cinema-demo/CinemaIcon";
import type { Seat3D } from "@/lib/cinema-demo/seat-layout-3d";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

type Props = {
  showtimeId: string;
  seats: Seat3D[];
  tooltipSeatId: string | null;
};

export function SeatHud({ seats, tooltipSeatId }: Props) {
  const t = useTranslations("CinemaDemo");
  const cameraPreset = useCinemaDemoStore((s) => s.cameraPreset);
  const setCameraPreset = useCinemaDemoStore((s) => s.setCameraPreset);
  const seatView = useCinemaDemoStore((s) => s.seatView);
  const setSeatView = useCinemaDemoStore((s) => s.setSeatView);
  const smartPickSeats = useCinemaDemoStore((s) => s.smartPickSeats);
  const setFocusedSeatId = useCinemaDemoStore((s) => s.setFocusedSeatId);

  const tooltipSeat = tooltipSeatId ? seats.find((s) => s.id === tooltipSeatId) : null;
  const rowCount = new Set(seats.map((s) => s.rowIndex)).size;

  return (
    <div className="cinema-seat-hud">
      <div className="cinema-seat-hud-toolbar">
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
        <button type="button" className="cinema-hud-btn cinema-hud-btn--accent" onClick={() => smartPickSeats(2)}>
          <CinemaIcon name="seat" size={14} />
          {t("seats.smartPick")}
        </button>
      </div>

      {tooltipSeat ? (
        <div className="cinema-seat-hud-tooltip">
          <strong>
            {tooltipSeat.row}
            {tooltipSeat.number}
          </strong>
          <span className="cinema-seat-hud-tier">{tooltipSeat.tier}</span>
          <span>{tooltipSeat.price.toLocaleString("ar-SY")}</span>
        </div>
      ) : null}

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
