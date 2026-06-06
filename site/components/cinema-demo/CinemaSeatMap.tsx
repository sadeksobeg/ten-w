"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useLiveSeatSimulation } from "@/components/cinema-demo/hooks/useLiveSeatSimulation";
import {
  buildSeatMap,
  formatSeatLabel,
  type SeatCell,
  type SeatRow,
} from "@/lib/cinema-demo/seat-map";
import { playSeatDeselectSound, playSeatSelectSound } from "@/lib/cinema-demo/sounds";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

type Props = {
  showtimeId: string;
  selectedIds: string[];
  onToggle: (id: string) => void;
  live?: boolean;
};

function SeatButton({
  seat,
  selected,
  liveState,
  onToggle,
  soundEnabled,
}: {
  seat: SeatCell;
  selected: boolean;
  liveState?: "available" | "occupied" | "pending";
  onToggle: (id: string) => void;
  soundEnabled: boolean;
}) {
  const [tooltip, setTooltip] = useState(false);

  if (seat.isAisle) {
    return <span className="cinema-seat-aisle" aria-hidden />;
  }

  const occupied = seat.occupied || liveState === "occupied";
  const pending = liveState === "pending";

  const classes = [
    "cinema-seat",
    seat.tier === "vip" ? "is-vip" : "",
    seat.tier === "wheelchair" ? "is-wheelchair" : "",
    occupied ? "is-occupied" : "",
    pending ? "is-pending" : "",
    selected ? "is-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (occupied) return;
    if (selected) playSeatDeselectSound(soundEnabled);
    else playSeatSelectSound(soundEnabled);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
    onToggle(seat.id);
  };

  return (
    <span className="cinema-seat-wrap" onMouseEnter={() => setTooltip(true)} onMouseLeave={() => setTooltip(false)}>
      <button
        type="button"
        className={classes}
        disabled={occupied || pending}
        aria-label={formatSeatLabel(seat)}
        aria-pressed={selected}
        onClick={handleClick}
      />
      {tooltip && !occupied ? (
        <span className="cinema-seat-tooltip">
          {seat.row}
          {seat.number} · {seat.tier} · {seat.price.toLocaleString("ar-SY")}
        </span>
      ) : null}
    </span>
  );
}

export function CinemaSeatMap({ showtimeId, selectedIds, onToggle, live = false }: Props) {
  const t = useTranslations("CinemaDemo");
  const soundEnabled = useCinemaDemoStore((s) => s.soundEnabled);
  const rows = useMemo(() => buildSeatMap(showtimeId), [showtimeId]);
  const liveStates = useLiveSeatSimulation(showtimeId, live);

  return (
    <div className="cinema-seat-map-wrap">
      <div className="cinema-screen-wrap">
        <div className="cinema-screen cinema-screen--pulse" aria-hidden />
        <p className="cinema-screen-label">{t("seats.screen")}</p>
      </div>

      <div className="cinema-legend">
        <span className="cinema-legend-item">
          <span className="cinema-legend-dot" style={{ background: "rgba(255,255,255,0.15)" }} />
          {t("seats.available")}
        </span>
        <span className="cinema-legend-item">
          <span className="cinema-legend-dot" style={{ background: "#f5c518" }} />
          {t("seats.selected")}
        </span>
        <span className="cinema-legend-item">
          <span className="cinema-legend-dot" style={{ background: "rgba(201,146,42,0.5)" }} />
          {t("seats.vip")}
        </span>
        <span className="cinema-legend-item">
          <span className="cinema-legend-dot" style={{ background: "rgba(107,33,168,0.5)" }} />
          {t("seats.wheelchair")}
        </span>
        {live ? (
          <span className="cinema-legend-item">
            <span className="cinema-legend-dot cinema-legend-dot--pending" />
            {t("seats.pending")}
          </span>
        ) : null}
      </div>

      <div className="cinema-seat-map" role="group" aria-label={t("seats.mapLabel")}>
        {rows.map((row: SeatRow) => (
          <div key={row.label} className="cinema-seat-row">
            <span className="cinema-row-label">{row.label}</span>
            {row.cells.map((seat) => (
              <SeatButton
                key={seat.id}
                seat={seat}
                selected={selectedIds.includes(seat.id)}
                liveState={liveStates[seat.id]}
                onToggle={onToggle}
                soundEnabled={soundEnabled}
              />
            ))}
            <span className="cinema-row-label">{row.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function computeSeatTotal(showtimeId: string, selectedIds: string[]): number {
  const rows = buildSeatMap(showtimeId);
  const map = new Map<string, number>();
  for (const row of rows) {
    for (const cell of row.cells) {
      if (!cell.isAisle) map.set(cell.id, cell.price);
    }
  }
  return selectedIds.reduce((sum, id) => sum + (map.get(id) ?? 0), 0);
}

export function seatLabelsForSelection(showtimeId: string, selectedIds: string[]): string[] {
  const rows = buildSeatMap(showtimeId);
  const map = new Map<string, SeatCell>();
  for (const row of rows) {
    for (const cell of row.cells) {
      if (!cell.isAisle) map.set(cell.id, cell);
    }
  }
  return selectedIds.map((id) => {
    const seat = map.get(id);
    return seat ? formatSeatLabel(seat) : id;
  });
}
