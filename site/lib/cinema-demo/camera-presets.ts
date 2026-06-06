import type { AuditoriumBounds, Seat3D } from "@/lib/cinema-demo/seat-layout-3d";
import { getScreenZ } from "@/lib/cinema-demo/seat-layout-3d";

export type CameraPreset = "overview" | "immersive" | "focus";

export type CameraTarget = {
  position: [number, number, number];
  target: [number, number, number];
};

export function getCameraPreset(
  preset: CameraPreset,
  bounds: AuditoriumBounds,
  focusSeat?: Seat3D | null,
): CameraTarget {
  const screenZ = getScreenZ();
  const cx = bounds.centerX;
  const cz = bounds.centerZ;

  if (preset === "focus" && focusSeat) {
    return {
      position: [focusSeat.x, focusSeat.y + 2.8, focusSeat.z + 2.2],
      target: [focusSeat.x, focusSeat.y + 0.2, focusSeat.z - 0.3],
    };
  }

  if (preset === "immersive") {
    return {
      position: [cx, 1.6, cz + 3.5],
      target: [cx, 0.4, screenZ + 1],
    };
  }

  return {
    position: [cx, bounds.maxZ + 4.5, cz + 5],
    target: [cx, 0, screenZ + 0.5],
  };
}
