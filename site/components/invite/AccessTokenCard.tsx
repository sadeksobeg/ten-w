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
      className="relative w-full max-w-[440px]"
    >
      <div className="absolute -inset-8 rounded-[2.5rem] bg-[var(--invite-purple)]/15 blur-3xl" aria-hidden />
      <div className="absolute -inset-4 rounded-[2rem] bg-[var(--invite-teal)]/5 blur-2xl" aria-hidden />

      <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
        <span className="invite-pulse-ring absolute size-[118%] rounded-[1.85rem] border border-[var(--invite-purple)]/30" />
        <span
          className="invite-pulse-ring absolute size-[135%] rounded-[2rem] border border-[var(--invite-teal)]/20"
          style={{ animationDelay: "0.9s" }}
        />
      </div>

      <div className="invite-orbit pointer-events-none absolute -inset-12 opacity-50" aria-hidden>
        {[0, 72, 144, 216, 288].map((deg) => (
          <span
            key={deg}
            className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--invite-purple)] shadow-[0_0_12px_#7b6fff]"
            style={{ transform: `rotate(${deg}deg) translateY(-155px)` }}
          />
        ))}
      </div>

      <article className="invite-token-card invite-holo-card relative overflow-hidden rounded-[1.35rem] p-5 sm:rounded-2xl sm:p-6">
        <div className="invite-holo-sheen pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="invite-card-shimmer pointer-events-none absolute inset-0 opacity-30" aria-hidden />

        <div className="relative mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl border border-[var(--invite-gold)]/40 bg-gradient-to-br from-[var(--invite-gold)]/20 to-transparent text-sm text-[var(--invite-gold)] shadow-[0_0_20px_-8px_#e4b84d]">
              ◆
            </span>
            <div>
              <span className="invite-font-mono block text-[10px] tracking-[0.28em] text-white/75">
                T.E.N.E.G.T.A
              </span>
              <span className="invite-font-mono text-[8px] text-[var(--invite-teal)]/80">
                content creator access
              </span>
            </div>
          </div>
          <span className="size-8 rounded-full border border-white/10 bg-gradient-to-br from-white/10 to-transparent" aria-hidden />
        </div>

        <div className="relative py-5 text-center sm:py-6">
          <p className="invite-font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--invite-purple)]">
            authorized identity
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-[1.65rem]">{card.name}</h2>
          <p className="invite-font-mono mt-2 text-sm text-[var(--invite-purple)]">{handleDisplay}</p>
        </div>

        <div className="relative flex items-end justify-between gap-3 border-t border-white/10 pt-4">
          <span className="invite-font-mono rounded-full border border-[var(--invite-gold)]/30 bg-[var(--invite-gold)]/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-[var(--invite-gold)]">
            {card.tier}
          </span>
          <span className="invite-font-mono max-w-[58%] truncate text-[8px] text-white/35 sm:text-[9px]">
            {card.token}
          </span>
        </div>
      </article>
    </motion.div>
  );
}
