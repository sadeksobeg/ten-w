"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  buildSeatMap,
  formatSeatLabel,
  type SeatCell,
  type SeatRow,
} from "@/lib/cinema-demo/seat-map";

type Props = {
  showtimeId: string;
  selectedIds: string[];
  onToggle: (id: string) => void;
};

function SeatButton({
  seat,
  selected,
  onToggle,
}: {
  seat: SeatCell;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  if (seat.isAisle) {
    return <span className="cinema-seat-aisle" aria-hidden />;
  }

  const classes = [
    "cinema-seat",
    seat.tier === "vip" ? "is-vip" : "",
    seat.tier === "wheelchair" ? "is-wheelchair" : "",
    seat.occupied ? "is-occupied" : "",
    selected ? "is-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      disabled={seat.occupied}
      aria-label={formatSeatLabel(seat)}
      aria-pressed={selected}
      onClick={() => onToggle(seat.id)}
    />
  );
}

export function CinemaSeatMap({ showtimeId, selectedIds, onToggle }: Props) {
  const t = useTranslations("CinemaDemo");
  const rows = useMemo(() => buildSeatMap(showtimeId), [showtimeId]);

  return (
    <div>
      <div className="cinema-screen-wrap">
        <div className="cinema-screen" aria-hidden />
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
                onToggle={onToggle}
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
