"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { AccessTokenCard } from "@/components/invite/AccessTokenCard";
import { useInviteExperienceStore } from "@/stores/invite-experience-store";

type Props = {
  card: InviteCardPublic;
};

function MacTitleBar() {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-t-xl border border-b-0 border-white/10 bg-[#0d0d14] px-4 py-2.5">
      <span className="size-2.5 rounded-full bg-[#ff5f57]" />
      <span className="size-2.5 rounded-full bg-[#febc2e]" />
      <span className="size-2.5 rounded-full bg-[#28c840]" />
      <span className="invite-font-mono ms-auto text-[10px] text-white/35">access_token.env</span>
    </div>
  );
}

export function CardPhase({ card }: Props) {
  const reduceMotion = useReducedMotion();
  const { accepting, acceptError, setAccepting, setAcceptError, enterWorld } =
    useInviteExperienceStore();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [revealed, setRevealed] = useState(Boolean(reduceMotion));
  const granted = card.accepted;

  useEffect(() => {
    if (reduceMotion) return;
    const t = window.setTimeout(() => setRevealed(true), 200);
    return () => window.clearTimeout(t);
  }, [reduceMotion]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduceMotion || window.matchMedia("(max-width: 639px)").matches) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ rotateX: -y * 12, rotateY: x * 14 });
    },
    [reduceMotion],
  );

  const onAccept = async () => {
    if (granted) {
      enterWorld();
      return;
    }
    setAccepting(true);
    setAcceptError(null);
    try {
      const res = await fetch(`/api/invite/${card.slug}/accept`, { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setAcceptError(data.error ?? "Failed");
        return;
      }
      enterWorld();
    } catch {
      setAcceptError("Network error");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-center px-4 py-10 sm:px-6"
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTilt({ rotateX: 0, rotateY: 0 })}
    >
      <MacTitleBar />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.88, filter: "blur(12px)" }}
        animate={
          revealed
            ? { opacity: 1, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, scale: 0.88, filter: "blur(12px)" }
        }
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full [transform-style:preserve-3d]"
      >
        <AccessTokenCard card={card} tilt={tilt} />
      </motion.div>

      <div className="mt-8 space-y-4 text-center sm:mt-10">
        <h3 className="text-lg font-bold text-white">{card.name}</h3>
        <p className="invite-font-mono text-xs text-[var(--invite-teal)] sm:text-sm">
          {granted ? "// ACCESS GRANTED" : "// PENDING AUTHORIZATION"} · {card.tier}
        </p>
        <p className="text-sm leading-relaxed text-white/70">{card.message}</p>
        <p className="invite-font-mono text-[10px] text-white/40">scope: {card.scope}</p>

        <div className="invite-font-mono flex flex-wrap items-center justify-center gap-2 text-xs text-white/50">
          <span>{card.token}</span>
          {!granted ? <span className="invite-cursor-blink inline-block w-2" /> : null}
        </div>

        {acceptError ? (
          <p className="text-xs text-rose-400">{acceptError}</p>
        ) : null}

        <button
          type="button"
          disabled={accepting}
          onClick={() => void onAccept()}
          className="invite-cta-glow invite-font-mono mx-auto mt-2 flex min-h-[52px] w-full max-w-sm items-center justify-center gap-2 rounded-xl border border-[var(--invite-purple)]/50 bg-gradient-to-r from-[var(--invite-purple)]/20 via-[var(--invite-purple)]/10 to-[var(--invite-teal)]/10 px-6 py-3.5 text-sm font-bold text-white transition hover:border-[var(--invite-teal)]/45 disabled:opacity-50 sm:w-auto"
        >
          {accepting
            ? "$ processing..."
            : granted
              ? "$ enter_tenegta_world →"
              : "$ accept_invitation →"}
        </button>
      </div>
    </motion.div>
  );
}
