"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { LiveSeatState } from "@/components/cinema-demo/hooks/useLiveSeatSimulation";
import type { Seat3D } from "@/lib/cinema-demo/seat-layout-3d";
import { getScreenZ } from "@/lib/cinema-demo/seat-layout-3d";

type Props = {
  seats: Seat3D[];
  selectedIds: string[];
  liveStates: LiveSeatState;
  hoveredId: string | null;
  highlightRow: number | null;
  onSeatClick: (id: string) => void;
  onSeatHover: (id: string | null) => void;
};

const COLORS = {
  available: new THREE.Color("#3a3a42"),
  vip: new THREE.Color("#5c4a1a"),
  wheelchair: new THREE.Color("#3d2a5c"),
  selected: new THREE.Color("#f5c518"),
  occupied: new THREE.Color("#1a1a1e"),
  pending: new THREE.Color("#c9922a"),
  dim: new THREE.Color("#222228"),
};

function seatColor(
  seat: Seat3D,
  selected: boolean,
  live: LiveSeatState[string] | undefined,
  hovered: boolean,
  rowHighlight: boolean,
): THREE.Color {
  if (selected) return COLORS.selected;
  if (seat.occupied || live === "occupied") return COLORS.occupied;
  if (live === "pending") return COLORS.pending;
  if (seat.tier === "vip") return hovered || rowHighlight ? COLORS.selected.clone().lerp(COLORS.vip, 0.5) : COLORS.vip;
  if (seat.tier === "wheelchair") return COLORS.wheelchair;
  if (hovered || rowHighlight) return COLORS.available.clone().lerp(COLORS.selected, 0.35);
  return COLORS.available;
}

export function InstancedSeats({
  seats,
  selectedIds,
  liveStates,
  hoveredId,
  highlightRow,
  onSeatClick,
  onSeatHover,
}: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    seats.forEach((seat, i) => {
      dummy.position.set(seat.x, seat.y + 0.12, seat.z);
      dummy.scale.set(0.32 * seat.scale, 0.22 * seat.scale, 0.3 * seat.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [seats, dummy]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    seats.forEach((seat, i) => {
      const selected = selectedIds.includes(seat.id);
      const live = liveStates[seat.id];
      const hovered = hoveredId === seat.id;
      const rowHi = highlightRow === seat.rowIndex;
      const pending = live === "pending";
      const s = seat.scale * (selected ? 1.08 : 1);
      dummy.position.set(seat.x, seat.y + 0.12, seat.z);
      dummy.scale.set(0.32 * s, 0.22 * s, 0.3 * s);
      if (pending) dummy.position.y += Math.sin(clock.elapsedTime * 8) * 0.02;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const c = seatColor(seat, selected, live, hovered, rowHi);
      mesh.setColorAt(i, c);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, seats.length]}
      onPointerMissed={() => onSeatHover(null)}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (e.instanceId != null) onSeatHover(seats[e.instanceId]?.id ?? null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.instanceId == null) return;
        const seat = seats[e.instanceId];
        if (seat) onSeatClick(seat.id);
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial vertexColors toneMapped={false} roughness={0.45} metalness={0.15} />
    </instancedMesh>
  );
}

export function CinemaScreen() {
  const screenZ = getScreenZ();
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const pulse = 0.85 + Math.sin(clock.elapsedTime * 1.2) * 0.15;
    matRef.current.emissiveIntensity = pulse;
  });

  return (
    <group position={[0, 1.8, screenZ]}>
      <mesh rotation={[-0.08, 0, 0]}>
        <planeGeometry args={[7.5, 2.2]} />
        <meshStandardMaterial
          ref={matRef}
          color="#f5c518"
          emissive="#f5c518"
          emissiveIntensity={0.9}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 0, 1.5]} intensity={2} color="#f5c518" distance={8} />
    </group>
  );
}

export function AuditoriumFloor({ width, depth }: { width: number; depth: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, depth / 2]} receiveShadow>
      <planeGeometry args={[width, depth + 6]} />
      <meshStandardMaterial color="#0a0a0f" roughness={0.9} metalness={0.05} />
    </mesh>
  );
}
