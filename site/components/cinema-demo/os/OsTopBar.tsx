"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function OsTopBar() {
  const t = useTranslations("CinemaDemo");
  const activeBranch = useCinemaDemoStore((s) => s.activeBranch);
  const setActiveBranch = useCinemaDemoStore((s) => s.setActiveBranch);
  const [clock, setClock] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("ar-SY", { weekday: "long", day: "numeric", month: "long" }));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="cinema-os-topbar">
      <div className="cinema-os-topbar-main">
        <span className="cinema-os-live-dot" aria-hidden />
        <span suppressHydrationWarning>
          {t("os.topbar")} · {date || "—"} · {clock || "—"}
        </span>
      </div>
      <select
        className="cinema-os-branch-select"
        value={activeBranch}
        onChange={(e) => setActiveBranch(e.target.value as "main" | "north" | "south")}
        aria-label={t("os.branchLabel")}
      >
        <option value="main">{t("os.branchMain")}</option>
        <option value="north">{t("os.branchNorth")}</option>
        <option value="south">{t("os.branchSouth")}</option>
      </select>
    </header>
  );
}
