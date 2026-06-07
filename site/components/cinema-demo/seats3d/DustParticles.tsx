"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getScreenZ } from "@/lib/cinema-demo/seat-layout-3d";

type Props = { count?: number; depth: number; enabled?: boolean };

export function DustParticles({ count = 80, depth, enabled = true }: Props) {
  const ref = useRef<THREE.Points>(null);
  const screenZ = getScreenZ();
  const n = enabled ? count : 0;

  const positions = useMemo(() => {
    if (n === 0) return new Float32Array(0);
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 2;
      arr[i * 3 + 1] = 0.5 + Math.random() * 2.5;
      arr[i * 3 + 2] = depth * 0.5 + Math.random() * (screenZ - depth * 0.3);
    }
    return arr;
  }, [n, depth, screenZ]);

  useFrame(({ clock }) => {
    if (!enabled || n === 0) return;
    const pts = ref.current;
    if (!pts) return;
    const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < n; i++) {
      pos.setX(i, pos.getX(i) + Math.sin(clock.elapsedTime + i) * 0.002);
      pos.setY(i, pos.getY(i) + Math.cos(clock.elapsedTime * 0.7 + i) * 0.001);
      pos.setZ(i, pos.getZ(i) + 0.008);
      if (pos.getZ(i) > screenZ + 1) pos.setZ(i, depth * 0.5);
    }
    pos.needsUpdate = true;
  });

  if (n === 0) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#ffffff" transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  );
}
