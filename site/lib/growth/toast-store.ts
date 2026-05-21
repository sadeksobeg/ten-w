import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  body?: string;
  badgeKey?: string;
};

type ToastState = {
  toasts: ToastItem[];
  showToast: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

const MAX_TOASTS = 3;
const AUTO_MS = 3000;

function uid(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  showToast: (t) => {
    const id = uid();
    set((s) => ({
      toasts: [...s.toasts, { ...t, id }].slice(-MAX_TOASTS),
    }));
    window.setTimeout(() => {
      get().dismiss(id);
    }, AUTO_MS);
  },
  dismiss: (id) => {
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
  },
}));
