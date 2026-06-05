"use client";

import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { BootPhase } from "@/components/invite/phases/BootPhase";
import { CardPhase } from "@/components/invite/phases/CardPhase";
import { WorldPhase } from "@/components/invite/phases/WorldPhase";
import { InviteAmbientCanvas } from "@/components/invite/InviteAmbientCanvas";
import { useInviteExperienceStore } from "@/stores/invite-experience-store";

type Props = {
  card: InviteCardPublic;
};

export function TenegtaInviteExperience({ card }: Props) {
  const reduceMotion = useReducedMotion();
  const { phase, completeBoot, skipToCard } = useInviteExperienceStore();

  useEffect(() => {
    if (reduceMotion) skipToCard();
  }, [reduceMotion, skipToCard]);

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden">
      {phase !== "boot" ? <InviteAmbientCanvas density={56} /> : null}
      <div className="invite-vignette pointer-events-none fixed inset-0 z-[1]" aria-hidden />

      <AnimatePresence mode="wait">
        {phase === "boot" ? (
          <BootPhase
            key="boot"
            alreadyAccepted={card.accepted}
            onComplete={completeBoot}
          />
        ) : null}
      </AnimatePresence>

      {phase === "card" ? <CardPhase card={card} /> : null}
      {phase === "world" ? <WorldPhase card={card} /> : null}
    </div>
  );
}