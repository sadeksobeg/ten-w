import { create } from "zustand";

export type DemoMode = "customer" | "manager" | "vip";

export type CinemaDemoPhase =
  | "splash"
  | "modeSelect"
  | "movies"
  | "showtime"
  | "seats"
  | "checkout"
  | "upsell"
  | "ticket"
  | "manager"
  | "vip"
  | "roi"
  | "closing";

export type ManagerView = "overview" | "screen1" | "screen2" | "screen3";

type State = {
  phase: CinemaDemoPhase;
  demoMode: DemoMode;
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
};

type Actions = {
  setPhase: (phase: CinemaDemoPhase) => void;
  setDemoMode: (mode: DemoMode) => void;
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
  goToRoi: () => void;
  goToClosing: () => void;
  resetDemo: () => void;
};

const initial: State = {
  phase: "splash",
  demoMode: "customer",
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
};

function makeBookingRef() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `SLM-${n}`;
}

export const useCinemaDemoStore = create<State & Actions>((set, get) => ({
  ...initial,

  setPhase: (phase) => set({ phase }),
  setDemoMode: (mode) => set({ demoMode: mode }),
  setManagerView: (view) => set({ managerView: view }),
  setSelectedScreen: (id) => set({ selectedScreen: id }),
  setRoiSeats: (seats) => set({ roiSeats: seats }),
  setSoundEnabled: (v) => set({ soundEnabled: v }),
  setLiveBrowsers: (n) => set({ liveBrowsers: n }),
  setTransitionClass: (cls) => set({ transitionClass: cls }),

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
    }),

  toggleSeat: (id) => {
    const current = get().selectedSeatIds;
    if (current.includes(id)) {
      set({ selectedSeatIds: current.filter((s) => s !== id) });
      return;
    }
    if (current.length >= 6) return;
    set({ selectedSeatIds: [...current, id] });
  },

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

  goToRoi: () => set({ phase: "roi" }),
  goToClosing: () => set({ phase: "closing" }),

  resetDemo: () => set({ ...initial }),
}));
