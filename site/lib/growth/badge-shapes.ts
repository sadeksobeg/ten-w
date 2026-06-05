/** Mathematically precise badge clip shapes (viewBox 0 0 120 120). */

export type BadgeShape = "circle" | "hexagon" | "shield" | "star" | "diamond";

const CX = 60;
const CY = 60;
const R = 52;

export function getShapePath(shape: BadgeShape, scale = 1): string {
  const cx = CX;
  const cy = CY;
  const r = R * scale;

  switch (shape) {
    case "circle":
      return `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy} Z`;

    case "hexagon": {
      const pts: string[] = [];
      for (let i = 0; i < 6; i += 1) {
        const angle = ((Math.PI * 2) / 6) * i - Math.PI / 6;
        pts.push(`${(cx + r * Math.cos(angle)).toFixed(3)},${(cy + r * Math.sin(angle)).toFixed(3)}`);
      }
      return `M ${pts.join(" L ")} Z`;
    }

    case "shield":
      return `M ${cx},${8 * scale + cy - CY * scale}
        C ${cx + 48 * scale},${8 * scale + cy - CY * scale}
          ${cx + 48 * scale},${cy - 14 * scale}
          ${cx + 48 * scale},${cy + 8 * scale}
        C ${cx + 48 * scale},${cy + 32 * scale}
          ${cx + 26 * scale},${cy + 55 * scale}
          ${cx},${cy + 55 * scale}
        C ${cx - 26 * scale},${cy + 55 * scale}
          ${cx - 48 * scale},${cy + 32 * scale}
          ${cx - 48 * scale},${cy + 8 * scale}
        C ${cx - 48 * scale},${cy - 14 * scale}
          ${cx - 48 * scale},${8 * scale + cy - CY * scale}
          ${cx},${8 * scale + cy - CY * scale} Z`;

    case "star": {
      const outerR = 52 * scale;
      const innerR = 22 * scale;
      const pts: string[] = [];
      for (let i = 0; i < 16; i += 1) {
        const angle = (Math.PI / 8) * i - Math.PI / 2;
        const rr = i % 2 === 0 ? outerR : innerR;
        pts.push(`${(cx + rr * Math.cos(angle)).toFixed(3)},${(cy + rr * Math.sin(angle)).toFixed(3)}`);
      }
      return `M ${pts.join(" L ")} Z`;
    }

    case "diamond": {
      const dr = 55 * scale;
      return `M ${cx},${cy - dr} L ${cx + dr},${cy} L ${cx},${cy + dr} L ${cx - dr},${cy} Z`;
    }

    default:
      return getShapePath("hexagon", scale);
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

/** @deprecated Use badge `shape` from badge-visual directly — no premium remapping. */
export function resolvePremiumShape(rarity: string, shape: BadgeShape): BadgeShape {
  void rarity;
  return shape;
}

/** @deprecated Legacy medallion paths — kept for backward compat imports. */
export type LegacyBadgeShape = BadgeShape | "medallion" | "crest" | "seal";

export function getMedallionPath(scale = 1): string {
  return getShapePath("circle", scale * 0.96);
}

export function getCrestPath(scale = 1): string {
  return getShapePath("shield", scale);
}

export function getSealPath(scale = 1): string {
  return getShapePath("star", scale);
}
