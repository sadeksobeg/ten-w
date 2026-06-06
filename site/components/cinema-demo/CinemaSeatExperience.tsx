"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { CinemaSeatMap } from "@/components/cinema-demo/CinemaSeatMap";
import { useWebGLSupport } from "@/components/cinema-demo/hooks/useWebGLSupport";
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
  const { prefer2D } = useWebGLSupport();

  useEffect(() => {
    if (prefer2D && seatView === "3d") setSeatView("2d");
  }, [prefer2D, seatView, setSeatView]);

  const use3D = seatView === "3d" && !prefer2D;

  return (
    <div className="cinema-seat-experience">
      {prefer2D ? (
        <p className="cinema-webgl-fallback">{t("seats.webglFallback")}</p>
      ) : null}
      {use3D ? (
        <CinemaSeatHall3D showtimeId={showtimeId} />
      ) : (
        <CinemaSeatMap showtimeId={showtimeId} selectedIds={selectedIds} onToggle={onToggle} live={live} />
      )}
    </div>
  );
}
