/** SVG path helpers for badge clip shapes (viewBox 0 0 120 120). */

export type BadgeShape =
  | "circle"
  | "hexagon"
  | "shield"
  | "star"
  | "diamond"
  | "medallion"
  | "crest"
  | "seal";

function scallopedPath(cx: number, cy: number, r: number, lobes: number, depth: number): string {
  const points: string[] = [];
  for (let i = 0; i < lobes * 2; i += 1) {
    const angle = ((i * 180) / lobes - 90) * (Math.PI / 180);
    const radius = i % 2 === 0 ? r : r * (1 - depth);
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }
  return `M ${points.join(" L ")} Z`;
}

/** Premium 3D medallion — scalloped coin edge (Steam/Xbox-style). */
export function getMedallionPath(scale = 1): string {
  return scallopedPath(60, 60, 50 * scale, 14, 0.1);
}

/** Heraldic crest with wing extensions. */
export function getCrestPath(scale = 1): string {
  const cx = 60;
  const cy = 58;
  const r = 44 * scale;
  const wing = 18 * scale;
  return [
    `M ${cx - r - wing},${cy + 8 * scale}`,
    `Q ${cx - r - wing * 0.4},${cy - 20 * scale} ${cx - r * 0.55},${cy - 32 * scale}`,
    `L ${cx},${10 * scale}`,
    `L ${cx + r * 0.55},${cy - 32 * scale}`,
    `Q ${cx + r + wing * 0.4},${cy - 20 * scale} ${cx + r + wing},${cy + 8 * scale}`,
    `L ${cx + r},${cy + 10 * scale}`,
    `Q ${cx + r},${cy + 38 * scale} ${cx},${112 * scale}`,
    `Q ${cx - r},${cy + 38 * scale} ${cx - r},${cy + 10 * scale}`,
    "Z",
  ].join(" ");
}

/** Mythic seal — double-scalloped ring. */
export function getSealPath(scale = 1): string {
  return scallopedPath(60, 60, 52 * scale, 18, 0.14);
}

/** Map legacy + rarity to premium silhouette. */
export function resolvePremiumShape(rarity: string, shape: BadgeShape): BadgeShape {
  if (rarity === "mythic") return "seal";
  if (rarity === "legendary") return "crest";
  if (rarity === "epic" || rarity === "rare") return "medallion";
  if (shape === "shield") return "crest";
  if (shape === "star") return "seal";
  if (shape === "circle" || shape === "hexagon" || shape === "diamond") return "medallion";
  return "medallion";
}

export function getShapePath(shape: BadgeShape, scale = 1): string {
  const cx = 60;
  const cy = 60;
  const r = 52 * scale;

  switch (shape) {
    case "medallion":
      return getMedallionPath(scale);
    case "crest":
      return getCrestPath(scale);
    case "seal":
      return getSealPath(scale);
    case "circle":
      return `M ${cx},${cy} m -${r},0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
    case "hexagon": {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = ((60 * i - 30) * Math.PI) / 180;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      });
      return `M ${pts.join(" L ")} Z`;
    }
    case "shield": {
      const sr = r;
      return `M ${cx},${8 * scale} L ${cx + sr},${30 * scale} L ${cx + sr},${70 * scale} Q ${cx + sr},${112 * scale} ${cx},${115 * scale} Q ${cx - sr},${112 * scale} ${cx - sr},${70 * scale} L ${cx - sr},${30 * scale} Z`;
    }
    case "star": {
      const starPts: string[] = [];
      for (let i = 0; i < 16; i += 1) {
        const angle = ((i * 22.5 - 90) * Math.PI) / 180;
        const radius = i % 2 === 0 ? r : r * 0.45;
        starPts.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
      }
      return `M ${starPts.join(" L ")} Z`;
    }
    case "diamond": {
      const dr = r;
      return `M ${cx},${cy - dr} L ${cx + dr},${cy} L ${cx},${cy + dr} L ${cx - dr},${cy} Z`;
    }
    default:
      return getMedallionPath(scale);
  }
}

export function getRarityStarCount(rarity: string): number {
  switch (rarity) {
    case "common":
      return 1;
    case "rare":
      return 2;
    case "epic":
      return 3;
    case "legendary":
      return 4;
    case "mythic":
      return 5;
    default:
      return 1;
  }
}
