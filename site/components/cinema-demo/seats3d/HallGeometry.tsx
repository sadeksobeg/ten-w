"use client";

import * as THREE from "three";
import { getScreenZ } from "@/lib/cinema-demo/seat-layout-3d";

type Props = { width: number; depth: number };

export function HallGeometry({ width, depth }: Props) {
  const screenZ = getScreenZ();

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, depth / 2]} receiveShadow>
        <planeGeometry args={[width, depth + 6]} />
        <meshStandardMaterial color="#221e2e" roughness={0.35} metalness={0.18} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 + 0.25), 1.4, depth / 2]} rotation={[0, side * -Math.PI / 2, 0]}>
          <planeGeometry args={[depth + 4, 2.8]} />
          <meshStandardMaterial color="#0e0c16" roughness={0.95} />
        </mesh>
      ))}

      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, 3.2, depth * 0.2 + i * 1.2]}>
          <boxGeometry args={[width * 0.9, 0.08, 0.6]} />
          <meshStandardMaterial color="#121018" roughness={0.9} />
        </mesh>
      ))}

      <group position={[0, 1.85, screenZ - 0.15]}>
        <mesh rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[8.2, 2.6, 0.12]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
        <mesh rotation={[-0.08, 0, 0]} position={[0, 0, 0.02]}>
          <boxGeometry args={[7.9, 2.35, 0.02]} />
          <meshStandardMaterial color="#c9922a" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      <mesh position={[0, 1.1, depth + 1.2]}>
        <boxGeometry args={[2.4, 2.8, 0.15]} />
        <meshStandardMaterial color="#1a1520" roughness={0.85} />
      </mesh>
    </group>
  );
}
