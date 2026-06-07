"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CinemaIcon } from "@/components/cinema-demo/CinemaIcon";
import type { LiveSeatState } from "@/components/cinema-demo/hooks/useLiveSeatSimulation";
import type { Seat3D } from "@/lib/cinema-demo/seat-layout-3d";
import { getSeatDisplayState } from "@/lib/cinema-demo/seat-select";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

type Props = {
  seats: Seat3D[];
  tooltipSeatId: string | null;
  variant: "controls" | "overlay";
  liveStates?: LiveSeatState;
  highlightRow?: number | null;
  onHighlightRow?: (row: number | null) => void;
  liveAnnouncement?: string;
};

const COLS = 12;
const ROWS = 8;

function seatStateClass(seat: Seat3D, liveStates: LiveSeatState, selectedIds: string[]): string {
  const state = getSeatDisplayState(seat, liveStates, selectedIds);
  if (state === "selected") return "is-selected";
  if (state === "occupied") return "is-occupied";
  if (state === "pending") return "is-pending";
  if (seat.tier === "vip") return "is-vip";
  return "is-available";
}

export function SeatHud({
  seats,
  tooltipSeatId,
  variant,
  liveStates = {},
  highlightRow = null,
  onHighlightRow,
  liveAnnouncement = "",
}: Props) {
  const t = useTranslations("CinemaDemo");
  const cameraPreset = useCinemaDemoStore((s) => s.cameraPreset);
  const setCameraPreset = useCinemaDemoStore((s) => s.setCameraPreset);
  const seatView = useCinemaDemoStore((s) => s.seatView);
  const setSeatView = useCinemaDemoStore((s) => s.setSeatView);
  const smartPickSeats = useCinemaDemoStore((s) => s.smartPickSeats);
  const smartPickAnimating = useCinemaDemoStore((s) => s.smartPickAnimating);
  const selectedIds = useCinemaDemoStore((s) => s.selectedSeatIds);
  const focusedSeatId = useCinemaDemoStore((s) => s.focusedSeatId);
  const setFocusedSeatId = useCinemaDemoStore((s) => s.setFocusedSeatId);

  const storeLive = useCinemaDemoStore((s) => s.liveSeatStates);
  const effectiveLive = useMemo(
    () => ({ ...storeLive, ...liveStates }),
    [storeLive, liveStates],
  );

  const seatGrid = useMemo(() => {
    const grid: (Seat3D | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    for (const seat of seats) {
      if (seat.rowIndex < ROWS && seat.colIndex < COLS) {
        grid[seat.rowIndex][seat.colIndex] = seat;
      }
    }
    return grid;
  }, [seats]);

  const tooltipSeat = tooltipSeatId ? seats.find((s) => s.id === tooltipSeatId) : null;
  const tooltipState = tooltipSeat ? getSeatDisplayState(tooltipSeat, effectiveLive, selectedIds) : null;

  const stateLabel = (state: ReturnType<typeof getSeatDisplayState>, tier: Seat3D["tier"]) => {
    if (state === "selected") return t("seats.selected");
    if (state === "occupied") return t("seats.stateOccupied");
    if (state === "pending") return t("seats.statePending");
    if (tier === "vip") return t("seats.vipPremium");
    if (tier === "wheelchair") return t("seats.wheelchair");
    return t("seats.available");
  };

  if (variant === "controls") {
    return (
      <div className="cinema-seat-hud-controls" aria-label={t("seats.mapLabel")}>
        <div className="cinema-seat-hud-legend" aria-hidden>
          <span className="cinema-seat-hud-legend-item">
            <span className="cinema-legend-dot cinema-legend-dot--available" />
            {t("seats.legendAvailable")}
          </span>
          <span className="cinema-seat-hud-legend-item">
            <span className="cinema-legend-dot cinema-legend-dot--vip" />
            {t("seats.legendVip")}
          </span>
          <span className="cinema-seat-hud-legend-item">
            <span className="cinema-legend-dot cinema-legend-dot--occupied" />
            {t("seats.legendOccupied")}
          </span>
          <span className="cinema-seat-hud-legend-item">
            <span className="cinema-legend-dot cinema-legend-dot--selected" />
            {t("seats.legendSelected")}
          </span>
        </div>
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
          {focusedSeatId ? (
            <button
              type="button"
              className={`cinema-hud-btn ${cameraPreset === "viewFromSeat" ? "is-active" : ""}`}
              onClick={() => setCameraPreset("viewFromSeat")}
            >
              {t("seats.viewFromSeat")}
            </button>
          ) : null}
          <button
            type="button"
            className="cinema-hud-btn cinema-hud-btn--accent"
            disabled={smartPickAnimating}
            onClick={() => smartPickSeats(2)}
          >
            <CinemaIcon name="seat" size={14} />
            {smartPickAnimating ? t("seats.smartPickBusy") : t("seats.smartPick")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cinema-seat-hud-overlay" aria-live="polite" aria-atomic="true">
      <span className="cinema-sr-only">{liveAnnouncement}</span>
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
          <span className={`cinema-seat-hud-state cinema-seat-hud-state--${tooltipState}`}>
            {tooltipState ? stateLabel(tooltipState, tooltipSeat.tier) : t("seats.available")}
          </span>
        </div>
      ) : (
        <span className="cinema-seat-hud-hint">{t("seats.dragHint")}</span>
      )}

      <div className="cinema-minimap" role="img" aria-label={t("seats.mapLabel")}>
        <p className="cinema-minimap-label">{t("seats.screen")}</p>
        <div className="cinema-minimap-grid cinema-minimap-grid--dots">
          {seatGrid.map((row, ri) =>
            row.map((seat, ci) => {
              if (!seat) {
                return <span key={`${ri}-${ci}`} className="cinema-minimap-dot cinema-minimap-dot--empty" aria-hidden />;
              }
              const cls = seatStateClass(seat, effectiveLive, selectedIds);
              return (
                <button
                  key={seat.id}
                  type="button"
                  className={`cinema-minimap-dot ${cls} ${highlightRow === ri ? "is-row-focus" : ""} ${focusedSeatId === seat.id ? "is-focused" : ""}`}
                  aria-label={`${seat.row}${seat.number}`}
                  onMouseEnter={() => onHighlightRow?.(ri)}
                  onMouseLeave={() => onHighlightRow?.(null)}
                  onFocus={() => onHighlightRow?.(ri)}
                  onBlur={() => onHighlightRow?.(null)}
                  onClick={() => {
                    setFocusedSeatId(seat.id);
                    setCameraPreset("focus");
                  }}
                />
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
