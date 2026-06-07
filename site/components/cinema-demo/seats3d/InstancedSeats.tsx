"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { LiveSeatState } from "@/components/cinema-demo/hooks/useLiveSeatSimulation";
import { createSeatGeometry } from "@/lib/cinema-demo/seat-geometry";
import type { Seat3D } from "@/lib/cinema-demo/seat-layout-3d";
import type { SeatTier } from "@/lib/cinema-demo/seat-map";
import { isSeatSelectable } from "@/lib/cinema-demo/seat-select";

type Props = {
  seats: Seat3D[];
  selectedIds: string[];
  liveStates: LiveSeatState;
  hoveredId: string | null;
  highlightRow: number | null;
  reducedMotion?: boolean;
  smartPickAnimating?: boolean;
  onSeatClick: (id: string) => void;
  onSeatHover: (id: string | null) => void;
};

const COLORS = {
  available: new THREE.Color("#5A2040"),
  vip: new THREE.Color("#1A1020"),
  wheelchair: new THREE.Color("#1A2A4A"),
  selected: new THREE.Color("#C9922A"),
  hover: new THREE.Color("#F5E6C3"),
  occupied: new THREE.Color("#2A1520"),
  pending: new THREE.Color("#e8a830"),
  dim: new THREE.Color("#3a2535"),
  emissiveGold: new THREE.Color("#f5c518"),
  emissiveDim: new THREE.Color("#2a1520"),
};

const TIERS: SeatTier[] = ["standard", "vip", "wheelchair"];

function applySeatColor(
  out: THREE.Color,
  seat: Seat3D,
  selected: boolean,
  live: LiveSeatState[string] | undefined,
  hovered: boolean,
  focusRow: number | null,
): void {
  if (selected) out.copy(COLORS.selected);
  else if (seat.occupied || live === "occupied") out.copy(COLORS.occupied);
  else if (live === "pending") out.copy(COLORS.pending);
  else if (seat.tier === "vip") {
    out.copy(COLORS.vip);
    if (hovered) out.lerp(COLORS.hover, 0.55);
  } else if (seat.tier === "wheelchair") {
    out.copy(COLORS.wheelchair);
    if (hovered) out.lerp(COLORS.selected, 0.35);
  } else {
    out.copy(COLORS.available);
    if (hovered) out.lerp(COLORS.hover, 0.5);
  }

  if (focusRow !== null && seat.rowIndex !== focusRow) {
    out.lerp(COLORS.dim, 0.5);
  }
}

type TierMeshProps = {
  tier: SeatTier;
  tierSeats: Seat3D[];
  selectedIds: string[];
  liveStates: LiveSeatState;
  hoveredId: string | null;
  highlightRow: number | null;
  reducedMotion: boolean;
  smartPickAnimating: boolean;
  onSeatClick: (id: string) => void;
  onSeatHover: (id: string | null) => void;
};

function TierInstancedMesh({
  tier,
  tierSeats,
  selectedIds,
  liveStates,
  hoveredId,
  highlightRow,
  reducedMotion,
  smartPickAnimating,
  onSeatClick,
  onSeatHover,
}: TierMeshProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geometry = useMemo(() => createSeatGeometry(tier), [tier]);
  const colorScratch = useMemo(() => new THREE.Color(), []);
  const dirtyRef = useRef(true);
  const prevRef = useRef("");
  const { gl } = useThree();

  const signature = useMemo(
    () => JSON.stringify({ selectedIds, hoveredId, highlightRow, liveStates, tierCount: tierSeats.length }),
    [selectedIds, hoveredId, highlightRow, liveStates, tierSeats.length],
  );

  useEffect(() => {
    dirtyRef.current = true;
  }, [signature]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || tierSeats.length === 0) return;
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(tierSeats.length * 3), 3);
    tierSeats.forEach((seat, i) => {
      dummy.position.set(seat.x, seat.y + 0.14, seat.z);
      dummy.scale.setScalar(seat.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    dirtyRef.current = true;
  }, [tierSeats, dummy]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh || tierSeats.length === 0) return;

    if (prevRef.current !== signature) {
      prevRef.current = signature;
      dirtyRef.current = true;
    }

    const animateBob = !reducedMotion && !smartPickAnimating;
    let matrixDirty = false;

    tierSeats.forEach((seat, i) => {
      const selected = selectedIds.includes(seat.id);
      const live = liveStates[seat.id];
      const hovered = hoveredId === seat.id;
      const pending = live === "pending";
      const selectable = isSeatSelectable(seat, liveStates, selectedIds);
      const bounce = animateBob && pending ? Math.sin(clock.elapsedTime * 8) * 0.02 : 0;
      const scaleMul =
        selectable && !seat.occupied && live !== "occupied" ? (selected ? 1.08 : hovered ? 1.04 : 1) : 1;

      dummy.position.set(seat.x, seat.y + 0.14 + bounce, seat.z);
      dummy.scale.setScalar(seat.scale * scaleMul);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      matrixDirty = matrixDirty || animateBob;

      if (dirtyRef.current) {
        applySeatColor(colorScratch, seat, selected, live, hovered, highlightRow);
        mesh.setColorAt(i, colorScratch);
      }
    });

    if (matrixDirty || dirtyRef.current) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    dirtyRef.current = false;
  });

  const resolveSeat = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId == null) return null;
    return tierSeats[e.instanceId] ?? null;
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, tierSeats.length]}
      onPointerMissed={() => {
        onSeatHover(null);
        gl.domElement.style.cursor = "default";
      }}
      onPointerMove={(e) => {
        const seat = resolveSeat(e);
        if (!seat) return;
        onSeatHover(seat.id);
        gl.domElement.style.cursor = isSeatSelectable(seat, liveStates, selectedIds) ? "pointer" : "not-allowed";
      }}
      onClick={(e) => {
        const seat = resolveSeat(e);
        if (!seat || !isSeatSelectable(seat, liveStates, selectedIds)) return;
        onSeatClick(seat.id);
      }}
    >
      <meshStandardMaterial
        vertexColors
        roughness={0.62}
        metalness={0.14}
        emissive="#2a1520"
        emissiveIntensity={0.18}
      />
    </instancedMesh>
  );
}

export function InstancedSeats({
  seats,
  selectedIds,
  liveStates,
  hoveredId,
  highlightRow,
  reducedMotion = false,
  smartPickAnimating = false,
  onSeatClick,
  onSeatHover,
}: Props) {
  const byTier = useMemo(
    () => TIERS.map((tier) => ({ tier, tierSeats: seats.filter((s) => s.tier === tier) })),
    [seats],
  );

  return (
    <group>
      {byTier.map(({ tier, tierSeats }) =>
        tierSeats.length > 0 ? (
          <TierInstancedMesh
            key={tier}
            tier={tier}
            tierSeats={tierSeats}
            selectedIds={selectedIds}
            liveStates={liveStates}
            hoveredId={hoveredId}
            highlightRow={highlightRow}
            reducedMotion={reducedMotion}
            smartPickAnimating={smartPickAnimating}
            onSeatClick={onSeatClick}
            onSeatHover={onSeatHover}
          />
        ) : null,
      )}
    </group>
  );
}
