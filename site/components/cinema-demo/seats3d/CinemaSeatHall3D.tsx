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
import { buildSeatLayout3D, seatById } from "@/lib/cinema-demo/seat-layout-3d";
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
      <color attach="background" args={["#050508"]} />
      <fog attach="fog" args={["#050508", 20, 60]} />
      <hemisphereLight args={["#2a2540", "#0a0812", 0.4]} />
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

export function CinemaSeatHall3D({ showtimeId }: Props) {
  const seats = useMemo(() => buildSeatLayout3D(showtimeId).seats, [showtimeId]);
  const hudHoverSeatId = useCinemaDemoStore((s) => s.hudHoverSeatId);

  return (
    <div className="cinema-hall-3d">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 58, near: 0.1, far: 80, position: [0, 5, 8] }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
        shadows
      >
        <Suspense fallback={null}>
          <HallScene showtimeId={showtimeId} />
        </Suspense>
      </Canvas>
      <SeatHud showtimeId={showtimeId} seats={seats} tooltipSeatId={hudHoverSeatId} />
    </div>
  );
}
