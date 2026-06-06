"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { useMediaQuery } from "@/components/invite/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

type Props = {
  card: InviteCardPublic;
  inviteUrl: string;
};

export function AccessTokenCard({ card, inviteUrl }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 640px) and (pointer: fine)");
  const wrapRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [holoAngle, setHoloAngle] = useState(105);

  const handleDisplay = card.handle.startsWith("@") ? card.handle : `@${card.handle}`;
  const issued = new Intl.DateTimeFormat("ar", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(card.createdAt));

  useEffect(() => {
    if (!qrRef.current) return;
    void QRCode.toCanvas(qrRef.current, inviteUrl, {
      width: 140,
      margin: 1,
      color: { dark: "#E4B84D", light: "#0F0B1E" },
    });
  }, [inviteUrl]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDesktop || reducedMotion || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: py * -12, y: px * 12 });
      setHoloAngle(105 + px * 40 + py * 20);
    },
    [isDesktop, reducedMotion],
  );

  const onPointerLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHoloAngle(105);
  };

  const shellTransform = isDesktop
    ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
    : reducedMotion
      ? undefined
      : "rotate(-3deg)";

  return (
    <div className="invite-vip-wrap mx-auto" ref={wrapRef}>
      <div
        className={`invite-vip-card-shell invite-card-float invite-vip-shadow relative ${flipped ? "is-flipped" : ""}`}
        style={{
          transform: shellTransform,
          ["--holo-angle" as string]: `${holoAngle}deg`,
        }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={() => {
          if (!isDesktop) setFlipped((f) => !f);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="بطاقة الدعوة — اضغط للقلب على الموبايل"
      >
        {/* Front */}
        <div className="invite-vip-face invite-vip-body">
          <div className="invite-foil-border absolute inset-0 rounded-[16px] p-px">
            <div className="relative h-full w-full rounded-[15px] bg-[var(--surface)]" />
          </div>
          <div className="invite-holo-overlay absolute inset-0 rounded-[16px]" />
          <div className="invite-scanline absolute inset-x-0 h-px bg-white/5" />

          <div className="relative flex h-full flex-col p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="invite-text-shimmer invite-font-arabic text-sm font-bold tracking-[0.2em] text-[var(--gold-light)]">
                  TENEGTA
                </p>
                <p className="mt-1 text-[10px] text-[var(--text-sub)]">Creator Invitation</p>
              </div>
              <div className="invite-chip" aria-hidden />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-[9px] uppercase tracking-[0.24em] text-white/40">Invited Guest</p>
              <h2 className="invite-font-display mt-2 text-2xl font-semibold text-[var(--text)] sm:text-[1.65rem]">
                {card.name}
              </h2>
              <p className="mt-1 text-sm font-semibold text-[var(--purple-light)]">{handleDisplay}</p>
            </div>

            <div className="flex items-end justify-between gap-2 text-[10px]">
              <div>
                <p className="invite-font-mono text-[8px] uppercase text-[var(--gold)]/50">Access Token</p>
                <p className="invite-font-mono text-[11px] text-[var(--gold-light)]">{card.token}</p>
              </div>
              <div className="text-end">
                <p className="text-[var(--text-sub)]">{card.scope}</p>
                <p className="text-white/35">{issued}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="invite-vip-face invite-vip-back invite-vip-body">
          <div className="relative flex h-full flex-col items-center justify-center gap-3 p-5">
            <p className="text-xs text-[var(--gold-light)]">امسح للانضمام</p>
            <canvas ref={qrRef} className="rounded-lg border border-[var(--gold)]/30" />
            <p className="invite-font-mono max-w-[90%] truncate text-[9px] text-[var(--text-sub)]">
              {card.token}
            </p>
            <p className="text-[10px] text-white/40">{card.tier}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
