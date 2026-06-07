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
      screenLightRef.current.intensity = eased * 3.2;
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
        position={[0, 2.4, screenZ + 1.2]}
        intensity={0}
        color="#fff4dc"
        distance={18}
        decay={1.8}
      />
      <pointLight position={[0, 5.5, screenZ + 3]} intensity={1.2} color="#fff8eb" distance={16} decay={1.6} />
      {aislePositions.map((pos, i) => (
        <pointLight key={i} position={pos} intensity={0.5} color="#ffb060" distance={5} decay={1.8} />
      ))}
    </group>
  );
}
