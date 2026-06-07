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

  type Candidate = { ids: string[]; score: number };
  const candidates: Candidate[] = [];

  for (const [rowIndex, rowSeats] of sortedRows) {
    rowSeats.sort((a, b) => a.colIndex - b.colIndex);
    for (let i = 0; i <= rowSeats.length - count; i++) {
      const slice = rowSeats.slice(i, i + count);
      const contiguous = slice.every((s, idx) => idx === 0 || s.colIndex === slice[idx - 1].colIndex + 1);
      if (!contiguous) continue;
      const centerBias = Math.abs((slice[0].colIndex + slice[slice.length - 1].colIndex) / 2 - 5.5);
      const vipBonus = slice.some((s) => s.tier === "vip") ? -1.5 : 0;
      const frontBonus = rowIndex * -0.4;
      candidates.push({ ids: slice.map((s) => s.id), score: centerBias + vipBonus + frontBonus });
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => a.score - b.score);
    return candidates[0].ids;
  }

  const vipFirst = [...available].sort((a, b) => {
    const tierScore = (s: Seat3D) => (s.tier === "vip" ? 0 : s.tier === "standard" ? 1 : 2);
    return tierScore(a) - tierScore(b) || a.rowIndex - b.rowIndex;
  });
  return vipFirst.slice(0, count).map((s) => s.id);
}
