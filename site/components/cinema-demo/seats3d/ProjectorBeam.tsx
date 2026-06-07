"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getScreenZ } from "@/lib/cinema-demo/seat-layout-3d";

type Props = { depth: number; visible?: boolean };

export function ProjectorBeam({ depth, visible = true }: Props) {
  const lightRef = useRef<THREE.PointLight>(null);
  const screenZ = getScreenZ();

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const flicker = 1 + Math.sin(clock.elapsedTime * 60) * 0.006;
      lightRef.current.intensity = 0.85 * flicker;
    }
  });

  if (!visible) {
    return (
      <pointLight
        ref={lightRef}
        position={[0, 4.2, depth + 0.5]}
        intensity={0.85}
        color="#fff8eb"
        distance={14}
        decay={1.8}
      />
    );
  }

  return (
    <group position={[0, 4.4, depth + 0.35]}>
      <mesh rotation={[Math.PI / 2 - 0.42, 0, 0]} position={[0, 0, -1.5]}>
        <coneGeometry args={[0.55, 5.5, 16, 1, true]} />
        <meshBasicMaterial
          color="#fff8e8"
          transparent
          opacity={0.035}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0]} intensity={0.85} color="#fff8eb" distance={14} decay={1.8} />
      <mesh position={[0, -1.2, screenZ - depth - 0.35 + 1.5]} visible={false}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
      </mesh>
    </group>
  );
}
