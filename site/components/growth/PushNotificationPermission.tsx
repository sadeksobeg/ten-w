"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { savePushSubscriptionAction } from "@/lib/growth/actions";

export function PushNotificationPermission() {
  const t = useTranslations("Growth.push");
  const [status, setStatus] = useState<"idle" | "done" | "unsupported">("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
    }
  }, []);

  const enable = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/growth-sw.js");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: undefined,
      });
      const fd = new FormData();
      fd.set("subscription", JSON.stringify(sub.toJSON()));
      await savePushSubscriptionAction(null, fd);
      setStatus("done");
    } catch {
      setStatus("unsupported");
    }
  };

  if (status === "unsupported") return null;
  if (status === "done") return <p className="text-xs text-gold">{t("enabled")}</p>;

  return (
    <button
      type="button"
      onClick={() => void enable()}
      className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/80 hover:border-gold/35"
    >
      {t("enable")}
    </button>
  );
}
