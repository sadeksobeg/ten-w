import type { LiveSeatState } from "@/components/cinema-demo/hooks/useLiveSeatSimulation";
import type { Seat3D } from "@/lib/cinema-demo/seat-layout-3d";

export type SeatDisplayState = "available" | "selected" | "occupied" | "pending";

export function isSeatSelectable(
  seat: Seat3D,
  liveStates: LiveSeatState,
  selectedIds: string[],
): boolean {
  if (seat.occupied || liveStates[seat.id] === "occupied" || liveStates[seat.id] === "pending") {
    return false;
  }
  if (!selectedIds.includes(seat.id) && selectedIds.length >= 6) return false;
  return true;
}

export function getSeatDisplayState(
  seat: Seat3D,
  liveStates: LiveSeatState,
  selectedIds: string[],
): SeatDisplayState {
  if (selectedIds.includes(seat.id)) return "selected";
  if (seat.occupied || liveStates[seat.id] === "occupied") return "occupied";
  if (liveStates[seat.id] === "pending") return "pending";
  return "available";
}
