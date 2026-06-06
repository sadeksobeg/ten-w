"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { MANAGER_ALERTS } from "@/lib/cinema-demo/manager-data";

export function AlertsPanel() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = MANAGER_ALERTS.filter((a) => !dismissed.includes(a.id));

  return (
    <div className="mgr-alerts">
      {visible.map((alert) => (
        <div key={alert.id} className={`mgr-alert mgr-alert--${alert.type}`}>
          <p>{isAr ? alert.textAr : alert.textEn}</p>
          <div className="mgr-alert-actions">
            <span>{isAr ? alert.actionAr : alert.actionEn}</span>
            <button type="button" onClick={() => setDismissed((d) => [...d, alert.id])}>
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
