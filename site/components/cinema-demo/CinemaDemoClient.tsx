"use client";

import { useEffect } from "react";
import { CinemaDemoExperience } from "@/components/cinema-demo/CinemaDemoExperience";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import type { CinemaDemoPhase } from "@/stores/cinema-demo-store";

type Props = {
  presenter?: boolean;
  phase?: string;
};

export function CinemaDemoClient({ presenter, phase }: Props) {
  const initPresenterMode = useCinemaDemoStore((s) => s.initPresenterMode);

  useEffect(() => {
    if (!presenter) return;
    const jump =
      phase === "ticket" ? ("ticket" as CinemaDemoPhase) : phase === "movies" ? "movies" : undefined;
    initPresenterMode({ jumpPhase: jump });
  }, [presenter, phase, initPresenterMode]);

  return <CinemaDemoExperience skipBoot={presenter} />;
}
