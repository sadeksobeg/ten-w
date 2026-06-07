"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { playNotificationPing } from "@/lib/cinema-demo/sounds";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

type Toast = { id: number; text: string };

export function NotificationSystem() {
  const t = useTranslations("CinemaDemo");
  const soundEnabled = useCinemaDemoStore((s) => s.soundEnabled);
  const [toast, setToast] = useState<Toast | null>(null);

  const messages = useMemo(
    () => [
      t("os.notifyNewBooking"),
      t("os.notifyLowSeats"),
      t("os.notifyRecommendation"),
      t("os.notifyVipPaid"),
      t("os.notifyPaymentSuccess"),
    ],
    [t],
  );

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      const text = messages[Math.floor(Math.random() * messages.length)];
      const tid = Date.now();
      setToast({ id: tid, text });
      playNotificationPing(soundEnabled);
      window.setTimeout(() => setToast((current) => (current?.id === tid ? null : current)), 3200);
    }, 20000);
    return () => clearInterval(id);
  }, [messages, soundEnabled]);

  if (!toast) return null;

  return (
    <div className="cinema-os-notification" role="status">
      {toast.text}
    </div>
  );
}
