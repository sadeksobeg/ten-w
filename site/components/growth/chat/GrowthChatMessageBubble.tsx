"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { VerifiedBadge } from "@/components/growth/ui/VerifiedBadge";
import { IconEarnings } from "@/components/growth/icons/GrowthIcons";
import type { ChatMessageDTO } from "@/lib/growth/chat-service";

type Props = {
  message: ChatMessageDTO;
  viewerUserId: string;
  isAdmin: boolean;
  locale: string;
  showAvatarRow: boolean;
  kindLabel: (kind: string) => string;
  youLabel: string;
  supportLabel: string;
  partnerLabel: string;
  adminLabel: string;
  avatarLabel?: string;
  senderIsVerified?: boolean;
  verifiedLabel?: string;
};

function parseBadgeKey(
  metadata: Record<string, unknown> | null,
  body: string,
): string | null {
  const raw = metadata?.badgeKey;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  const match = body.match(/badge[_\s-]?key[:\s]+([a-z0-9_]+)/i);
  if (match?.[1]) return match[1];
  const keyMatch = body.match(/\b(first_deal|deals_\d+|first_referral|network_builder|ai_seller|fast_closer|top_performer|elite_pulse|trusted_partner|vip_seller|strategic_agent)\b/i);
  return keyMatch?.[1]?.toLowerCase() ?? null;
}

function parseAmountCents(
  metadata: Record<string, unknown> | null,
  body: string,
): number | null {
  const raw = metadata?.amountCents;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  const match = body.match(/\$?\s*([\d,]+(?:\.\d{1,2})?)/);
  if (match?.[1]) {
    const n = Number.parseFloat(match[1].replace(/,/g, ""));
    if (Number.isFinite(n)) return Math.round(n * 100);
  }
  return null;
}

function bubbleTone(kind: string): string {
  switch (kind) {
    case "SYSTEM":
      return "border-white/12 bg-white/[0.06] text-white/90";
    case "WARNING":
      return "border-rose-400/35 bg-rose-500/10 text-rose-50 shadow-[0_0_22px_rgba(244,63,94,0.15)]";
    case "ACTION":
      return "border-sky-400/35 bg-sky-500/10 text-sky-50";
    default:
      return "";
  }
}

function textToneClass(metadata: Record<string, unknown> | null): string {
  const tone = typeof metadata?.tone === "string" ? metadata.tone : null;
  switch (tone) {
    case "strategic":
      return "border-violet-400/30 bg-violet-500/10 ring-1 ring-violet-400/15";
    case "urgent":
      return "border-rose-400/35 bg-rose-950/30 ring-1 ring-rose-400/20";
    case "reward":
      return "border-gold/40 bg-gold/5 ring-1 ring-gold/25";
    default:
      return "";
  }
}

function avatarInitial(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return label.slice(0, 2).toUpperCase();
}

function messageRowLayout(locale: string, mine: boolean) {
  const rtl = locale === "ar";
  if (mine) {
    return {
      row: rtl ? "justify-start" : "justify-end",
      inner: rtl ? "flex-row" : "flex-row-reverse",
      labelAlign: "text-end",
    };
  }
  return {
    row: rtl ? "justify-end" : "justify-start",
    inner: "flex-row",
    labelAlign: "text-start",
  };
}

export function GrowthChatMessageBubble({
  message: m,
  viewerUserId,
  isAdmin,
  locale,
  showAvatarRow,
  kindLabel,
  youLabel,
  supportLabel,
  partnerLabel,
  adminLabel,
  avatarLabel,
  senderIsVerified = false,
  verifiedLabel,
}: Props) {
  const tChat = useTranslations("Growth.chat");
  const tBadges = useTranslations("Growth.badges");
  const tKw = useTranslations("Growth.chat.keywords");
  const mine = m.senderUserId === viewerUserId;
  const kindUpper = m.kind.toUpperCase();
  const nf =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const time = new Intl.DateTimeFormat(nf, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(m.createdAt));

  const label =
    avatarLabel ??
    (mine
      ? isAdmin
        ? adminLabel
        : youLabel
      : isAdmin
        ? partnerLabel
        : supportLabel);

  const layout = messageRowLayout(locale, mine);

  const [bonusFlash, setBonusFlash] = useState(kindUpper === "BONUS");
  useEffect(() => {
    if (kindUpper !== "BONUS") {
      queueMicrotask(() => setBonusFlash(false));
      return;
    }
    queueMicrotask(() => setBonusFlash(true));
    const id = window.setTimeout(() => setBonusFlash(false), 900);
    return () => window.clearTimeout(id);
  }, [m.id, kindUpper]);

  if (kindUpper === "SYSTEM") {
    return (
      <div className={`flex justify-center py-1.5 ${showAvatarRow ? "pt-2" : "pt-0.5"}`}>
        <p className="max-w-[88%] rounded-2xl bg-white/[0.04] px-4 py-2 text-center text-[11px] italic text-white/50">
          {m.body}
        </p>
      </div>
    );
  }

  if (kindUpper === "BADGE") {
    const badgeKey = parseBadgeKey(m.metadata, m.body) ?? "first_deal";
    let badgeLabel = m.body;
    try {
      badgeLabel = tBadges(`${badgeKey}.label`);
    } catch {
      /* use body fallback */
    }
    return (
      <div
        className={`flex justify-center py-1 ${showAvatarRow ? "pt-2" : "pt-0.5"}`}
      >
        <div
          className="mx-auto flex max-w-[240px] flex-col items-center gap-2 rounded-2xl border p-4 text-center"
          style={{
            borderColor: "rgba(139, 92, 246, 0.4)",
            background: "rgba(139, 92, 246, 0.08)",
          }}
        >
          <BadgeIcon badgeKey={badgeKey} earned size="md" animate showGlow />
          <p className="text-sm font-bold text-white">{tChat("badge_new")}</p>
          <p className="text-xs text-white/70">{badgeLabel}</p>
          <p className="text-[10px] text-white/35">{time}</p>
        </div>
      </div>
    );
  }

  if (kindUpper === "BONUS") {
    const cents = parseAmountCents(m.metadata, m.body) ?? 0;
    const amountStr = `$${(cents / 100).toFixed(2)}`;
    return (
      <div
        className={`flex justify-center py-1 ${showAvatarRow ? "pt-2" : "pt-0.5"}`}
      >
        <div
          className={`mx-auto flex max-w-[240px] flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-shadow duration-500 ${
            bonusFlash ? "shadow-[0_0_40px_rgba(234,179,8,0.55)] ring-2 ring-gold/50" : ""
          }`}
          style={{
            borderColor: "rgba(176, 125, 43, 0.4)",
            background: "rgba(176, 125, 43, 0.08)",
          }}
        >
          <IconEarnings size={32} className="text-gold" />
          <p className="text-sm font-bold text-gold">{tChat("bonus_title")}</p>
          <p className="text-xl font-extrabold tabular-nums text-white">{amountStr}</p>
          <p className="text-xs text-white/60">{tChat("bonus_added")}</p>
          <p className="text-[10px] text-white/35">{time}</p>
        </div>
      </div>
    );
  }

  if (kindUpper === "ACTION") {
    const links = Array.isArray(m.metadata?.links)
      ? (m.metadata!.links as { labelKey: string; href: string }[])
      : null;
    return (
      <div
        className={`motion-safe:animate-in motion-safe:fade-in flex justify-center py-1 ${
          showAvatarRow ? "pt-2" : "pt-0.5"
        }`}
      >
        <div className="max-w-[min(92%,420px)] rounded-2xl border border-sky-400/35 bg-sky-500/10 px-4 py-3 text-sm">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-sky-200/80">
            {tChat("keywordPaths")}
          </div>
          {links && links.length > 0 ? (
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-bold text-gold hover:bg-gold/25"
                >
                  {tKw(l.labelKey as "deals")}
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-1 whitespace-pre-wrap break-words text-white/80">{m.body}</div>
          )}
          <div className="mt-1.5 text-end text-[10px] text-white/35">{time}</div>
        </div>
      </div>
    );
  }

  if (kindUpper === "WARNING") {
    const tone = bubbleTone(kindUpper);
    return (
      <div
        className={`motion-safe:animate-in motion-safe:fade-in flex justify-center py-1 ${
          showAvatarRow ? "pt-2" : "pt-0.5"
        }`}
      >
        <div
          className={`max-w-[min(92%,420px)] rounded-2xl border px-4 py-2.5 text-sm ${tone}`}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
            {kindLabel(kindUpper)}
          </div>
          <div className="mt-1 whitespace-pre-wrap break-words leading-relaxed">{m.body}</div>
          <div className="mt-1.5 text-end text-[10px] text-white/35">{time}</div>
        </div>
      </div>
    );
  }

  const toneExtra = textToneClass(m.metadata);
  const archived = Boolean(m.archivedSession);

  return (
    <div
      className={`flex w-full py-0.5 ${layout.row} ${showAvatarRow ? "pt-2" : "pt-0.5"} ${
        archived ? "opacity-60" : ""
      }`}
    >
      <div className={`flex max-w-[min(82%,400px)] gap-2 ${layout.inner}`}>
        {showAvatarRow ? (
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
              mine
                ? "bg-[#B07D2B]/90 text-white"
                : "bg-white/12 text-white/80 ring-1 ring-white/15"
            }`}
            aria-hidden
          >
            {avatarInitial(label)}
          </div>
        ) : (
          <div className="size-8 shrink-0" aria-hidden />
        )}
        <div className="min-w-0 flex flex-col">
          {showAvatarRow ? (
            <span
              className={`mb-0.5 flex flex-wrap items-center gap-1 px-1 text-[10px] font-semibold text-white/45 ${layout.labelAlign}`}
            >
              <span>{label}</span>
              {senderIsVerified ? (
                <VerifiedBadge label={verifiedLabel} variant="gold" />
              ) : null}
            </span>
          ) : null}
          <div
            className={`px-3.5 py-2 text-sm shadow-md ${
              mine
                ? "rounded-[18px] rounded-ee-[4px] bg-[linear-gradient(135deg,#B07D2B,#E4B84D)] text-black shadow-[0_2px_12px_rgba(176,125,43,0.35)]"
                : `rounded-[18px] rounded-es-[4px] border border-white/10 bg-[#121a2e] text-[var(--growth-text)] backdrop-blur-[8px] ${toneExtra}`
            }`}
          >
            <div className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</div>
            <div
              className={`mt-1 text-[10px] tabular-nums ${
                mine ? "text-black/50" : "text-white/40"
              } ${layout.labelAlign}`}
            >
              {time}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
