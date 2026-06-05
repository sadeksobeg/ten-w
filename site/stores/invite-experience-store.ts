"use client";

import { create } from "zustand";

export type InvitePhase = "boot" | "card" | "world";

type State = {
  phase: InvitePhase;
  bootComplete: boolean;
  accepting: boolean;
  acceptError: string | null;
};

type Actions = {
  setPhase: (phase: InvitePhase) => void;
  completeBoot: () => void;
  setAccepting: (v: boolean) => void;
  setAcceptError: (msg: string | null) => void;
  skipToCard: () => void;
  enterWorld: () => void;
};

export const useInviteExperienceStore = create<State & Actions>((set) => ({
  phase: "boot",
  bootComplete: false,
  accepting: false,
  acceptError: null,
  setPhase: (phase) => set({ phase }),
  completeBoot: () => set({ bootComplete: true, phase: "card" }),
  setAccepting: (accepting) => set({ accepting }),
  setAcceptError: (acceptError) => set({ acceptError }),
  skipToCard: () => set({ phase: "card", bootComplete: true }),
  enterWorld: () => set({ phase: "world", accepting: false }),
}));
