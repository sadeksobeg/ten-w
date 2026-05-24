"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { useToast } from "@/hooks/useToast";
import { adminSetChatModeratorAction } from "@/lib/growth/actions";

export type ChatModeratorPartner = {
  userId: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  chatModerator: boolean;
};

type Props = { partners: ChatModeratorPartner[] };

export function AdminChatModeratorsClient({ partners: initial }: Props) {
  const t = useTranslations("Growth.admin.chatModerators");
  const { showToast } = useToast();
  const [partners, setPartners] = useState(initial);
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter(
      (p) =>
        p.email.toLowerCase().includes(q) ||
        (p.name?.toLowerCase().includes(q) ?? false),
    );
  }, [partners, query]);

  const moderators = partners.filter((p) => p.chatModerator);

  async function toggle(userId: string, enabled: boolean) {
    setPendingId(userId);
    const fd = new FormData();
    fd.set("userId", userId);
    fd.set("enabled", enabled ? "1" : "0");
    const res = await adminSetChatModeratorAction(fd);
    setPendingId(null);
    if (res.ok) {
      setPartners((prev) =>
        prev.map((p) => (p.userId === userId ? { ...p, chatModerator: enabled } : p)),
      );
      showToast({ type: "success", title: enabled ? t("toastOn") : t("toastOff") });
    } else {
      showToast({ type: "error", title: t("toastError") });
    }
  }

  return (
    <GlassCard className="space-y-4 p-5">
      <div>
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-white/60">{t("hint")}</p>
        <p className="mt-2 text-xs text-gold/80">
          {t("stat", { count: moderators.length })}
        </p>
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("search")}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/40"
      />
      <ul className="max-h-[420px] space-y-2 overflow-y-auto">
        {filtered.map((p) => (
          <li
            key={p.userId}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
              p.chatModerator ? "border-gold/35 bg-gold/10" : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <GrowthAvatar name={p.name} email={p.email} avatarUrl={p.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{p.name ?? p.email}</p>
              <p className="truncate text-[10px] text-white/45">{p.email}</p>
            </div>
            <button
              type="button"
              disabled={pendingId === p.userId}
              onClick={() => void toggle(p.userId, !p.chatModerator)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-bold transition ${
                p.chatModerator
                  ? "border border-rose-400/40 bg-rose-500/15 text-rose-200"
                  : "border border-gold/40 bg-gold/15 text-gold"
              }`}
            >
              {pendingId === p.userId ? "…" : p.chatModerator ? t("revoke") : t("grant")}
            </button>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
