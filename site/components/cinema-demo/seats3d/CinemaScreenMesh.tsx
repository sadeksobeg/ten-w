"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const boot = useRef(0);
  const frameRef = useRef(0);
  const posterRef = useRef<HTMLImageElement | null>(null);
  const [screenTexture, setScreenTexture] = useState<THREE.CanvasTexture | null>(null);
  const movie = useMemo(() => (movieId ? getMovie(movieId) ?? null : null), [movieId]);

  const canvas = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    return c;
  }, []);

  useEffect(() => {
    if (!canvas) return;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    setScreenTexture(tex);
    return () => {
      tex.dispose();
      setScreenTexture(null);
    };
  }, [canvas]);

  useEffect(() => {
    posterRef.current = null;
    if (!movie?.posterSrc) return;
    const img = new Image();
    img.onload = () => {
      posterRef.current = img;
    };
    img.onerror = () => {
      posterRef.current = null;
    };
    img.src = movie.posterSrc;
  }, [movie?.posterSrc]);

  useFrame(({ clock }) => {
    boot.current = Math.min(1, boot.current + clock.getDelta() / 2.5);
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const throttlePlaying = screenMode === "playing" && !reducedMotion;
    if (throttlePlaying) {
      frameRef.current += 1;
      if (frameRef.current % 2 !== 0) return;
    }

    drawCinemaScreenCanvas(ctx, canvas, {
      mode: screenMode,
      movie,
      locale,
      time: clock.elapsedTime,
      reducedMotion,
      poster: posterRef.current,
    });

    if (screenTexture) screenTexture.needsUpdate = true;
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
    <group position={[0, 1.85, screenZ + 0.08]}>
      <mesh rotation={[-0.08, 0, 0]} geometry={curve} renderOrder={3}>
        <meshStandardMaterial
          map={screenTexture ?? undefined}
          emissiveMap={screenTexture ?? undefined}
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.85 + boot.current * 0.65}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 0, 1.8]} intensity={2.2} color="#eef6ff" distance={14} decay={1.4} />
      <pointLight position={[0, -0.8, 2.5]} intensity={0.45} color="#fff4dc" distance={10} decay={2} />
    </group>
  );
}
