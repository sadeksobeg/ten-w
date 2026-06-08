"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { GrowthCommunityChat } from "@/components/growth/chat/GrowthCommunityChat";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { ParticleEffect } from "@/components/growth/ui/ParticleEffect";
import { CreatorBattlesPanel } from "@/components/growth/creators/CreatorBattlesPanel";
import { CreatorChallengePanel } from "@/components/growth/creators/CreatorChallengePanel";
import { CreatorCupPanel } from "@/components/growth/creators/CreatorCupPanel";
import { CreatorKitPanel } from "@/components/growth/creators/CreatorKitPanel";
import { CreatorPulsePanel } from "@/components/growth/creators/CreatorPulsePanel";
import { CreatorStatusBoard } from "@/components/growth/creators/CreatorStatusBoard";
import { CREATOR_ROOM_SLUG } from "@/lib/growth/creator-program";
import type {
  CreatorChallengeView,
  CreatorCupRow,
  CreatorPulseStats,
  CreatorStatusCard,
} from "@/lib/growth/creator-arena";
import { IconStar, IconEvents, IconChat } from "@/components/growth/icons/GrowthIcons";

export type CreatorEventPreview = {
  slug: string;
  title: string;
  status: string;
  startAt: string;
  participantCount: number;
};

type ChatViewer = {
  userId: string;
  email: string;
  name: string | null;
  displayName?: string;
  avatarUrl?: string | null;
  avatarPreset?: string | null;
};

type Props = {
  locale: string;
  hasBadge: boolean;
  isRoomMember: boolean;
  events: CreatorEventPreview[];
  pulse: CreatorPulseStats;
  statusCards: CreatorStatusCard[];
  cupRows: CreatorCupRow[];
  challenge: CreatorChallengeView | null;
  battleCandidates: { userId: string; name: string; levelCode: string; initials: string }[];
  viewer: ChatViewer;
  publicSlug: string | null;
};

type Tab = "lounge" | "kit" | "cup" | "chat";

export function ContentCreatorHub({
  locale,
  hasBadge,
  isRoomMember,
  events,
  pulse,
  statusCards,
  cupRows,
  challenge,
  battleCandidates,
  viewer,
  publicSlug,
}: Props) {
  const t = useTranslations("Growth.creators");
  const [glow, setGlow] = useState(true);
  const [tab, setTab] = useState<Tab>("lounge");

  const tabs: { id: Tab; label: string }[] = [
    { id: "lounge", label: t("tabLounge") },
    { id: "kit", label: t("tabKit") },
    { id: "cup", label: t("tabCup") },
    { id: "chat", label: t("tabChat") },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(228,184,77,0.35), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(220,38,38,0.2), transparent 50%), linear-gradient(165deg, #0a0612 0%, #12081f 40%, #1a0a0a 100%)",
        }}
        aria-hidden
      />
      <ParticleEffect className="pointer-events-none absolute inset-0 opacity-30 sm:opacity-40" />
      {glow ? (
        <div
          className="pointer-events-none absolute -top-24 start-1/2 h-48 w-[120%] -translate-x-1/2 bg-gradient-to-b from-gold/30 to-transparent blur-3xl motion-safe:animate-pulse motion-reduce:animate-none"
          aria-hidden
        />
      ) : null}

      <div className="relative z-10 space-y-6 px-3 py-8 sm:space-y-8 sm:px-8 sm:py-14">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex justify-center">
            {hasBadge ? (
              <BadgeIcon badgeKey="content_creator" earned size="xl" showGlow animate />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-2xl border border-gold/35 bg-gold/10 text-gold sm:size-20">
                <IconStar size={32} />
              </div>
            )}
          </div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-gold/80 sm:text-xs sm:tracking-[0.35em]">
            {t("eyebrow")}
          </p>
          <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:mt-4 sm:text-base">
            {t("subtitle")}
          </p>
          {!hasBadge && isRoomMember ? (
            <p className="mx-auto mt-3 max-w-md rounded-xl border border-gold/25 bg-gold/10 px-3 py-2 text-[11px] text-gold/95 sm:text-xs">
              {t("adminGrantedAccess")}
            </p>
          ) : null}
          <Link
            href="/creators/studio"
            className="mt-4 inline-flex min-h-10 items-center text-xs font-semibold text-gold underline-offset-4 hover:underline"
          >
            {t("studioLink")}
          </Link>
        </header>

        <nav
          className="creator-arena-tabs sticky top-0 z-20 -mx-3 border-b border-white/10 bg-[#0a0612]/85 px-3 py-2 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none"
          aria-label={t("tabNavAria")}
        >
          <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`min-h-11 shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition sm:px-5 ${
                  tab === item.id
                    ? "bg-gold text-black shadow-[0_0_20px_rgba(228,184,77,0.35)]"
                    : "border border-white/15 text-white/70 hover:border-gold/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {tab === "lounge" ? (
          <div className="mx-auto grid max-w-5xl gap-3 sm:gap-4 lg:grid-cols-2">
            <CreatorPulsePanel pulse={pulse} />
            {challenge ? <CreatorChallengePanel challenge={challenge} /> : null}
            <div className="lg:col-span-2">
              <CreatorStatusBoard cards={statusCards} myUserId={viewer.userId} />
            </div>
            <section className="lg:col-span-2">
              <h2 className="mb-3 text-center font-[family-name:var(--font-cairo)] text-lg font-extrabold text-gold sm:mb-4 sm:text-xl">
                {t("eventsTitle")}
              </h2>
              {events.length === 0 ? (
                <p className="text-center text-sm text-white/50">{t("eventsEmpty")}</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {events.map((ev) => (
                    <li key={ev.slug}>
                      <Link
                        href={`/growth/events/${ev.slug}`}
                        className="block min-h-11 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-gold/40 hover:bg-gold/5"
                      >
                        <p className="font-bold text-white">{ev.title}</p>
                        <p className="mt-1 text-[11px] text-white/50">
                          {t("eventMeta", { status: ev.status, count: ev.participantCount })}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}

        {tab === "kit" ? (
          <div className="mx-auto max-w-3xl">
            <CreatorKitPanel publicSlug={publicSlug} />
          </div>
        ) : null}

        {tab === "cup" ? (
          <div className="mx-auto grid max-w-4xl gap-3 sm:gap-4 lg:grid-cols-2">
            <CreatorCupPanel rows={cupRows} myUserId={viewer.userId} />
            <CreatorBattlesPanel candidates={battleCandidates} />
          </div>
        ) : null}

        {tab === "chat" ? (
          <GlassCard className="mx-auto max-w-4xl overflow-hidden border border-gold/25 bg-black/40 p-0">
            {isRoomMember ? (
              <div className="h-[min(58dvh,520px)] sm:h-[min(70vh,560px)]">
                <GrowthCommunityChat
                  locale={locale}
                  viewerUserId={viewer.userId}
                  viewerEmail={viewer.email}
                  viewerName={viewer.name}
                  viewerDisplayName={viewer.displayName}
                  viewerAvatarUrl={viewer.avatarUrl}
                  viewerAvatarPreset={viewer.avatarPreset}
                  roomSlug={CREATOR_ROOM_SLUG}
                  hintKey="creatorChatHint"
                  placeholderKey="creatorChatPlaceholder"
                />
              </div>
            ) : (
              <div className="p-6 text-center sm:p-8">
                <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                  {t("ctaPending")}
                </p>
              </div>
            )}
          </GlassCard>
        ) : null}

        <div className="mx-auto hidden max-w-4xl gap-4 sm:grid sm:grid-cols-3">
          {(["pillar1", "pillar2", "pillar3"] as const).map((key, i) => (
            <GlassCard
              key={key}
              className="group border border-white/10 bg-white/[0.04] p-5 transition hover:border-gold/35 hover:bg-gold/5"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold/30 to-rose-500/20 text-gold">
                {i === 0 ? <IconStar size={22} /> : i === 1 ? <IconEvents size={22} /> : <IconChat size={22} />}
              </div>
              <h2 className="font-bold text-white">{t(`${key}Title`)}</h2>
              <p className="mt-2 text-xs leading-relaxed text-white/60">{t(`${key}Body`)}</p>
            </GlassCard>
          ))}
        </div>

        <p className="text-center text-[10px] text-white/35">{t("footer")}</p>
      </div>

      <button
        type="button"
        className="sr-only"
        onClick={() => setGlow((v) => !v)}
        aria-label="toggle effects"
      />
    </div>
  );
}
