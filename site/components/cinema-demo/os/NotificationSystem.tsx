"use client";

import { useEffect, useState } from "react";
import { playNotificationPing } from "@/lib/cinema-demo/sounds";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

const MESSAGES = [
  "[✓] حجز جديد — مقعد C8 — 15,000 ل.س",
  "[!] قاعة 2 — 5 مقاعد متبقية فقط",
  "[💡] توصية: أضف عرض منتصف الليل",
  "[✓] مدفوعة — 3 تذاكر VIP — 60,000 ل.س",
  "[✓] دفع ناجح — 45,000 ل.س",
];

type Toast = { id: number; text: string };

export function NotificationSystem() {
  const soundEnabled = useCinemaDemoStore((s) => s.soundEnabled);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      const text = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      const tid = Date.now();
      setToast({ id: tid, text });
      playNotificationPing(soundEnabled);
      window.setTimeout(() => setToast((t) => (t?.id === tid ? null : t)), 3200);
    }, 20000);
    return () => clearInterval(id);
  }, [soundEnabled]);

  if (!toast) return null;

  return (
    <div className="cinema-os-notification" role="status">
      {toast.text}
    </div>
  );
}
