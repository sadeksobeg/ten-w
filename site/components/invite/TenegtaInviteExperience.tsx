"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { UpwardParticlesCanvas } from "@/components/invite/canvas/UpwardParticlesCanvas";
import { InviteVisualBackground } from "@/components/invite/InviteVisualBackground";
import { MagneticCursor } from "@/components/invite/MagneticCursor";
import { ScrollProgressBar } from "@/components/invite/ScrollProgressBar";
import { BootPhase } from "@/components/invite/phases/BootPhase";
import { CardPhase } from "@/components/invite/phases/CardPhase";
import { WorldPhase } from "@/components/invite/phases/WorldPhase";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";
import { useInviteExperienceStore } from "@/stores/invite-experience-store";

type Props = {
  card: InviteCardPublic;
  origin: string;
};

export function TenegtaInviteExperience({ card, origin }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const { phase, completeBoot } = useInviteExperienceStore();
  const [ambientVisible, setAmbientVisible] = useState(reducedMotion);
  const [mounted, setMounted] = useState(false);
  const baseTitle = `${card.name} — TENEGTA`;
  const skipBoot = card.accepted || reducedMotion;

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (skipBoot) {
      setAmbientVisible(true);
      completeBoot();
    }
  }, [skipBoot, completeBoot]);

  useEffect(() => {
    if (!mounted) return;
    document.title = baseTitle;
    const titles = [baseTitle, "✦ دعوتك الخاصة ✦", baseTitle];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % titles.length;
      document.title = titles[i] ?? baseTitle;
    }, 2000);
    return () => {
      clearInterval(id);
      document.title = baseTitle;
    };
  }, [mounted, baseTitle]);

  if (!mounted) {
    return (
      <div className="invite-experience-root flex min-h-[100dvh] items-center justify-center bg-[var(--void)]">
        <p className="invite-loading-logo invite-font-display invite-text-shimmer text-2xl tracking-[0.3em]">
          TENEGTA
        </p>
      </div>
    );
  }

  const showAmbient = ambientVisible || phase !== "boot";

  return (
    <div className="invite-experience-root bg-[var(--void)]" dir="rtl">
      <InviteVisualBackground visible={showAmbient} />
      <UpwardParticlesCanvas visible={showAmbient} />
      <div className="invite-vignette" aria-hidden />
      <MagneticCursor />
      {phase === "card" ? <ScrollProgressBar /> : null}

      {phase === "boot" && !skipBoot ? (
        <BootPhase
          alreadyAccepted={card.accepted}
          onComplete={completeBoot}
          onCanvasVisible={() => setAmbientVisible(true)}
        />
      ) : null}

      {phase === "card" ? (
        <div className="invite-phase-fade invite-phase-visible relative z-10">
          <CardPhase card={card} origin={origin} />
        </div>
      ) : null}

      {phase === "world" ? <WorldPhase card={card} origin={origin} /> : null}
    </div>
  );
}
