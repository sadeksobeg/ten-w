"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getScreenZ } from "@/lib/cinema-demo/seat-layout-3d";

type Props = { count?: number; depth: number };

export function DustParticles({ count = 500, depth }: Props) {
  const ref = useRef<THREE.Points>(null);
  const screenZ = getScreenZ();
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  const n = mobile ? 200 : count;

  const positions = useMemo(() => {
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 2;
      arr[i * 3 + 1] = 0.5 + Math.random() * 2.5;
      arr[i * 3 + 2] = depth * 0.5 + Math.random() * (screenZ - depth * 0.3);
    }
    return arr;
  }, [n, depth, screenZ]);

  useFrame(({ clock }) => {
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

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#ffffff" transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  );
}
