"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getScreenZ } from "@/lib/cinema-demo/seat-layout-3d";

type Props = { depth: number };

export function ProjectorBeam({ depth }: Props) {
  const lightRef = useRef<THREE.PointLight>(null);
  const screenZ = getScreenZ();

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const flicker = 1 + Math.sin(clock.elapsedTime * 60) * 0.008;
      lightRef.current.intensity = 1.15 * flicker;
    }
  });

  return (
    <group position={[0, 3.8, depth * 0.85]}>
      <mesh rotation={[Math.PI / 2 - 0.35, 0, 0]} position={[0, 0, -2]}>
        <coneGeometry args={[1.35, 6.5, 20, 1, true]} />
        <meshBasicMaterial color="#fff8e8" transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2 - 0.35, 0, 0]} position={[0, 0, -2]}>
        <coneGeometry args={[0.85, 6.5, 20, 1, true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0]} intensity={1.15} color="#fff8eb" distance={18} decay={1.6} />
      <mesh position={[0, -2, screenZ - depth * 0.85 + 2]} visible={false}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
      </mesh>
    </group>
  );
}
