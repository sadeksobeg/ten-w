"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const HeroNeuralCanvas = dynamic(
  () => import("@/components/hero/HeroNeuralScene"),
  { ssr: false, loading: () => null },
);

type Props = { children: ReactNode };

/** Client shell: WebGL backdrop only. Hero copy is a Server Component child for faster LCP. */
export function CinematicHeroShell({ children }: Props) {
  const reduced = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [count, setCount] = useState(900);
  const [coarse, setCoarse] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setCoarse(mq.matches);
        const w = window.innerWidth;
        setCount(w < 640 ? 300 : w < 1024 ? 620 : 1280);
      });
    };
    sync();
    mq.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (coarse) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setPointer({ x, y });
  };

  const showCanvas = !reduced && !coarse;

  return (
    <section
      className="relative flex min-h-[min(92vh,940px)] items-center overflow-hidden border-b border-white/10"
      onPointerMove={onPointerMove}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg via-[#14100a] to-bg"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55] [background-image:linear-gradient(to_right,rgba(201,160,97,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(201,160,97,0.05)_1px,transparent_1px)] [background-size:52px_52px]"
        aria-hidden
      />
      {showCanvas ? (
        <>
          <div
            className="hero-aurora pointer-events-none absolute inset-0 opacity-[0.55] mix-blend-screen"
            aria-hidden
          />
          <div className="hero-grain pointer-events-none absolute inset-0" aria-hidden />
          <div className="absolute inset-0 z-0">
            <HeroNeuralCanvas pointer={pointer} coarse={coarse} count={count} />
          </div>
        </>
      ) : null}

      <div className="relative z-20 isolate mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
