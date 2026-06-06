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
    boot.current = Math.min(1, boot.current + clock.getDelta() / 3);
    const eased = boot.current * boot.current * (3 - 2 * boot.current);
    if (screenLightRef.current) {
      screenLightRef.current.intensity = eased * 1.2;
    }
  });

  return (
    <group>
      <pointLight ref={screenLightRef} position={[0, 2.2, screenZ + 1]} intensity={0} color="#E8F4FF" distance={12} decay={2} />
      <directionalLight castShadow shadow-mapSize={[1024, 1024]} position={[0, 8, screenZ + 4]} intensity={0.5} color="#fff5e8" />
      {Array.from({ length: 12 }, (_, i) => (
        <pointLight key={i} position={[(i % 2 === 0 ? -1 : 1) * (width * 0.35), 0.15, (i / 12) * depth]} intensity={0.3} color="#FFA040" distance={3} decay={2} />
      ))}
      {[0.25, 0.45, 0.65, 0.85].map((t) => (
        <pointLight key={t} position={[0, 3.4, depth * t]} intensity={0.15} color="#ffffff" distance={8} decay={2} />
      ))}
      {vipSeats.slice(0, 8).map((seat) => (
        <pointLight key={seat.id} position={[seat.x, 0.05, seat.z]} intensity={0.5} color="#c9922a" distance={1.2} decay={2} />
      ))}
      <pointLight position={[-width / 2, 2.5, depth + 0.5]} intensity={0.2} color="#ff2020" distance={4} decay={2} />
      <pointLight position={[width / 2, 2.5, depth + 0.5]} intensity={0.2} color="#ff2020" distance={4} decay={2} />
    </group>
  );
}
