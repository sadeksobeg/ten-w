"use client";

import { useToastStore } from "@/lib/growth/toast-store";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed top-4 z-[200] flex flex-col gap-2 p-4"
      style={{ insetInlineEnd: "1rem" }}
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`growth-toast-enter pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border bg-[var(--growth-surface-2)] px-4 py-3 shadow-lg backdrop-blur-md ${
            t.type === "success"
              ? "border-emerald-500/40"
              : t.type === "error"
                ? "border-rose-500/40"
                : "border-[var(--growth-border)]"
          }`}
        >
          {t.badgeKey ? (
            <BadgeIcon badgeKey={t.badgeKey} earned size="sm" showGlow />
          ) : (
            <span className="text-lg" aria-hidden>
              {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--growth-text)]">{t.title}</p>
            {t.body ? (
              <p className="mt-0.5 text-xs text-[var(--growth-text-sub)]">{t.body}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 text-xs text-white/40 hover:text-white"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
