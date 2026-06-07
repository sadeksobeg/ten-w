"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CinemaSeatMap } from "@/components/cinema-demo/CinemaSeatMap";
import { useLiveSeatSimulation } from "@/components/cinema-demo/hooks/useLiveSeatSimulation";
import { useWebGLSupport } from "@/components/cinema-demo/hooks/useWebGLSupport";
import { SeatHud } from "@/components/cinema-demo/seats3d/SeatHud";
import { buildSeatLayout3D } from "@/lib/cinema-demo/seat-layout-3d";
import { getSeatDisplayState, isSeatSelectable } from "@/lib/cinema-demo/seat-select";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

const CinemaSeatHall3D = dynamic(
  () =>
    import("@/components/cinema-demo/seats3d/CinemaSeatHall3D").then((m) => m.CinemaSeatHall3D),
  { ssr: false, loading: () => <div className="cinema-hall-3d cinema-hall-3d--loading" /> },
);

type Props = {
  showtimeId: string;
  selectedIds: string[];
  onToggle: (id: string) => void;
  live?: boolean;
};

export function CinemaSeatExperience({ showtimeId, selectedIds, onToggle, live = true }: Props) {
  const t = useTranslations("CinemaDemo");
  const seatView = useCinemaDemoStore((s) => s.seatView);
  const setSeatView = useCinemaDemoStore((s) => s.setSeatView);
  const hudHoverSeatId = useCinemaDemoStore((s) => s.hudHoverSeatId);
  const setFocusedSeatId = useCinemaDemoStore((s) => s.setFocusedSeatId);
  const setCameraPreset = useCinemaDemoStore((s) => s.setCameraPreset);
  const liveSeatStates = useCinemaDemoStore((s) => s.liveSeatStates);
  const { prefer2D, reducedMotion3D } = useWebGLSupport();
  const liveStates = useLiveSeatSimulation(showtimeId, live);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [highlightRow, setHighlightRow] = useState<number | null>(null);

  const layout = useMemo(() => buildSeatLayout3D(showtimeId), [showtimeId]);
  const { seats, bounds } = layout;

  useEffect(() => {
    if (prefer2D && seatView === "3d") setSeatView("2d");
  }, [prefer2D, seatView, setSeatView]);

  const use3D = seatView === "3d" && !prefer2D;
  const mergedLive = use3D ? liveSeatStates : liveStates;

  const liveAnnouncement = useMemo(() => {
    if (selectedIds.length === 0) return t("seats.keyboardNone");
    const labels = selectedIds
      .map((id) => {
        const seat = seats.find((s) => s.id === id);
        return seat ? `${seat.row}${seat.number}` : id;
      })
      .join(", ");
    return t("seats.keyboardSelected", { seats: labels, count: selectedIds.length });
  }, [selectedIds, seats, t]);

  return (
    <div className="cinema-seat-experience">
      {prefer2D ? (
        <p className="cinema-webgl-fallback">{t("seats.webglFallback")}</p>
      ) : (
        <SeatHud seats={seats} tooltipSeatId={hudHoverSeatId} variant="controls" liveStates={mergedLive} />
      )}
      {use3D ? (
        <CinemaSeatHall3D
          showtimeId={showtimeId}
          seats={seats}
          bounds={bounds}
          tooltipSeatId={hudHoverSeatId}
          reducedMotion3D={reducedMotion3D}
          highlightRow={highlightRow}
          onHighlightRow={setHighlightRow}
          liveAnnouncement={liveAnnouncement}
        />
      ) : (
        <CinemaSeatMap showtimeId={showtimeId} selectedIds={selectedIds} onToggle={onToggle} live={live} />
      )}

      {use3D ? (
        <div className="cinema-seat-keyboard-panel">
          <button
            type="button"
            className="cinema-hud-btn cinema-seat-keyboard-toggle"
            aria-expanded={keyboardOpen}
            onClick={() => setKeyboardOpen((v) => !v)}
          >
            {keyboardOpen ? t("seats.keyboardHide") : t("seats.keyboardShow")}
          </button>
          {keyboardOpen ? (
            <div className="cinema-seat-keyboard-grid" role="group" aria-label={t("seats.keyboardLabel")}>
              {seats.map((seat) => {
                const state = getSeatDisplayState(seat, mergedLive, selectedIds);
                const selectable = isSeatSelectable(seat, mergedLive, selectedIds);
                return (
                  <button
                    key={seat.id}
                    type="button"
                    className={`cinema-seat-keyboard-btn cinema-seat-keyboard-btn--${state}`}
                    aria-pressed={selectedIds.includes(seat.id)}
                    disabled={!selectable && !selectedIds.includes(seat.id)}
                    onClick={() => {
                      onToggle(seat.id);
                      setFocusedSeatId(seat.id);
                      setCameraPreset("focus");
                    }}
                  >
                    {seat.row}
                    {seat.number}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
