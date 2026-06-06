"use client";

import { useEffect, useState } from "react";
import { buildSeatMap } from "@/lib/cinema-demo/seat-map";

export type LiveSeatState = Record<string, "available" | "occupied" | "pending">;

export function useLiveSeatSimulation(showtimeId: string, enabled = true) {
  const [liveStates, setLiveStates] = useState<LiveSeatState>({});

  useEffect(() => {
    if (!enabled) return;
    const rows = buildSeatMap(showtimeId);
    const availableIds: string[] = [];
    for (const row of rows) {
      for (const cell of row.cells) {
        if (!cell.isAisle && !cell.occupied) availableIds.push(cell.id);
      }
    }
    if (availableIds.length === 0) return;

    const interval = window.setInterval(() => {
      const pick = availableIds[Math.floor(Math.random() * availableIds.length)];
      setLiveStates((prev) => ({ ...prev, [pick]: "pending" }));
      window.setTimeout(() => {
        setLiveStates((prev) => ({
          ...prev,
          [pick]: Math.random() > 0.35 ? "occupied" : "available",
        }));
      }, 3000);
    }, 8000);

    return () => clearInterval(interval);
  }, [showtimeId, enabled]);

  return liveStates;
}
