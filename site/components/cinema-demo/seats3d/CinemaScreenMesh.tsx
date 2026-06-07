"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { getMovie } from "@/lib/cinema-demo/data";
import { drawCinemaScreenCanvas } from "@/lib/cinema-demo/screen-canvas";
import { getScreenZ } from "@/lib/cinema-demo/seat-layout-3d";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

type Props = { reducedMotion?: boolean };

export function CinemaScreenMesh({ reducedMotion = false }: Props) {
  const screenZ = getScreenZ();
  const locale = useLocale();
  const screenMode = useCinemaDemoStore((s) => s.screenMode);
  const movieId = useCinemaDemoStore((s) => s.movieId);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const boot = useRef(0);
  const frameRef = useRef(0);
  const movie = useMemo(() => (movieId ? getMovie(movieId) ?? null : null), [movieId]);

  const canvas = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 768;
    c.height = 384;
    return c;
  }, []);

  useEffect(() => {
    if (!canvas) return;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    textureRef.current = tex;
    if (matRef.current) {
      matRef.current.map = tex;
      matRef.current.emissiveMap = tex;
    }
    return () => tex.dispose();
  }, [canvas]);

  useFrame(({ clock }) => {
    boot.current = Math.min(1, boot.current + clock.getDelta() / 3);
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const throttlePlaying = screenMode === "playing" && !reducedMotion;
    if (throttlePlaying) {
      frameRef.current += 1;
      if (frameRef.current % 3 !== 0) return;
    }

    drawCinemaScreenCanvas(ctx, canvas, {
      mode: screenMode,
      movie,
      locale,
      time: clock.elapsedTime,
      reducedMotion,
    });

    if (textureRef.current) textureRef.current.needsUpdate = true;
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.55 + boot.current * 0.95;
    }
  });

  const curve = useMemo(() => {
    const geo = new THREE.PlaneGeometry(7.5, 2.2, 32, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, -Math.abs(x) * 0.015);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group position={[0, 1.85, screenZ]}>
      <mesh rotation={[-0.08, 0, 0]} geometry={curve}>
        <meshStandardMaterial
          ref={matRef}
          color="#fff9ef"
          emissive="#ffffff"
          emissiveIntensity={0.55}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
