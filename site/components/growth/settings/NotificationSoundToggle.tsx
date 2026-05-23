"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  isNotificationSoundEnabled,
  setNotificationSoundEnabled,
} from "@/lib/growth/notification-sound";

export function NotificationSoundToggle() {
  const t = useTranslations("Growth.settings.notificationSound");
  const [on, setOn] = useState(true);

  useEffect(() => {
    setOn(isNotificationSoundEnabled());
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    setNotificationSoundEnabled(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${
        on
          ? "border-gold/40 bg-gold/10 text-gold"
          : "border-white/10 bg-white/[0.04] text-white/60"
      }`}
    >
      {on ? t("on") : t("off")}
    </button>
  );
}
