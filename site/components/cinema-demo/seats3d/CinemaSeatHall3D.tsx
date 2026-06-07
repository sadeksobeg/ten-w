"use client";

import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useLiveSeatSimulation } from "@/components/cinema-demo/hooks/useLiveSeatSimulation";
import { CinemaScreenMesh } from "@/components/cinema-demo/seats3d/CinemaScreenMesh";
import { DustParticles } from "@/components/cinema-demo/seats3d/DustParticles";
import { HallGeometry } from "@/components/cinema-demo/seats3d/HallGeometry";
import { HallLighting } from "@/components/cinema-demo/seats3d/HallLighting";
import { useHallEvents } from "@/components/cinema-demo/seats3d/HallEvents";
import { InstancedSeats } from "@/components/cinema-demo/seats3d/InstancedSeats";
import { ProjectorBeam } from "@/components/cinema-demo/seats3d/ProjectorBeam";
import { CameraRig } from "@/components/cinema-demo/seats3d/CameraRig";
import { SeatHud } from "@/components/cinema-demo/seats3d/SeatHud";
import { buildSeatLayout3D, seatById, type Seat3D } from "@/lib/cinema-demo/seat-layout-3d";
import { playSeatDeselectSound, playSeatSelectChime, playSeatSelectSound } from "@/lib/cinema-demo/sounds";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

type Props = {
  showtimeId: string;
};

function HallScene({ showtimeId }: Props) {
  const { seats, bounds } = useMemo(() => buildSeatLayout3D(showtimeId), [showtimeId]);
  const selectedIds = useCinemaDemoStore((s) => s.selectedSeatIds);
  const toggleSeat = useCinemaDemoStore((s) => s.toggleSeat);
  const soundEnabled = useCinemaDemoStore((s) => s.soundEnabled);
  const cameraPreset = useCinemaDemoStore((s) => s.cameraPreset);
  const focusedSeatId = useCinemaDemoStore((s) => s.focusedSeatId);
  const setFocusedSeatId = useCinemaDemoStore((s) => s.setFocusedSeatId);
  const setHudHoverSeatId = useCinemaDemoStore((s) => s.setHudHoverSeatId);
  const setCameraPreset = useCinemaDemoStore((s) => s.setCameraPreset);
  const liveStates = useLiveSeatSimulation(showtimeId, true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  useHallEvents(true);

  const focusSeat = focusedSeatId ? seatById(showtimeId, focusedSeatId) ?? null : null;

  const handleHover = (id: string | null) => {
    setHoveredId(id);
    setHudHoverSeatId(id);
  };

  const handleClick = (id: string) => {
    const wasSelected = selectedIds.includes(id);
    toggleSeat(id);
    if (wasSelected) playSeatDeselectSound(soundEnabled);
    else {
      playSeatSelectSound(soundEnabled);
      playSeatSelectChime(soundEnabled);
      if (navigator.vibrate) navigator.vibrate(10);
    }
    setFocusedSeatId(id);
    setCameraPreset("focus");
  };

  const floorW = bounds.maxX - bounds.minX + 2;
  const floorD = bounds.maxZ + 2;

  return (
    <>
      <color attach="background" args={["#0c0a14"]} />
      <fog attach="fog" args={["#14101f", 28, 75]} />
      <hemisphereLight args={["#4a4568", "#120f1a", 0.72]} />
      <ambientLight intensity={0.22} color="#ffe8c8" />
      <HallGeometry width={floorW} depth={floorD} />
      <HallLighting width={floorW} depth={floorD} seats={seats} />
      <CinemaScreenMesh />
      <ProjectorBeam depth={floorD} />
      <DustParticles depth={floorD} />
      <InstancedSeats
        seats={seats}
        selectedIds={selectedIds}
        liveStates={liveStates}
        hoveredId={hoveredId}
        highlightRow={null}
        onSeatClick={handleClick}
        onSeatHover={handleHover}
      />
      <CameraRig preset={cameraPreset} bounds={bounds} focusSeat={focusSeat} />
    </>
  );
}

type HallProps = {
  showtimeId: string;
  seats: Seat3D[];
  tooltipSeatId: string | null;
};

export function CinemaSeatHall3D({ showtimeId, seats, tooltipSeatId }: HallProps) {
  return (
    <div className="cinema-hall-3d">
      <div className="cinema-hall-3d-glow" aria-hidden />
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 54, near: 0.1, far: 80, position: [0, 5, 8] }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.55,
        }}
        shadows
      >
        <Suspense fallback={null}>
          <HallScene showtimeId={showtimeId} />
        </Suspense>
      </Canvas>
      <SeatHud seats={seats} tooltipSeatId={tooltipSeatId} variant="overlay" />
    </div>
  );
}
