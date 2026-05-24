/** Syrian governorates + Salamiyah (Hama region) — war map territories */
export const TERRITORY_KEYS = [
  "damascus",
  "rif_dimashq",
  "aleppo",
  "homs",
  "hama",
  "salamiyah",
  "latakia",
  "tartus",
  "idlib",
  "raqqa",
  "deir_ez_zor",
  "hasakah",
  "daraa",
  "suwayda",
  "quneitra",
] as const;

export type TerritoryKey = (typeof TERRITORY_KEYS)[number];

/** Simplified Syria silhouette (viewBox 0 0 720 520) */
export const SYRIA_MAP_VIEWBOX = { width: 720, height: 520 } as const;

export const SYRIA_OUTLINE_PATH =
  "M 118 198 L 132 158 L 168 118 L 218 88 L 298 72 L 388 68 L 478 78 L 558 108 L 598 148 L 612 198 L 608 248 L 582 298 L 538 342 L 468 372 L 388 382 L 308 376 L 248 358 L 198 328 L 158 288 L 128 242 Z";

export const TERRITORY_COORDS: Record<TerritoryKey, { x: number; y: number }> = {
  aleppo: { x: 218, y: 108 },
  idlib: { x: 178, y: 138 },
  latakia: { x: 148, y: 168 },
  tartus: { x: 138, y: 202 },
  hama: { x: 268, y: 168 },
  salamiyah: { x: 318, y: 182 },
  homs: { x: 238, y: 212 },
  raqqa: { x: 398, y: 118 },
  hasakah: { x: 528, y: 98 },
  deir_ez_zor: { x: 488, y: 208 },
  damascus: { x: 278, y: 288 },
  rif_dimashq: { x: 298, y: 268 },
  quneitra: { x: 228, y: 308 },
  daraa: { x: 258, y: 338 },
  suwayda: { x: 308, y: 328 },
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
