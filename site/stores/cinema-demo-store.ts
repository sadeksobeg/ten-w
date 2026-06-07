import { create } from "zustand";
import type { LiveSeatState } from "@/components/cinema-demo/hooks/useLiveSeatSimulation";
import { pickBestSeats } from "@/lib/cinema-demo/smart-pick";
import { buildSeatLayout3D } from "@/lib/cinema-demo/seat-layout-3d";
import type { BookingFeedItem } from "@/lib/cinema-demo/manager-data";
import type { CameraPreset } from "@/lib/cinema-demo/camera-presets";

export type CinemaDemoPhase =
  | "boot"
  | "movies"
  | "showtime"
  | "seats"
  | "checkout"
  | "upsell"
  | "ticket"
  | "sessionReveal"
  | "roi"
  | "closing";

export type ManagerView = "overview" | "screen1" | "screen2" | "screen3";
export type SeatView = "3d" | "2d";
export type ActiveBranch = "main" | "north" | "south";
export type GrainIntensity = "boot" | "splash" | "normal" | "dashboard";
export type ScreenMode = "preMovie" | "playing" | "intermission";

type State = {
  phase: CinemaDemoPhase;
  bootStage: number;
  osReady: boolean;
  sessionStartedAt: number | null;
  managerView: ManagerView;
  selectedScreen: number | null;
  movieId: string | null;
  showtimeId: string | null;
  selectedSeatIds: string[];
  guestName: string;
  bookingRef: string | null;
  upsellAdded: boolean;
  upsellItems: string[];
  roiSeats: number;
  soundEnabled: boolean;
  liveBrowsers: number;
  transitionClass: string;
  seatView: SeatView;
  cameraPreset: CameraPreset;
  focusedSeatId: string | null;
  hudHoverSeatId: string | null;
  liveRevenue: number;
  revenueTarget: number;
  featuresSeen: number[];
  activeBranch: ActiveBranch;
  grainIntensity: GrainIntensity;
  screenMode: ScreenMode;
  bookingFeed: BookingFeedItem[];
  ticketsBookedSession: number;
  smartPickAnimating: boolean;
  liveSeatStates: LiveSeatState;
};

type Actions = {
  setPhase: (phase: CinemaDemoPhase) => void;
  setBootStage: (stage: number) => void;
  setOsReady: (v: boolean) => void;
  setSessionStartedAt: (t: number | null) => void;
  setManagerView: (view: ManagerView) => void;
  setSelectedScreen: (id: number | null) => void;
  selectMovie: (id: string) => void;
  selectShowtime: (id: string) => void;
  toggleSeat: (id: string) => void;
  setGuestName: (name: string) => void;
  confirmCheckout: () => void;
  addUpsell: (itemId: string) => void;
  skipUpsell: () => void;
  confirmBooking: () => void;
  setRoiSeats: (seats: number) => void;
  setSoundEnabled: (v: boolean) => void;
  setLiveBrowsers: (n: number) => void;
  setTransitionClass: (cls: string) => void;
  setSeatView: (view: SeatView) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setFocusedSeatId: (id: string | null) => void;
  setHudHoverSeatId: (id: string | null) => void;
  setActiveBranch: (branch: ActiveBranch) => void;
  setGrainIntensity: (g: GrainIntensity) => void;
  setScreenMode: (m: ScreenMode) => void;
  markFeatureSeen: (id: number) => void;
  pushBookingFeed: (item: BookingFeedItem) => void;
  incrementRevenue: (amount: number) => void;
  addTicketsBooked: (count: number) => void;
  smartPickSeats: (count?: number) => void;
  setLiveSeatStates: (states: LiveSeatState) => void;
  goToSessionReveal: () => void;
  goToRoi: () => void;
  goToClosing: () => void;
  resetDemo: () => void;
};

const REVENUE_BY_BRANCH: Record<ActiveBranch, number> = {
  main: 2847500,
  north: 1920000,
  south: 2150000,
};

const initial: State = {
  phase: "boot",
  bootStage: 0,
  osReady: false,
  sessionStartedAt: null,
  managerView: "overview",
  selectedScreen: null,
  movieId: null,
  showtimeId: null,
  selectedSeatIds: [],
  guestName: "",
  bookingRef: null,
  upsellAdded: false,
  upsellItems: [],
  roiSeats: 120,
  soundEnabled: true,
  liveBrowsers: 12,
  transitionClass: "",
  seatView: "3d",
  cameraPreset: "dramaticEntry",
  focusedSeatId: null,
  hudHoverSeatId: null,
  liveRevenue: 2847500,
  revenueTarget: 3500000,
  featuresSeen: [],
  activeBranch: "main",
  grainIntensity: "boot",
  screenMode: "preMovie",
  bookingFeed: [],
  ticketsBookedSession: 0,
  smartPickAnimating: false,
  liveSeatStates: {},
};

function makeBookingRef() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `SLM-${n}`;
}

export const useCinemaDemoStore = create<State & Actions>((set, get) => ({
  ...initial,

  setPhase: (phase) => {
    const grain: GrainIntensity =
      phase === "boot" ? "boot" : phase === "movies" ? "splash" : phase === "closing" || phase === "roi" ? "dashboard" : "normal";
    set({ phase, grainIntensity: grain });
  },
  setBootStage: (stage) => set({ bootStage: stage }),
  setOsReady: (v) => set({ osReady: v }),
  setSessionStartedAt: (t) => set({ sessionStartedAt: t }),
  setManagerView: (view) => set({ managerView: view }),
  setSelectedScreen: (id) => set({ selectedScreen: id }),
  setRoiSeats: (seats) => set({ roiSeats: seats }),
  setSoundEnabled: (v) => set({ soundEnabled: v }),
  setLiveBrowsers: (n) => set({ liveBrowsers: n }),
  setTransitionClass: (cls) => set({ transitionClass: cls }),
  setSeatView: (view) => set({ seatView: view }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  setFocusedSeatId: (id) => set({ focusedSeatId: id, cameraPreset: id ? "focus" : get().cameraPreset }),
  setHudHoverSeatId: (id) => set({ hudHoverSeatId: id }),
  setActiveBranch: (branch) => set({ activeBranch: branch, liveRevenue: REVENUE_BY_BRANCH[branch] }),
  setGrainIntensity: (g) => set({ grainIntensity: g }),
  setScreenMode: (m) => set({ screenMode: m }),
  markFeatureSeen: (id) => {
    const seen = get().featuresSeen;
    if (seen.includes(id)) return;
    set({ featuresSeen: [...seen, id] });
  },
  pushBookingFeed: (item) => set({ bookingFeed: [item, ...get().bookingFeed].slice(0, 12) }),
  incrementRevenue: (amount) => set({ liveRevenue: get().liveRevenue + amount }),
  addTicketsBooked: (count) => set({ ticketsBookedSession: get().ticketsBookedSession + count }),

  selectMovie: (id) =>
    set({
      movieId: id,
      showtimeId: null,
      selectedSeatIds: [],
      phase: "showtime",
      transitionClass: "cinema-transition-poster-expand",
    }),

  selectShowtime: (id) =>
    set({
      showtimeId: id,
      selectedSeatIds: [],
      phase: "seats",
      transitionClass: "cinema-transition-zoom-hall",
      cameraPreset: "dramaticEntry",
      focusedSeatId: null,
      screenMode: "preMovie",
    }),

  toggleSeat: (id) => {
    const current = get().selectedSeatIds;
    if (current.includes(id)) {
      set({ selectedSeatIds: current.filter((s) => s !== id) });
      return;
    }
    if (current.length >= 6) return;
    set({ selectedSeatIds: [...current, id], focusedSeatId: id });
  },

  smartPickSeats: (count = 2) => {
    const { showtimeId, selectedSeatIds, liveSeatStates, smartPickAnimating } = get();
    if (!showtimeId || smartPickAnimating) return;
    const { seats } = buildSeatLayout3D(showtimeId);
    const picked = pickBestSeats(seats, count, liveSeatStates, selectedSeatIds);
    if (picked.length === 0) return;
    set({ smartPickAnimating: true, cameraPreset: "birdsEye" });
    let i = 0;
    const interval = window.setInterval(() => {
      if (i < picked.length) {
        const id = picked[i];
        const current = get().selectedSeatIds;
        if (!current.includes(id)) {
          set({ selectedSeatIds: [...current, id], focusedSeatId: id });
        }
        i += 1;
      } else {
        clearInterval(interval);
        set({ cameraPreset: "immersive", smartPickAnimating: false });
      }
    }, 400);
  },

  setLiveSeatStates: (states) => set({ liveSeatStates: states }),

  setGuestName: (name) => set({ guestName: name }),

  confirmCheckout: () => set({ phase: "upsell", transitionClass: "cinema-transition-to-ticket" }),

  addUpsell: (itemId) => {
    const items = get().upsellItems;
    if (!items.includes(itemId)) {
      set({ upsellItems: [...items, itemId], upsellAdded: true });
    }
    set({ phase: "ticket", bookingRef: makeBookingRef() });
  },

  skipUpsell: () => set({ phase: "ticket", bookingRef: makeBookingRef() }),

  confirmBooking: () => set({ bookingRef: makeBookingRef(), phase: "upsell" }),

  goToSessionReveal: () => set({ phase: "sessionReveal" }),
  goToRoi: () => set({ phase: "roi" }),
  goToClosing: () => set({ phase: "closing" }),

  resetDemo: () => set({ ...initial }),
}));
