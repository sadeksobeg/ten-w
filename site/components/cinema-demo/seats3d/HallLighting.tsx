"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Seat3D } from "@/lib/cinema-demo/seat-layout-3d";
import { getScreenZ } from "@/lib/cinema-demo/seat-layout-3d";

type Props = { width: number; depth: number; seats: Seat3D[] };

export function HallLighting({ width, depth, seats }: Props) {
  const screenZ = getScreenZ();
  const screenLightRef = useRef<THREE.PointLight>(null);
  const boot = useRef(0);
  const vipSeats = seats.filter((s) => s.tier === "vip");

  useFrame(({ clock }) => {
    boot.current = Math.min(1, boot.current + clock.getDelta() / 2.2);
    const eased = boot.current * boot.current * (3 - 2 * boot.current);
    if (screenLightRef.current) {
      screenLightRef.current.intensity = eased * 3.2;
    }
  });

  return (
    <group>
      <pointLight
        ref={screenLightRef}
        position={[0, 2.4, screenZ + 1.2]}
        intensity={0}
        color="#fff4dc"
        distance={18}
        decay={1.8}
      />
      <pointLight position={[0, 5.5, screenZ + 3]} intensity={1.2} color="#fff8eb" distance={16} decay={1.6} />
      <directionalLight
        castShadow
        shadow-mapSize={[1024, 1024]}
        position={[0, 9, screenZ + 5]}
        intensity={0.95}
        color="#fff5e8"
      />
      {Array.from({ length: 14 }, (_, i) => (
        <pointLight
          key={i}
          position={[(i % 2 === 0 ? -1 : 1) * (width * 0.38), 0.35, (i / 14) * depth]}
          intensity={0.55}
          color="#ffb060"
          distance={4}
          decay={1.8}
        />
      ))}
      {[0.2, 0.4, 0.6, 0.8].map((t) => (
        <pointLight key={t} position={[0, 3.6, depth * t]} intensity={0.35} color="#ffffff" distance={10} decay={1.6} />
      ))}
      {vipSeats.slice(0, 10).map((seat) => (
        <pointLight key={seat.id} position={[seat.x, 0.12, seat.z]} intensity={0.85} color="#f5c518" distance={1.6} decay={1.8} />
      ))}
      <pointLight position={[-width / 2, 2.8, depth + 0.5]} intensity={0.35} color="#ff5050" distance={5} decay={2} />
      <pointLight position={[width / 2, 2.8, depth + 0.5]} intensity={0.35} color="#ff5050" distance={5} decay={2} />
    </group>
  );
}
