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
  available: new THREE.Color("#9a4d6a"),
  vip: new THREE.Color("#c9922a"),
  wheelchair: new THREE.Color("#5a7a9e"),
  selected: new THREE.Color("#f5c518"),
  occupied: new THREE.Color("#4a4458"),
  pending: new THREE.Color("#e8a830"),
  dim: new THREE.Color("#6a6278"),
};

function seatColor(
  seat: Seat3D,
  selected: boolean,
  live: LiveSeatState[string] | undefined,
  hovered: boolean,
  focusRow: number | null,
): THREE.Color {
  let c: THREE.Color;

  if (selected) c = COLORS.selected.clone();
  else if (seat.occupied || live === "occupied") c = COLORS.occupied.clone();
  else if (live === "pending") c = COLORS.pending.clone();
  else if (seat.tier === "vip") {
    c = COLORS.vip.clone();
    if (hovered) c.lerp(COLORS.selected, 0.45);
  } else if (seat.tier === "wheelchair") {
    c = COLORS.wheelchair.clone();
    if (hovered) c.lerp(COLORS.selected, 0.35);
  } else {
    c = COLORS.available.clone();
    if (hovered) c.lerp(COLORS.selected, 0.4);
  }

  if (focusRow !== null && seat.rowIndex !== focusRow) {
    c.lerp(COLORS.dim, 0.5);
  }

  return c;
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
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(seats.length * 3), 3);
    seats.forEach((seat, i) => {
      dummy.position.set(seat.x, seat.y + 0.14, seat.z);
      dummy.scale.set(0.34 * seat.scale, 0.28 * seat.scale, 0.32 * seat.scale);
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
      const pending = live === "pending";
      const s = seat.scale * (selected ? 1.1 : hovered ? 1.04 : 1);
      dummy.position.set(seat.x, seat.y + 0.14, seat.z);
      dummy.scale.set(0.34 * s, 0.28 * s, 0.32 * s);
      if (pending) dummy.position.y += Math.sin(clock.elapsedTime * 8) * 0.02;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, seatColor(seat, selected, live, hovered, highlightRow));
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
      <meshStandardMaterial
        vertexColors
        roughness={0.32}
        metalness={0.18}
        emissive="#2a1838"
        emissiveIntensity={0.35}
      />
    </instancedMesh>
  );
}

export function CinemaScreen() {
  const screenZ = getScreenZ();
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const boot = useRef(0);

  useFrame(({ clock }) => {
    boot.current = Math.min(1, boot.current + clock.getDelta() / 2.8);
    const eased = boot.current * boot.current * (3 - 2 * boot.current);
    const pulse = 0.92 + Math.sin(clock.elapsedTime * 0.9) * 0.08;
    if (matRef.current) {
      matRef.current.emissiveIntensity = (0.12 + eased * 0.48) * pulse;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.08 + eased * 0.42;
    }
  });

  return (
    <group position={[0, 1.85, screenZ]}>
      <mesh rotation={[-0.08, 0, 0]}>
        <planeGeometry args={[7.5, 2.2]} />
        <meshStandardMaterial
          ref={matRef}
          color="#fff9ef"
          emissive="#d4a012"
          emissiveIntensity={0.12}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[-0.08, 0, 0]} position={[0, 0, -0.02]}>
        <planeGeometry args={[7.8, 2.5]} />
        <meshStandardMaterial color="#0a0a12" roughness={1} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.5, 1.2]} intensity={0.08} color="#ffe8b0" distance={6} decay={2} />
    </group>
  );
}

export function AuditoriumFloor({ width, depth }: { width: number; depth: number }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, depth / 2]} receiveShadow>
        <planeGeometry args={[width, depth + 6]} />
        <meshStandardMaterial color="#16141f" roughness={0.75} metalness={0.12} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, depth / 2 - 0.5]}>
        <planeGeometry args={[width * 0.85, 0.08]} />
        <meshStandardMaterial color="#f5c518" emissive="#f5c518" emissiveIntensity={0.15} toneMapped={false} />
      </mesh>
    </>
  );
}

export function AuditoriumAmbience({ width, depth }: { width: number; depth: number }) {
  const screenZ = getScreenZ();
  return (
    <group>
      <mesh position={[-width / 2 - 0.3, 1.2, depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, 2.4]} />
        <meshStandardMaterial color="#0e0c16" roughness={0.95} />
      </mesh>
      <mesh position={[width / 2 + 0.3, 1.2, depth / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, 2.4]} />
        <meshStandardMaterial color="#0e0c16" roughness={0.95} />
      </mesh>
      <pointLight position={[0, 3.5, depth * 0.35]} intensity={0.55} color="#e8dff5" distance={14} decay={2} />
      <pointLight position={[-3, 2, screenZ + 3]} intensity={0.25} color="#6b21a8" distance={10} decay={2} />
      <pointLight position={[3, 2, screenZ + 3]} intensity={0.25} color="#6b21a8" distance={10} decay={2} />
    </group>
  );
}
