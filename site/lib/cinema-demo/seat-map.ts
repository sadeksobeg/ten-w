export type SeatTier = "standard" | "vip" | "wheelchair";

export type SeatCell = {
  id: string;
  row: string;
  number: number;
  tier: SeatTier;
  price: number;
  occupied: boolean;
  isAisle?: boolean;
};

export type SeatRow = {
  label: string;
  cells: SeatCell[];
};

const ROW_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

/** Left 3 | aisle | center 6 | aisle | right 3 */
const ROW_PATTERN = [
  { type: "seat" as const, count: 3 },
  { type: "aisle" as const },
  { type: "seat" as const, count: 6 },
  { type: "aisle" as const },
  { type: "seat" as const, count: 3 },
];

function hashOccupied(id: string, showtimeId: string): boolean {
  let h = 0;
  const s = `${showtimeId}:${id}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 5 === 0 || h % 7 === 0;
}

function tierForRow(rowIndex: number): SeatTier {
  if (rowIndex <= 1) return "vip";
  if (rowIndex === ROW_LABELS.length - 1) return "wheelchair";
  return "standard";
}

function priceForTier(tier: SeatTier): number {
  if (tier === "vip") return 20000;
  return 15000;
}

export function buildSeatMap(showtimeId: string): SeatRow[] {
  return ROW_LABELS.map((label, rowIndex) => {
    const tier = tierForRow(rowIndex);
    const price = priceForTier(tier);
    let seatNum = 1;
    const cells: SeatCell[] = [];

    for (const segment of ROW_PATTERN) {
      if (segment.type === "aisle") {
        cells.push({
          id: `${label}-aisle-${cells.length}`,
          row: label,
          number: 0,
          tier,
          price: 0,
          occupied: false,
          isAisle: true,
        });
        continue;
      }
      for (let i = 0; i < segment.count; i++) {
        const id = `${label}-${seatNum}`;
        cells.push({
          id,
          row: label,
          number: seatNum,
          tier,
          price,
          occupied: hashOccupied(id, showtimeId),
          isAisle: false,
        });
        seatNum++;
      }
    }

    return { label, cells };
  });
}

export function formatSeatLabel(seat: SeatCell): string {
  return `${seat.row}${seat.number}`;
}
