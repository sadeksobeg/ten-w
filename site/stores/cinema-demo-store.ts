import { create } from "zustand";

export type CinemaDemoPhase =
  | "splash"
  | "movies"
  | "showtime"
  | "seats"
  | "checkout"
  | "ticket"
  | "dashboard";

type State = {
  phase: CinemaDemoPhase;
  movieId: string | null;
  showtimeId: string | null;
  selectedSeatIds: string[];
  guestName: string;
  bookingRef: string | null;
};

type Actions = {
  setPhase: (phase: CinemaDemoPhase) => void;
  selectMovie: (id: string) => void;
  selectShowtime: (id: string) => void;
  toggleSeat: (id: string) => void;
  setGuestName: (name: string) => void;
  confirmBooking: () => void;
  resetDemo: () => void;
};

const initial: State = {
  phase: "splash",
  movieId: null,
  showtimeId: null,
  selectedSeatIds: [],
  guestName: "",
  bookingRef: null,
};

function makeBookingRef() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `SLM-${n}`;
}

export const useCinemaDemoStore = create<State & Actions>((set, get) => ({
  ...initial,

  setPhase: (phase) => set({ phase }),

  selectMovie: (id) =>
    set({ movieId: id, showtimeId: null, selectedSeatIds: [], phase: "showtime" }),

  selectShowtime: (id) => set({ showtimeId: id, selectedSeatIds: [], phase: "seats" }),

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

  confirmBooking: () =>
    set({ bookingRef: makeBookingRef(), phase: "ticket" }),

  resetDemo: () => set({ ...initial }),
}));
