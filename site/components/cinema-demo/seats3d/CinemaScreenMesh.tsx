"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getScreenZ } from "@/lib/cinema-demo/seat-layout-3d";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaScreenMesh() {
  const screenZ = getScreenZ();
  const screenMode = useCinemaDemoStore((s) => s.screenMode);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const boot = useRef(0);

  const canvas = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    return c;
  }, []);

  useEffect(() => {
    if (!canvas) return;
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    textureRef.current = tex;
    if (matRef.current) matRef.current.map = tex;
    return () => tex.dispose();
  }, [canvas]);

  useFrame(({ clock }) => {
    boot.current = Math.min(1, boot.current + clock.getDelta() / 3);
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    if (screenMode === "preMovie") {
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
      g.addColorStop(0, "#1a2848");
      g.addColorStop(0.45, "#3d5a8a");
      g.addColorStop(1, "#c9922a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("سينما سلمية", canvas.width / 2, canvas.height / 2 - 8);
      ctx.font = "600 16px sans-serif";
      ctx.fillStyle = "rgba(255,248,220,0.85)";
      ctx.fillText("Salamiya Cinema", canvas.width / 2, canvas.height / 2 + 22);
    } else if (screenMode === "playing") {
      const hue = (clock.elapsedTime * 8) % 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 45%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#c9922a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("سينما سلمية", canvas.width / 2, canvas.height / 2);
    }
    if (textureRef.current) textureRef.current.needsUpdate = true;
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.45 + boot.current * 1.1;
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
          emissive="#d4e8ff"
          emissiveIntensity={0.35}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
