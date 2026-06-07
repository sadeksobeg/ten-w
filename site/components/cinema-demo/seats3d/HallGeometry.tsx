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

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.6, depth / 2]}>
        <planeGeometry args={[width * 1.05, depth + 4]} />
        <meshStandardMaterial color="#08070c" roughness={1} side={THREE.BackSide} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 + 0.25), 1.4, depth / 2]} rotation={[0, side * -Math.PI / 2, 0]}>
          <planeGeometry args={[depth + 4, 2.8]} />
          <meshStandardMaterial color="#0e0c16" roughness={0.95} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-width * 0.38, 0.01, depth * 0.35]}>
        <planeGeometry args={[0.12, depth * 0.7]} />
        <meshStandardMaterial color="#f5c518" emissive="#f5c518" emissiveIntensity={0.12} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width * 0.38, 0.01, depth * 0.35]}>
        <planeGeometry args={[0.12, depth * 0.7]} />
        <meshStandardMaterial color="#f5c518" emissive="#f5c518" emissiveIntensity={0.12} toneMapped={false} />
      </mesh>

      <group position={[0, 1.85, screenZ - 0.15]}>
        <mesh rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[8.2, 2.6, 0.12]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
      </group>

      <mesh position={[0, 1.1, depth + 1.2]}>
        <boxGeometry args={[2.4, 2.8, 0.15]} />
        <meshStandardMaterial color="#1a1520" roughness={0.85} />
      </mesh>
    </group>
  );
}
