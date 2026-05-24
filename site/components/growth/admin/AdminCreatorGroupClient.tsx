"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { useToast } from "@/hooks/useToast";
import {
  adminAddCreatorRoomMemberAction,
  adminRemoveCreatorRoomMemberAction,
} from "@/lib/growth/actions";

export type CreatorAdminPartner = {
  userId: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  hasBadge: boolean;
  inRoom: boolean;
  badgeGrantedAt: string | null;
};

type Props = {
  partners: CreatorAdminPartner[];
};

export function AdminCreatorGroupClient({ partners: initial }: Props) {
  const t = useTranslations("Growth.admin.creatorsPage");
  const locale = useLocale();
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

  const badgeHolders = filtered.filter((p) => p.hasBadge);
  const roomMembers = filtered.filter((p) => p.inRoom);

  async function toggleRoom(userId: string, add: boolean) {
    setPendingId(userId);
    const fd = new FormData();
    fd.set("userId", userId);
    const res = add
      ? await adminAddCreatorRoomMemberAction(fd)
      : await adminRemoveCreatorRoomMemberAction(fd);
    setPendingId(null);
    if (res.ok) {
      setPartners((prev) =>
        prev.map((p) => (p.userId === userId ? { ...p, inRoom: add } : p)),
      );
      showToast({
        type: "success",
        title: add ? t("toastAdded") : t("toastRemoved"),
      });
    } else {
      showToast({ type: "error", title: t("toastError") });
    }
  }

  return (
    <div className="space-y-8">
      <GlassCard className="relative overflow-hidden border border-gold/20 bg-gradient-to-br from-gold/10 via-transparent to-rose-500/10 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -top-20 end-0 h-40 w-40 rounded-full bg-gold/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <BadgeIcon badgeKey="content_creator" earned size="md" showGlow />
              <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-white">
                {t("title")}
              </h1>
            </div>
            <p className="max-w-xl text-sm text-white/65">{t("subtitle")}</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-gold">{badgeHolders.length}</p>
              <p className="text-[10px] text-white/50">{t("statBadge")}</p>
            </div>
            <div className="w-px bg-white/15" aria-hidden />
            <div>
              <p className="text-2xl font-black text-gold">{roomMembers.length}</p>
              <p className="text-[10px] text-white/50">{t("statRoom")}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-gold/40 focus:outline-none"
        />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold text-gold">{t("roomTitle")}</h2>
        <p className="mb-4 text-xs text-white/50">{t("roomHint")}</p>
        {roomMembers.length === 0 ? (
          <p className="text-sm text-white/45">{t("emptyRoom")}</p>
        ) : (
          <ul className="space-y-2">
            {roomMembers.map((p) => (
              <PartnerRow
                key={p.userId}
                partner={p}
                locale={locale}
                pending={pendingId === p.userId}
                onToggle={() => void toggleRoom(p.userId, false)}
                actionLabel={t("removeFromRoom")}
                variant="room"
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-white">{t("badgeTitle")}</h2>
        <p className="mb-4 text-xs text-white/50">{t("badgeHint")}</p>
        {badgeHolders.length === 0 ? (
          <p className="text-sm text-white/45">{t("emptyBadge")}</p>
        ) : (
          <ul className="space-y-2">
            {badgeHolders.map((p) => (
              <PartnerRow
                key={p.userId}
                partner={p}
                locale={locale}
                pending={pendingId === p.userId}
                onToggle={() => void toggleRoom(p.userId, true)}
                actionLabel={p.inRoom ? t("inRoom") : t("addToRoom")}
                variant="badge"
                disabled={p.inRoom}
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-white/80">{t("allPartnersTitle")}</h2>
        <ul className="max-h-[420px] space-y-2 overflow-y-auto">
          {filtered.map((p) => (
            <PartnerRow
              key={`all-${p.userId}`}
              partner={p}
              locale={locale}
              pending={pendingId === p.userId}
              onToggle={() => void toggleRoom(p.userId, true)}
              actionLabel={p.inRoom ? t("inRoom") : t("addToRoom")}
              variant="all"
              disabled={p.inRoom}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

function PartnerRow({
  partner,
  locale: _locale,
  pending,
  onToggle,
  actionLabel,
  variant,
  disabled,
}: {
  partner: CreatorAdminPartner;
  locale: string;
  pending: boolean;
  onToggle: () => void;
  actionLabel: string;
  variant: "room" | "badge" | "all";
  disabled?: boolean;
}) {
  return (
    <li
      className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 ${
        variant === "room"
          ? "border-gold/30 bg-gold/5"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <GrowthAvatar
        name={partner.name}
        email={partner.email}
        avatarUrl={partner.avatarUrl}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {partner.name ?? partner.email}
        </p>
        <p className="truncate text-[10px] text-white/45">{partner.email}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {partner.hasBadge ? (
          <BadgeIcon badgeKey="content_creator" earned chip size="xs" name="" />
        ) : null}
        {variant !== "room" ? (
          <GoldButton
            type="button"
            variant={disabled ? "ghost" : "primary"}
            disabled={disabled || pending}
            onClick={onToggle}
            className="!px-3 !py-1.5 text-xs"
          >
            {pending ? "…" : actionLabel}
          </GoldButton>
        ) : (
          <GoldButton
            type="button"
            variant="danger"
            disabled={pending}
            onClick={onToggle}
            className="!px-3 !py-1.5 text-xs"
          >
            {pending ? "…" : actionLabel}
          </GoldButton>
        )}
      </div>
    </li>
  );
}
