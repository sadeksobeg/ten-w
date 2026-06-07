"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useHallQuality } from "@/components/cinema-demo/hooks/useHallQuality";
import { useLiveSeatSimulation } from "@/components/cinema-demo/hooks/useLiveSeatSimulation";
import { CinemaScreenMesh } from "@/components/cinema-demo/seats3d/CinemaScreenMesh";
import { DustParticles } from "@/components/cinema-demo/seats3d/DustParticles";
import { HallGeometry } from "@/components/cinema-demo/seats3d/HallGeometry";
import { HallLighting } from "@/components/cinema-demo/seats3d/HallLighting";
import { useHallEvents } from "@/components/cinema-demo/seats3d/HallEvents";
import { InstancedSeats } from "@/components/cinema-demo/seats3d/InstancedSeats";
import { ProjectorBeam } from "@/components/cinema-demo/seats3d/ProjectorBeam";
import { CameraRig } from "@/components/cinema-demo/seats3d/CameraRig";
import { RowLabels } from "@/components/cinema-demo/seats3d/RowLabels";
import { SeatHud } from "@/components/cinema-demo/seats3d/SeatHud";
import { seatById, type AuditoriumBounds, type Seat3D } from "@/lib/cinema-demo/seat-layout-3d";
import { isSeatSelectable } from "@/lib/cinema-demo/seat-select";
import { playSeatDeselectSound, playSeatSelectChime, playSeatSelectSound } from "@/lib/cinema-demo/sounds";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

type SceneProps = {
  showtimeId: string;
  seats: Seat3D[];
  bounds: AuditoriumBounds;
  reducedMotion3D: boolean;
  highlightRow: number | null;
};

function HallScene({ showtimeId, seats, bounds, reducedMotion3D, highlightRow }: SceneProps) {
  const selectedIds = useCinemaDemoStore((s) => s.selectedSeatIds);
  const toggleSeat = useCinemaDemoStore((s) => s.toggleSeat);
  const soundEnabled = useCinemaDemoStore((s) => s.soundEnabled);
  const cameraPreset = useCinemaDemoStore((s) => s.cameraPreset);
  const focusedSeatId = useCinemaDemoStore((s) => s.focusedSeatId);
  const setFocusedSeatId = useCinemaDemoStore((s) => s.setFocusedSeatId);
  const setHudHoverSeatId = useCinemaDemoStore((s) => s.setHudHoverSeatId);
  const setCameraPreset = useCinemaDemoStore((s) => s.setCameraPreset);
  const setLiveSeatStates = useCinemaDemoStore((s) => s.setLiveSeatStates);
  const smartPickAnimating = useCinemaDemoStore((s) => s.smartPickAnimating);
  const liveStates = useLiveSeatSimulation(showtimeId, true);
  const quality = useHallQuality(reducedMotion3D);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  useHallEvents(true);

  useEffect(() => {
    setLiveSeatStates(liveStates);
  }, [liveStates, setLiveSeatStates]);

  const focusSeat = focusedSeatId ? (seatById(showtimeId, focusedSeatId) ?? null) : null;
  const floorW = bounds.maxX - bounds.minX + 2;
  const floorD = bounds.maxZ + 2;

  const handleHover = (id: string | null) => {
    setHoveredId(id);
    setHudHoverSeatId(id);
  };

  const handleClick = (id: string) => {
    const seat = seats.find((s) => s.id === id);
    if (!seat || !isSeatSelectable(seat, liveStates, selectedIds)) return;
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

  return (
    <>
      <color attach="background" args={["#0c0a14"]} />
      <fog attach="fog" args={["#14101f", 28, 75]} />
      <hemisphereLight args={["#4a4568", "#120f1a", 0.72]} />
      <ambientLight intensity={0.22} color="#ffe8c8" />
      <HallGeometry width={floorW} depth={floorD} />
      <HallLighting width={floorW} depth={floorD} />
      <CinemaScreenMesh reducedMotion={reducedMotion3D} />
      <ProjectorBeam depth={floorD} />
      <DustParticles depth={floorD} count={quality.particleCount} enabled={quality.particleCount > 0} />
      <RowLabels seats={seats} />
      <InstancedSeats
        seats={seats}
        selectedIds={selectedIds}
        liveStates={liveStates}
        hoveredId={hoveredId}
        highlightRow={highlightRow}
        reducedMotion={reducedMotion3D}
        smartPickAnimating={smartPickAnimating}
        onSeatClick={handleClick}
        onSeatHover={handleHover}
      />
      <CameraRig
        preset={cameraPreset}
        bounds={bounds}
        focusSeat={focusSeat}
        smartPickAnimating={smartPickAnimating}
        reducedMotion={reducedMotion3D}
      />
    </>
  );
}

type HallProps = {
  showtimeId: string;
  seats: Seat3D[];
  bounds: AuditoriumBounds;
  tooltipSeatId: string | null;
  reducedMotion3D: boolean;
  highlightRow: number | null;
  onHighlightRow: (row: number | null) => void;
  liveAnnouncement: string;
};

export function CinemaSeatHall3D({
  showtimeId,
  seats,
  bounds,
  tooltipSeatId,
  reducedMotion3D,
  highlightRow,
  onHighlightRow,
  liveAnnouncement,
}: HallProps) {
  const quality = useHallQuality(reducedMotion3D);

  return (
    <div className="cinema-hall-3d">
      <div className="cinema-hall-3d-glow" aria-hidden />
      <Canvas
        dpr={quality.dpr}
        camera={{ fov: 54, near: 0.1, far: 80, position: [0, 5, 8] }}
        gl={{
          antialias: quality.antialias,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.55,
        }}
        shadows={quality.shadows}
      >
        <Suspense fallback={null}>
          <HallScene
            showtimeId={showtimeId}
            seats={seats}
            bounds={bounds}
            reducedMotion3D={reducedMotion3D}
            highlightRow={highlightRow}
          />
        </Suspense>
      </Canvas>
      <SeatHud
        seats={seats}
        tooltipSeatId={tooltipSeatId}
        variant="overlay"
        highlightRow={highlightRow}
        onHighlightRow={onHighlightRow}
        liveAnnouncement={liveAnnouncement}
      />
    </div>
  );
}
