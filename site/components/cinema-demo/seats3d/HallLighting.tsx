"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getScreenZ } from "@/lib/cinema-demo/seat-layout-3d";

type Props = { width: number; depth: number };

export function HallLighting({ width, depth }: Props) {
  const screenZ = getScreenZ();
  const screenLightRef = useRef<THREE.PointLight>(null);
  const boot = useRef(0);

  useFrame(({ clock }) => {
    boot.current = Math.min(1, boot.current + clock.getDelta() / 2.2);
    const eased = boot.current * boot.current * (3 - 2 * boot.current);
    if (screenLightRef.current) {
      screenLightRef.current.intensity = eased * 4.5;
    }
  });

  const aislePositions: [number, number, number][] = [
    [-width * 0.38, 0.35, depth * 0.2],
    [width * 0.38, 0.35, depth * 0.2],
    [-width * 0.38, 0.35, depth * 0.55],
    [width * 0.38, 0.35, depth * 0.55],
  ];

  return (
    <group>
      <directionalLight
        castShadow
        shadow-mapSize={[1024, 1024]}
        position={[0, 9, screenZ + 5]}
        intensity={0.95}
        color="#fff5e8"
      />
      <pointLight
        ref={screenLightRef}
        position={[0, 2.2, screenZ + 0.6]}
        intensity={0}
        color="#fff4dc"
        distance={22}
        decay={1.6}
      />
      <pointLight position={[0, 1.85, screenZ + 1.5]} intensity={1.8} color="#ffffff" distance={12} decay={1.4} />
      <pointLight position={[0, 0.2, screenZ + 2.5]} intensity={0.35} color="#ffe8c8" distance={14} decay={1.8} />
      {aislePositions.map((pos, i) => (
        <pointLight key={i} position={pos} intensity={0.5} color="#ffb060" distance={5} decay={1.8} />
      ))}
    </group>
  );
}
