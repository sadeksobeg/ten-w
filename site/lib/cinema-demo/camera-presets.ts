import type { AuditoriumBounds, Seat3D } from "@/lib/cinema-demo/seat-layout-3d";
import { getScreenZ } from "@/lib/cinema-demo/seat-layout-3d";

export type CameraPreset =
  | "overview"
  | "immersive"
  | "vip"
  | "birdsEye"
  | "dramaticEntry"
  | "focus"
  | "viewFromSeat";

export type CameraTarget = {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
};

export function getCameraPreset(
  preset: CameraPreset,
  bounds: AuditoriumBounds,
  focusSeat?: Seat3D | null,
): CameraTarget {
  const screenZ = getScreenZ();
  const cx = bounds.centerX;
  const cz = bounds.centerZ;

  if (preset === "viewFromSeat" && focusSeat) {
    return {
      position: [focusSeat.x, focusSeat.y + 0.48, focusSeat.z + 0.08],
      target: [cx, 1.45, screenZ + 0.2],
      fov: 68,
    };
  }

  if (preset === "focus" && focusSeat) {
    return {
      position: [focusSeat.x, focusSeat.y + 2.8, focusSeat.z + 2.2],
      target: [cx, 1.25, screenZ + 0.35],
      fov: 48,
    };
  }

  if (preset === "immersive") {
    return {
      position: [cx, 1.6, cz + 3.5],
      target: [cx, 0.4, screenZ + 1],
      fov: 60,
    };
  }

  if (preset === "vip") {
    return {
      position: [cx - 0.3, 1.2, cz + 1.8],
      target: [cx, 0.8, screenZ + 0.5],
      fov: 55,
    };
  }

  if (preset === "birdsEye") {
    return {
      position: [cx, bounds.maxZ + 8, cz + 2],
      target: [cx, 0, cz],
      fov: 50,
    };
  }

  if (preset === "dramaticEntry") {
    return {
      position: [cx, 0.8, bounds.maxZ + 6],
      target: [cx, 1.2, screenZ],
      fov: 58,
    };
  }

  return {
    position: [cx, bounds.maxZ + 4.5, cz + 5],
    target: [cx, 0, screenZ + 0.5],
    fov: 60,
  };
}
