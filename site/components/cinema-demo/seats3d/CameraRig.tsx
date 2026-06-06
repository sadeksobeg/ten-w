"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import {
  getCameraPreset,
  type CameraPreset,
} from "@/lib/cinema-demo/camera-presets";
import type { AuditoriumBounds, Seat3D } from "@/lib/cinema-demo/seat-layout-3d";

type Props = {
  preset: CameraPreset;
  bounds: AuditoriumBounds;
  focusSeat: Seat3D | null;
};

export function CameraRig({ preset, bounds, focusSeat }: Props) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);
  const animating = useRef(false);
  const progress = useRef(1);
  const startPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const endPos = useRef(new THREE.Vector3());
  const endTarget = useRef(new THREE.Vector3());
  const curvePos = useRef<THREE.CatmullRomCurve3 | null>(null);
  const birdsEyeAngle = useRef(0);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2;
    controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minPolarAngle = 0.15;
    controlsRef.current = controls;

    const { position, target } = getCameraPreset("dramaticEntry", bounds, null);
    camera.position.set(...position);
    if (target) controls.target.set(...target);
    const fov = getCameraPreset("dramaticEntry", bounds, null).fov;
    if (fov && "fov" in camera) (camera as THREE.PerspectiveCamera).fov = fov;

    return () => controls.dispose();
  }, [camera, gl, bounds.centerX, bounds.centerZ, bounds.maxZ]);

  useEffect(() => {
    const from = getCameraPreset(preset, bounds, focusSeat);
    startPos.current.copy(camera.position);
    startTarget.current.copy(controlsRef.current?.target ?? new THREE.Vector3());
    endPos.current.set(...from.position);
    endTarget.current.set(...from.target);
    const mid: [number, number, number] = [
      (startPos.current.x + endPos.current.x) / 2,
      Math.max(startPos.current.y, endPos.current.y) + 1.5,
      (startPos.current.z + endPos.current.z) / 2,
    ];
    curvePos.current = new THREE.CatmullRomCurve3([
      startPos.current.clone(),
      new THREE.Vector3(...mid),
      endPos.current.clone(),
    ]);
    progress.current = 0;
    animating.current = true;
    if (from.fov && "fov" in camera) (camera as THREE.PerspectiveCamera).fov = from.fov;
  }, [preset, bounds, focusSeat, camera]);

  useFrame(({ clock }) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (animating.current && curvePos.current) {
      progress.current = Math.min(1, progress.current + 0.018);
      const t = progress.current;
      const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      const p = curvePos.current.getPoint(eased);
      camera.position.copy(p);
      controls.target.lerpVectors(startTarget.current, endTarget.current, eased);
      if (progress.current >= 1) animating.current = false;
    }

    if (preset === "immersive") {
      camera.position.y += Math.sin(clock.elapsedTime * 0.8) * 0.002;
    }

    if (preset === "birdsEye") {
      birdsEyeAngle.current += 0.0009;
      const r = bounds.maxZ + 8;
      camera.position.x = bounds.centerX + Math.sin(birdsEyeAngle.current) * 0.8;
      camera.position.z = bounds.centerZ + 2 + Math.cos(birdsEyeAngle.current) * 0.5;
    }

    if ("fov" in camera) (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    controls.update();
  });

  return null;
}
