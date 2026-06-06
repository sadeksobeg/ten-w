"use client";

import { useCallback, useRef, useState } from "react";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { ChipIcon } from "@/components/invite/ChipIcon";
import { useMediaQuery } from "@/components/invite/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

type Props = {
  card: InviteCardPublic;
};

export function AccessTokenCard({ card }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 640px) and (pointer: fine)");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const year = new Date().getFullYear();

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDesktop || reducedMotion || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const deltaX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const deltaY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      setTilt({ x: -deltaY * 10, y: deltaX * 10 });
      setHovered(true);
    },
    [isDesktop, reducedMotion],
  );

  const onPointerLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  const transform = isDesktop
    ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
    : undefined;

  return (
    <div className="invite-vip-wrap" ref={wrapRef}>
      <div
        className={`invite-vip-card-shell invite-card-float invite-vip-shadow ${!isDesktop && !reducedMotion ? "invite-card-float" : ""}`}
        style={{
          transform,
          transition: hovered ? "none" : "transform 0.5s ease",
        }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        aria-label="بطاقة الدعوة VIP"
      >
        <div className="invite-vip-foil-wrap">
          <div className="invite-vip-inner">
            <div className="invite-vip-holo" />
            <div className="invite-vip-scanline" />
            <div className="invite-vip-content">
              <div className="invite-vip-top">
                <p className="invite-vip-brand">
                  TENEGTA · ASCEND
                </p>
                <ChipIcon />
              </div>

              <div className="invite-vip-center">
                <h2 className="invite-vip-name">{card.name}</h2>
                <p className="invite-vip-tier">{card.tier.toUpperCase()}</p>
              </div>

              <div className="invite-vip-bottom">
                <p className="invite-vip-token">◆ {card.token} ◆</p>
                <p className="invite-vip-year">{year}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
