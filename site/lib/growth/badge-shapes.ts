/** SVG path helpers for badge clip shapes (viewBox 0 0 120 120). */

export type BadgeShape = "circle" | "hexagon" | "shield" | "star" | "diamond";

export function getShapePath(shape: BadgeShape, scale = 1): string {
  const cx = 60;
  const cy = 60;
  const r = 52 * scale;

  switch (shape) {
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
