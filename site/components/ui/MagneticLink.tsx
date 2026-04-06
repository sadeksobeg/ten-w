"use client";

import type { ComponentProps } from "react";
import { useCallback, useState } from "react";
import { useSound } from "@/components/sound/SoundProvider";
import { Link } from "@/i18n/navigation";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const MAX_PX = 14;
const STRENGTH = 0.32;

type Props = ComponentProps<typeof Link>;

export function MagneticLink({ className = "", children, ...rest }: Props) {
  const reduced = useReducedMotion();
  const { playHover } = useSound();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (reduced) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * STRENGTH;
      const dy = (e.clientY - cy) * STRENGTH;
      setOffset({
        x: Math.max(-MAX_PX, Math.min(MAX_PX, dx)),
        y: Math.max(-MAX_PX, Math.min(MAX_PX, dy)),
      });
    },
    [reduced],
  );

  const onLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return (
    <Link
      className={`relative ${className}`}
      onMouseMove={onMove}
      onMouseEnter={() => playHover()}
      onMouseLeave={onLeave}
      {...rest}
    >
      <span
        className="inline-flex will-change-transform"
        style={{
          transform:
            reduced || (offset.x === 0 && offset.y === 0)
              ? undefined
              : `translate3d(${offset.x}px,${offset.y}px,0)`,
        }}
      >
        {children}
      </span>
    </Link>
  );
}
