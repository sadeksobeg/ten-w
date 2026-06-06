"use client";

import { useCallback, useRef, useState } from "react";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { ChipIcon } from "@/components/invite/ChipIcon";
import { useMediaQuery } from "@/components/invite/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

type Props = {
  card: InviteCardPublic;
  variant?: "default" | "luxury";
  revealed?: boolean;
};

export function AccessTokenCard({ card, variant = "default", revealed = true }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 640px) and (pointer: fine)");
  const isLuxury = variant === "luxury";
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
      setTilt({ x: -deltaY * 12, y: deltaX * 12 });
      setHovered(true);
    },
    [isDesktop, reducedMotion],
  );

  const onPointerLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  const transform = isDesktop
    ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
    : undefined;

  const shellClass = [
    "invite-vip-card-shell",
    "invite-vip-shadow",
    isLuxury ? "invite-vip-card-shell--luxury" : "",
    !isDesktop && !reducedMotion ? "invite-card-float" : "",
    revealed ? "invite-vip-card-shell--revealed" : "invite-vip-card-shell--hidden",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`invite-vip-wrap ${isLuxury ? "invite-vip-wrap--luxury" : ""}`} ref={wrapRef}>
      {isLuxury ? <div className="invite-vip-spotlight" aria-hidden /> : null}
      <div
        className={shellClass}
        style={{
          transform,
          transition: hovered ? "none" : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        aria-label="بطاقة الدعوة VIP"
      >
        <div className="invite-vip-foil-wrap">
          <div className="invite-vip-inner">
            {isLuxury ? (
              <>
                <div className="invite-vip-texture" aria-hidden />
                <div className="invite-vip-corner invite-vip-corner--tl" aria-hidden />
                <div className="invite-vip-corner invite-vip-corner--tr" aria-hidden />
                <div className="invite-vip-corner invite-vip-corner--bl" aria-hidden />
                <div className="invite-vip-corner invite-vip-corner--br" aria-hidden />
              </>
            ) : null}
            <div className="invite-vip-holo" />
            <div className="invite-vip-scanline" />
            <div className={`invite-vip-content ${isLuxury ? "invite-vip-content--luxury" : ""}`}>
              <div className="invite-vip-top">
                <div className="invite-vip-brand-block">
                  <p className="invite-vip-brand">TENEGTA</p>
                  {isLuxury ? <p className="invite-vip-subbrand">ASCEND · ACCESS</p> : null}
                </div>
                <ChipIcon />
              </div>

              <div className="invite-vip-center">
                <h2 className="invite-vip-name">{card.name}</h2>
                <p className="invite-vip-tier">{card.tier.toUpperCase()}</p>
              </div>

              <div className="invite-vip-bottom">
                <p className="invite-vip-token">◆ {card.token} ◆</p>
                <div className="invite-vip-meta">
                  {isLuxury ? <span className="invite-vip-status">VERIFIED</span> : null}
                  <p className="invite-vip-year">{year}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
