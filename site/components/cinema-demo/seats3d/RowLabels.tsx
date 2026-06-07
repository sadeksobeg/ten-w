"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { Seat3D } from "@/lib/cinema-demo/seat-layout-3d";

type Props = { seats: Seat3D[] };

function rowTexture(label: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(245,197,24,0.9)";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, canvas.width / 2, canvas.height / 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function RowLabels({ seats }: Props) {
  const rows = useMemo(() => {
    const map = new Map<number, { label: string; x: number; z: number }>();
    for (const seat of seats) {
      if (!map.has(seat.rowIndex)) {
        const rowSeats = seats.filter((s) => s.rowIndex === seat.rowIndex);
        const minX = Math.min(...rowSeats.map((s) => s.x));
        map.set(seat.rowIndex, { label: seat.row, x: minX - 0.55, z: seat.z });
      }
    }
    return [...map.values()];
  }, [seats]);

  return (
    <group>
      {rows.map((row) => (
        <sprite key={row.label} position={[row.x, 0.06, row.z]} scale={[0.45, 0.18, 1]}>
          <spriteMaterial map={rowTexture(row.label)} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}
