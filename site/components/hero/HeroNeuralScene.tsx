"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Pointer = { x: number; y: number };

function hash01(i: number, salt: number) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 0.001) * 43758.5453;
  return x - Math.floor(x);
}

function buildSpherePositions(count: number) {
  const arr = new Float32Array(count * 3);
  const salt = count;
  for (let i = 0; i < count; i++) {
    const u = hash01(i, salt);
    const v = hash01(i + count, salt);
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const r = 1.15 + hash01(i + count * 2, salt) * 2.25;
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi) * 0.52;
  }
  return arr;
}

function buildVertexColors(count: number) {
  const arr = new Float32Array(count * 3);
  const gold = new THREE.Color("#c9a061");
  const cyan = new THREE.Color("#5eb0e8");
  for (let i = 0; i < count; i++) {
    const t = hash01(i, 99);
    const c = t > 0.42 ? cyan : gold;
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  return arr;
}

function buildLineSegments(
  positions: Float32Array,
  count: number,
  maxPairs: number,
) {
  const pairs = Math.min(maxPairs, Math.max(8, Math.floor(count * 0.35)));
  const arr = new Float32Array(pairs * 2 * 3);
  let o = 0;
  for (let i = 0; i < pairs; i++) {
    const a = (i * 19) % count;
    const b = (i * 19 + 7 + (i % 17) * 3) % count;
    arr[o++] = positions[a * 3];
    arr[o++] = positions[a * 3 + 1];
    arr[o++] = positions[a * 3 + 2];
    arr[o++] = positions[b * 3];
    arr[o++] = positions[b * 3 + 1];
    arr[o++] = positions[b * 3 + 2];
  }
  return arr;
}

function NeuralCluster({
  count,
  pointer,
  coarse,
}: {
  count: number;
  pointer: Pointer;
  coarse: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  const positions = useMemo(() => buildSpherePositions(count), [count]);
  const colors = useMemo(() => buildVertexColors(count), [count]);
  const maxSeg = coarse ? 160 : 420;
  const linePositions = useMemo(
    () => buildLineSegments(positions, count, maxSeg),
    [positions, count, maxSeg],
  );

  const px = coarse ? 0 : pointer.x;
  const py = coarse ? 0 : pointer.y;

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const rotY = t * 0.14 + px * 0.52;
    const rotX = py * 0.34;
    group.current.rotation.y = rotY;
    group.current.rotation.x = rotX;
    group.current.position.x = px * 0.28;
    group.current.position.y = py * 0.18;
    group.current.position.z = Math.sin(t * 0.22) * 0.12 + py * -0.06;
  });

  return (
    <group ref={group}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={coarse ? 0.044 : 0.036}
          transparent
          opacity={0.9}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#c9a061"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

function Scene({
  count,
  pointer,
  coarse,
}: {
  count: number;
  pointer: Pointer;
  coarse: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <NeuralCluster count={count} pointer={pointer} coarse={coarse} />
    </>
  );
}

export type HeroNeuralCanvasProps = {
  className?: string;
  pointer: Pointer;
  coarse: boolean;
  count: number;
};

export function HeroNeuralCanvas({
  className = "",
  pointer,
  coarse,
  count,
}: HeroNeuralCanvasProps) {
  return (
    <div className={`absolute inset-0 z-0 ${className}`} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        className="h-full w-full"
      >
        <Scene count={count} pointer={pointer} coarse={coarse} />
      </Canvas>
    </div>
  );
}

export default HeroNeuralCanvas;
