import { create } from "zustand";

export type DemoEventDTO = {
  id: string;
  seq: number;
  kind: string;
  delayMs: number;
  payload: Record<string, unknown>;
};

export type PlaySpeed = 1 | 2 | 5;

type State = {
  overlayOpen: boolean;
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  events: DemoEventDTO[];
  cursor: number;
  playing: boolean;
  reducedMotion: boolean;
  speed: PlaySpeed;
  hookTitle: string | null;
  hookSub: string | null;
  feedLines: string[];
  /** Lines from `chat_story` beats only — for mini-chat rail */
  storyLines: string[];
  phaseHeadline: string | null;
  stageIndex: number;
  volumeUsd: number;
  commissionUsd: number;
  rank: number | null;
  networkNodes: number;
  predictionUsd: number | null;
  /** Full-screen climax card (cleared by UI after a few seconds). */
  climax: { title: string; sub: string; ownership?: string } | null;
};

type Actions = {
  open: () => void;
  close: () => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  setSpeed: (s: PlaySpeed) => void;
  setReducedMotion: (v: boolean) => void;
  startFromApi: (sessionId: string, events: DemoEventDTO[]) => void;
  resetPlayback: () => void;
  applyEventAt: (index: number) => void;
  bumpCursor: () => void;
  setPlaying: (v: boolean) => void;
  applyAllEvents: () => void;
  replay: () => void;
  stepNext: () => void;
  applyExternalDemoBeat: (kind: string, payload: Record<string, unknown>) => void;
  clearClimax: () => void;
};

const baseState: State = {
  overlayOpen: false,
  loading: false,
  error: null,
  sessionId: null,
  events: [],
  cursor: 0,
  playing: false,
  reducedMotion: false,
  speed: 1,
  hookTitle: null,
  hookSub: null,
  feedLines: [],
  storyLines: [],
  phaseHeadline: null,
  stageIndex: -1,
  volumeUsd: 0,
  commissionUsd: 0,
  rank: null,
  networkNodes: 2,
  predictionUsd: null,
  climax: null,
};

function applyEventSlice(state: State, ev: DemoEventDTO): Partial<State> {
  const p = ev.payload;
  const patch: Partial<State> = {};

  if (ev.kind === "cinematic_hook") {
    if (typeof p.headline === "string") patch.hookTitle = p.headline;
    if (typeof p.subline === "string") patch.hookSub = p.subline;
  }

  if (typeof p.headline === "string") {
    patch.feedLines = [...state.feedLines, p.headline].slice(-12);
  }

  if (ev.kind === "chat_story" && typeof p.headline === "string") {
    patch.storyLines = [...state.storyLines, p.headline].slice(-12);
  }

  if (ev.kind === "phase_label" && typeof p.headline === "string") {
    patch.phaseHeadline = p.headline;
  }

  if (ev.kind === "deal_stage" && typeof p.stageIndex === "number") {
    patch.stageIndex = p.stageIndex;
  }

  if (ev.kind === "deal_closed" && typeof p.dealUsd === "number") {
    patch.volumeUsd = state.volumeUsd + p.dealUsd;
  }

  if (ev.kind === "commission" && typeof p.commissionUsd === "number") {
    patch.commissionUsd = state.commissionUsd + p.commissionUsd;
  }

  if (ev.kind === "leaderboard_tick" && typeof p.rank === "number") {
    patch.rank = p.rank;
  }

  if (ev.kind === "network_expand" && typeof p.nodes === "number") {
    patch.networkNodes = Math.max(state.networkNodes, p.nodes);
  }

  if (ev.kind === "insight_prediction" && typeof p.predictionUsd === "number") {
    patch.predictionUsd = p.predictionUsd;
  }

  if (ev.kind === "cinematic_climax") {
    const title = typeof p.headline === "string" ? p.headline : "";
    const sub = typeof p.subline === "string" ? p.subline : "";
    const ownership =
      typeof p.ownershipLine === "string" && p.ownershipLine.trim().length > 0
        ? p.ownershipLine
        : undefined;
    if (title) {
      patch.climax = { title, sub, ownership };
      patch.feedLines = [...state.feedLines, title].slice(-12);
    }
  }

  return patch;
}

export const useCinematicDemoStore = create<State & Actions>((set, get) => ({
  ...baseState,

  open: () => set({ overlayOpen: true, error: null }),

  close: () => set({ overlayOpen: false, playing: false, loading: false, climax: null }),

  setLoading: (v) => set({ loading: v }),

  setError: (msg) => set({ error: msg, loading: false }),

  setSpeed: (s) => set({ speed: s }),

  setReducedMotion: (v) => set({ reducedMotion: v }),

  startFromApi: (sessionId, events) => {
    const reducedMotion = get().reducedMotion;
    const speed = get().speed;
    set({
      ...baseState,
      overlayOpen: true,
      sessionId,
      events,
      cursor: 0,
      playing: !reducedMotion,
      reducedMotion,
      speed,
    });
  },

  replay: () => {
    const sessionId = get().sessionId;
    const events = get().events;
    const reducedMotion = get().reducedMotion;
    const speed = get().speed;
    if (!sessionId || events.length === 0) return;
    set({
      ...baseState,
      overlayOpen: true,
      sessionId,
      events,
      cursor: 0,
      playing: !reducedMotion,
      reducedMotion,
      speed,
    });
  },

  stepNext: () => {
    const { cursor, events } = get();
    if (cursor >= events.length) return;
    get().applyEventAt(cursor);
    set((s) => ({ ...s, cursor: s.cursor + 1 }));
  },

  applyExternalDemoBeat: (kind, payload) => {
    const ev: DemoEventDTO = {
      id: `ext-${Date.now()}`,
      seq: -1,
      kind,
      delayMs: 0,
      payload,
    };
    set((state) => ({ ...state, ...applyEventSlice(state, ev) }));
  },

  clearClimax: () => set({ climax: null }),

  resetPlayback: () =>
    set({
      cursor: 0,
      playing: false,
      hookTitle: null,
      hookSub: null,
      feedLines: [],
      storyLines: [],
      phaseHeadline: null,
      stageIndex: -1,
      volumeUsd: 0,
      commissionUsd: 0,
      rank: null,
      networkNodes: 2,
      predictionUsd: null,
      climax: null,
    }),

  applyEventAt: (index) => {
    const ev = get().events[index];
    if (!ev) return;
    set((state) => ({ ...state, ...applyEventSlice(state, ev) }));
  },

  bumpCursor: () => set((s) => ({ cursor: s.cursor + 1 })),

  setPlaying: (v) => set({ playing: v }),

  applyAllEvents: () => {
    const events = get().events;
    const sessionId = get().sessionId;
    const reducedMotion = get().reducedMotion;
    const speed = get().speed;
    let next: State = {
      ...baseState,
      overlayOpen: true,
      sessionId,
      events,
      reducedMotion,
      speed,
      playing: false,
      cursor: 0,
    };
    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      next = { ...next, ...applyEventSlice(next, ev) };
    }
    set({ ...next, cursor: events.length });
  },
}));
