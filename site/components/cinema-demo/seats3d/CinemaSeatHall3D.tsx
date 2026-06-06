"use client";

import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useLiveSeatSimulation } from "@/components/cinema-demo/hooks/useLiveSeatSimulation";
import { AuditoriumFloor, CinemaScreen, InstancedSeats } from "@/components/cinema-demo/seats3d/InstancedSeats";
import { CameraRig } from "@/components/cinema-demo/seats3d/CameraRig";
import { SeatHud } from "@/components/cinema-demo/seats3d/SeatHud";
import { buildSeatLayout3D, seatById } from "@/lib/cinema-demo/seat-layout-3d";
import { playSeatDeselectSound, playSeatSelectSound } from "@/lib/cinema-demo/sounds";
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
  const liveStates = useLiveSeatSimulation(showtimeId, true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const focusSeat = focusedSeatId ? seatById(showtimeId, focusedSeatId) ?? null : null;
  const hoverSeat = hoveredId ? seatById(showtimeId, hoveredId) ?? null : null;
  const highlightRow = hoverSeat?.rowIndex ?? focusSeat?.rowIndex ?? null;

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
      if (navigator.vibrate) navigator.vibrate(10);
    }
    setFocusedSeatId(id);
  };

  return (
    <>
      <color attach="background" args={["#03010a"]} />
      <fog attach="fog" args={["#03010a", 8, 18]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 8, 2]} intensity={0.5} color="#fff8e7" />
      <CinemaScreen />
      <AuditoriumFloor width={bounds.maxX - bounds.minX + 2} depth={bounds.maxZ + 2} />
      <InstancedSeats
        seats={seats}
        selectedIds={selectedIds}
        liveStates={liveStates}
        hoveredId={hoveredId}
        highlightRow={highlightRow}
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
        camera={{ fov: 48, near: 0.1, far: 50, position: [0, 5, 8] }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <HallScene showtimeId={showtimeId} />
        </Suspense>
      </Canvas>
      <SeatHud showtimeId={showtimeId} seats={seats} tooltipSeatId={hudHoverSeatId} />
    </div>
  );
}
