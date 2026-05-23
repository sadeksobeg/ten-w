"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const ROUTES = [
  { href: "/growth", key: "dashboard" },
  { href: "/growth/deals", key: "deals" },
  { href: "/growth/earnings", key: "earnings" },
  { href: "/growth/network", key: "network" },
  { href: "/growth/leaderboard", key: "leaderboard" },
  { href: "/growth/events", key: "events" },
  { href: "/growth/chat", key: "chat" },
  { href: "/growth/notifications", key: "notifications" },
  { href: "/growth/settings", key: "settings" },
] as const;

export function CommandPalette() {
  const t = useTranslations("Growth.commandPalette");
  const nav = useTranslations("Growth.nav");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#12121a] p-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="px-3 py-2 text-xs text-white/45">{t("hint")}</p>
        <ul className="max-h-[50vh] overflow-y-auto">
          {ROUTES.map((r) => (
            <li key={r.href}>
              <button
                type="button"
                className="w-full rounded-xl px-3 py-2.5 text-start text-sm font-semibold text-white hover:bg-white/[0.06]"
                onClick={() => {
                  router.push(r.href);
                  setOpen(false);
                }}
              >
                {nav(r.key)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
