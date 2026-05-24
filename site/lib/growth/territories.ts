export const TERRITORY_KEYS = [
  "damascus",
  "aleppo",
  "beirut",
  "riyadh",
  "dubai",
  "cairo",
  "amman",
  "baghdad",
  "kuwait",
  "doha",
  "casablanca",
  "tunis",
] as const;

export type TerritoryKey = (typeof TERRITORY_KEYS)[number];

export const TERRITORY_COORDS: Record<TerritoryKey, { x: number; y: number }> = {
  damascus: { x: 520, y: 185 },
  aleppo: { x: 505, y: 160 },
  beirut: { x: 510, y: 195 },
  amman: { x: 525, y: 205 },
  riyadh: { x: 570, y: 250 },
  dubai: { x: 630, y: 255 },
  doha: { x: 610, y: 255 },
  kuwait: { x: 590, y: 230 },
  baghdad: { x: 565, y: 200 },
  cairo: { x: 490, y: 225 },
  casablanca: { x: 340, y: 215 },
  tunis: { x: 420, y: 195 },
};

export function isTerritoryKey(value: string): value is TerritoryKey {
  return (TERRITORY_KEYS as readonly string[]).includes(value);
}

export type WarMapCity = {
  key: TerritoryKey;
  x: number;
  y: number;
  partnerCount: number;
  controllers: { userId: string; name: string; deals: number }[];
  isMine: boolean;
  isRival: boolean;
  isUnclaimed: boolean;
};

export type WarMapNetworkLine = {
  from: TerritoryKey;
  to: TerritoryKey;
};

export type WarMapData = {
  cities: WarMapCity[];
  myTerritory: TerritoryKey | null;
  rivalTerritory: TerritoryKey | null;
  networkLines: WarMapNetworkLine[];
};
