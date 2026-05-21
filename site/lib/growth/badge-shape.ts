import type { BadgeShapeId } from "@/lib/growth/badge-visual";

/** Returns SVG clip path `d` or polygon points for badge silhouette. */
export function badgeShapeElement(
  shapeId: BadgeShapeId,
  px: number,
): { type: "path"; d: string } | { type: "polygon"; points: string } {
  const h = px / 2;
  const r = px * 0.44;

  switch (shapeId) {
    case "shield":
      return {
        type: "path",
        d: `M${h} ${px * 0.06} L${px * 0.88} ${px * 0.22} L${px * 0.78} ${px * 0.92} L${h} ${px * 0.98} L${px * 0.12} ${px * 0.92} L${px * 0.12} ${px * 0.22} Z`,
      };
    case "medal":
      return {
        type: "path",
        d: `M${h} ${px * 0.08} C${px * 0.75} ${px * 0.08} ${px * 0.9} ${px * 0.35} ${px * 0.9} ${h} S${px * 0.75} ${px * 0.92} ${h} ${px * 0.92} S${px * 0.1} ${px * 0.75} ${px * 0.1} ${h} S${px * 0.25} ${px * 0.08} ${h} ${px * 0.08} Z`,
      };
    case "diamond_frame":
      return {
        type: "polygon",
        points: `${h},${px * 0.04} ${px * 0.96},${h} ${h},${px * 0.96} ${px * 0.04},${h}`,
      };
    case "hexagon": {
      const pts = Array.from({ length: 6 })
        .map((_, i) => {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          return `${h + r * Math.cos(a)},${h + r * Math.sin(a)}`;
        })
        .join(" ");
      return { type: "polygon", points: pts };
    }
    case "pentagon":
      return {
        type: "path",
        d: `M${h} ${px * 0.08} L${px * 0.9} ${px * 0.32} L${px * 0.75} ${px * 0.9} L${px * 0.25} ${px * 0.9} L${px * 0.1} ${px * 0.32} Z`,
      };
    case "octagon": {
      const pts = Array.from({ length: 8 })
        .map((_, i) => {
          const a = (Math.PI / 4) * i - Math.PI / 8;
          return `${h + r * Math.cos(a)},${h + r * Math.sin(a)}`;
        })
        .join(" ");
      return { type: "polygon", points: pts };
    }
    case "crest":
      return {
        type: "path",
        d: `M${h} ${px * 0.05} L${px * 0.7} ${px * 0.2} L${px * 0.95} ${h} L${px * 0.7} ${px * 0.85} L${h} ${px * 0.95} L${px * 0.3} ${px * 0.85} L${px * 0.05} ${h} L${px * 0.3} ${px * 0.2} Z`,
      };
    case "star16": {
      const pts: string[] = [];
      for (let i = 0; i < 16; i += 1) {
        const a = (Math.PI / 8) * i - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r * 0.42;
        pts.push(`${h + rad * Math.cos(a)},${h + rad * Math.sin(a)}`);
      }
      return { type: "polygon", points: pts.join(" ") };
    }
    case "circle":
    default:
      return { type: "path", d: `M ${h} ${h} m -${r},0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0` };
  }
}
