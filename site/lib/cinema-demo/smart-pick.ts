import type { LiveSeatState } from "@/components/cinema-demo/hooks/useLiveSeatSimulation";
import type { Seat3D } from "@/lib/cinema-demo/seat-layout-3d";

export function pickBestSeats(
  seats: Seat3D[],
  count: number,
  liveStates: LiveSeatState,
  alreadySelected: string[],
): string[] {
  const available = seats.filter((s) => {
    if (s.occupied) return false;
    if (liveStates[s.id] === "occupied" || liveStates[s.id] === "pending") return false;
    if (alreadySelected.includes(s.id)) return false;
    return true;
  });

  if (available.length === 0) return [];

  const byRow = new Map<number, Seat3D[]>();
  for (const seat of available) {
    const list = byRow.get(seat.rowIndex) ?? [];
    list.push(seat);
    byRow.set(seat.rowIndex, list);
  }

  const sortedRows = [...byRow.entries()].sort((a, b) => a[0] - b[0]);

  for (const [, rowSeats] of sortedRows) {
    rowSeats.sort((a, b) => a.colIndex - b.colIndex);
    for (let i = 0; i <= rowSeats.length - count; i++) {
      const slice = rowSeats.slice(i, i + count);
      const contiguous = slice.every((s, idx) => idx === 0 || s.colIndex === slice[idx - 1].colIndex + 1);
      if (contiguous) {
        const centerBias = Math.abs(slice[0].colIndex - 5.5);
        if (centerBias <= 3) return slice.map((s) => s.id);
      }
    }
  }

  return available.slice(0, count).map((s) => s.id);
}
