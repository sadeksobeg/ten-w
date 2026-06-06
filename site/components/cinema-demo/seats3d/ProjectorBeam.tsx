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
      const flicker = 1 + Math.sin(clock.elapsedTime * 60) * 0.005;
      lightRef.current.intensity = 0.6 * flicker;
    }
  });

  return (
    <group position={[0, 3.8, depth * 0.85]}>
      <mesh rotation={[Math.PI / 2 - 0.35, 0, 0]} position={[0, 0, -2]}>
        <coneGeometry args={[1.2, 6, 16, 1, true]} />
        <meshBasicMaterial color="#E8F4FF" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0]} intensity={0.6} color="#E8F4FF" distance={14} decay={2} />
      <mesh position={[0, -2, screenZ - depth * 0.85 + 2]} visible={false}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
      </mesh>
    </group>
  );
}
