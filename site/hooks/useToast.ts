"use client";

import { useToastStore, type ToastType } from "@/lib/growth/toast-store";

export function useToast() {
  const showToast = useToastStore((s) => s.showToast);
  const dismiss = useToastStore((s) => s.dismiss);

  return {
    showToast: (params: {
      type: ToastType;
      title: string;
      body?: string;
      badgeKey?: string;
    }) => showToast(params),
    dismiss,
  };
}
