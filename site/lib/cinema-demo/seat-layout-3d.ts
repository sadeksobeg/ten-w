import { buildSeatMap, type SeatTier } from "@/lib/cinema-demo/seat-map";

export type Seat3D = {
  id: string;
  row: string;
  number: number;
  tier: SeatTier;
  price: number;
  occupied: boolean;
  rowIndex: number;
  colIndex: number;
  x: number;
  y: number;
  z: number;
  scale: number;
};

export type AuditoriumBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerZ: number;
};

const SEAT_PITCH = 0.42;
const ROW_DEPTH = 0.52;
const RAKE_Y = 0.18;
const AISLE_W = 0.65;
const SCREEN_Z = -5.2;

function colToX(colIndex: number, tier: SeatTier): number {
  let x = (colIndex - 5.5) * SEAT_PITCH;
  if (colIndex >= 3) x += AISLE_W * 0.5;
  if (colIndex >= 10) x += AISLE_W * 0.5;
  const vipScale = tier === "vip" ? 1.08 : 1;
  return x * vipScale;
}

export function buildSeatLayout3D(showtimeId: string): { seats: Seat3D[]; bounds: AuditoriumBounds } {
  const rows = buildSeatMap(showtimeId);
  const seats: Seat3D[] = [];

  rows.forEach((row, rowIndex) => {
    let colIndex = 0;
    for (const cell of row.cells) {
      if (cell.isAisle) {
        colIndex++;
        continue;
      }
      const z = rowIndex * ROW_DEPTH;
      const y = rowIndex * RAKE_Y;
      const scale = cell.tier === "vip" ? 1.12 : cell.tier === "wheelchair" ? 1.05 : 1;
      seats.push({
        id: cell.id,
        row: cell.row,
        number: cell.number,
        tier: cell.tier,
        price: cell.price,
        occupied: cell.occupied,
        rowIndex,
        colIndex,
        x: colToX(colIndex, cell.tier),
        y,
        z,
        scale,
      });
      colIndex++;
    }
  });

  const xs = seats.map((s) => s.x);
  const zs = seats.map((s) => s.z);
  const bounds: AuditoriumBounds = {
    minX: Math.min(...xs) - 0.5,
    maxX: Math.max(...xs) + 0.5,
    minZ: -0.5,
    maxZ: Math.max(...zs) + 0.8,
    centerX: (Math.min(...xs) + Math.max(...xs)) / 2,
    centerZ: Math.max(...zs) / 2,
  };

  return { seats, bounds };
}

export function getScreenZ() {
  return SCREEN_Z;
}

export function seatById(showtimeId: string, id: string): Seat3D | undefined {
  return buildSeatLayout3D(showtimeId).seats.find((s) => s.id === id);
}
