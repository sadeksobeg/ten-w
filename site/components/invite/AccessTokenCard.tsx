"use client";

import { motion } from "framer-motion";
import type { InviteCardPublic } from "@/lib/invite/get-card";

type Props = {
  card: InviteCardPublic;
  tilt: { rotateX: number; rotateY: number };
};

export function AccessTokenCard({ card, tilt }: Props) {
  const handleDisplay = card.handle.startsWith("@") ? card.handle : `@${card.handle}`;

  return (
    <motion.div
      style={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        transformPerspective: 1400,
      }}
      className="relative mx-auto w-full max-w-[420px]"
    >
      <div
        className="pointer-events-none absolute -inset-10 rounded-[2.5rem] bg-[var(--invite-gold)]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[var(--invite-purple)]/12 blur-2xl"
        aria-hidden
      />

      <article className="invite-luxury-card relative aspect-[1.58/1] p-5 sm:p-6">
        <div className="invite-card-shine" aria-hidden />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="invite-chip" aria-hidden />
            <div>
              <p className="text-[10px] font-bold tracking-[0.22em] text-[var(--invite-gold-bright)]">
                TENEGTA
              </p>
              <p className="text-[10px] text-white/45">Creator Invitation</p>
            </div>
          </div>
          <div
            className="flex size-11 items-center justify-center rounded-full border border-[var(--invite-gold)]/30 bg-gradient-to-br from-[var(--invite-gold)]/20 to-transparent text-lg text-[var(--invite-gold-bright)]"
            aria-hidden
          >
            ✦
          </div>
        </div>

        <div className="relative mt-8 text-center sm:mt-10">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-white/45">INVITED GUEST</p>
          <h2 className="invite-font-display mt-2 text-3xl font-semibold leading-tight text-white sm:text-4xl">
            {card.name}
          </h2>
          <p className="mt-2 text-sm font-semibold text-[var(--invite-purple)]">{handleDisplay}</p>
        </div>

        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 sm:inset-x-6 sm:bottom-6">
          <span className="invite-badge text-[10px]">{card.tier}</span>
          <div className="text-end">
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/35">Valid invitation</p>
            <p className="mt-0.5 text-[10px] font-semibold text-white/55">{card.scope}</p>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
