import * as THREE from "three";
import type { SeatTier } from "@/lib/cinema-demo/seat-map";

function mergeBox(
  target: THREE.BufferGeometry,
  w: number,
  h: number,
  d: number,
  px: number,
  py: number,
  pz: number,
): THREE.BufferGeometry {
  const box = new THREE.BoxGeometry(w, h, d);
  box.translate(px, py, pz);
  return mergeGeometries([target, box]);
}

function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  for (const g of geos) {
    const pos = g.attributes.position as THREE.BufferAttribute;
    const norm = g.attributes.normal as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
    }
    g.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  merged.computeBoundingSphere();
  return merged;
}

export function createSeatGeometry(tier: SeatTier): THREE.BufferGeometry {
  if (tier === "wheelchair") {
    let g: THREE.BufferGeometry = new THREE.BoxGeometry(0.72, 0.12, 0.68);
    g = mergeBox(g, 0.62, 0.22, 0.08, 0, 0.17, -0.28);
    return g;
  }

  const wide = tier === "vip" ? 1.12 : 1;
  const seatW = 0.52 * wide;
  const armW = 0.07 * wide;
  const armH = 0.22;
  const armD = 0.38;

  let g: THREE.BufferGeometry = new THREE.BoxGeometry(seatW, 0.14, 0.42);
  g = mergeBox(g, seatW * 0.92, 0.32, 0.1, 0, 0.24, -0.18);
  g = mergeBox(g, armW, armH, armD, -(seatW / 2 + armW / 2 - 0.02), 0.12, 0);
  g = mergeBox(g, armW, armH, armD, seatW / 2 + armW / 2 - 0.02, 0.12, 0);
  if (tier === "vip") {
    g = mergeBox(g, seatW * 0.5, 0.06, 0.35, 0, 0.38, -0.05);
  }
  return g;
}
