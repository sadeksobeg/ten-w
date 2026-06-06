"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  getCameraPreset,
  type CameraPreset,
} from "@/lib/cinema-demo/camera-presets";
import type { AuditoriumBounds, Seat3D } from "@/lib/cinema-demo/seat-layout-3d";
import { getScreenZ } from "@/lib/cinema-demo/seat-layout-3d";
import * as THREE from "three";

type Props = {
  preset: CameraPreset;
  bounds: AuditoriumBounds;
  focusSeat: Seat3D | null;
};

export function CameraRig({ preset, bounds, focusSeat }: Props) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);
  const animating = useRef(false);
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2;
    controls.maxDistance = 14;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minPolarAngle = 0.15;
    controlsRef.current = controls;

    const { position, target } = getCameraPreset("overview", bounds, null);
    camera.position.set(...position);
    controls.target.set(...target);

    return () => controls.dispose();
  }, [camera, gl, bounds.centerX, bounds.centerZ, bounds.maxZ]);

  useEffect(() => {
    const { position, target } = getCameraPreset(preset, bounds, focusSeat);
    targetPos.current.set(...position);
    targetLook.current.set(...target);
    animating.current = preset !== "immersive";
  }, [preset, bounds, focusSeat]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (animating.current) {
      camera.position.lerp(targetPos.current, 0.06);
      controls.target.lerp(targetLook.current, 0.06);
      if (camera.position.distanceTo(targetPos.current) < 0.05) {
        animating.current = false;
      }
    }
    controls.update();
  });

  return null;
}
