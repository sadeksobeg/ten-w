"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { ParticleEffect } from "@/components/growth/ui/ParticleEffect";
import { CREATOR_ROOM_SLUG } from "@/lib/growth/creator-program";
import { IconStar, IconEvents, IconChat } from "@/components/growth/icons/GrowthIcons";

export type CreatorEventPreview = {
  slug: string;
  title: string;
  status: string;
  startAt: string;
  participantCount: number;
};

type Props = {
  locale: string;
  isRoomMember: boolean;
  events: CreatorEventPreview[];
};

export function ContentCreatorHub({ locale: _locale, isRoomMember, events }: Props) {
  const t = useTranslations("Growth.creators");
  const [glow, setGlow] = useState(true);

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(228,184,77,0.35), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(220,38,38,0.2), transparent 50%), linear-gradient(165deg, #0a0612 0%, #12081f 40%, #1a0a0a 100%)",
        }}
        aria-hidden
      />
      <ParticleEffect className="pointer-events-none absolute inset-0 opacity-40" />
      {glow ? (
        <div
          className="pointer-events-none absolute -top-24 start-1/2 h-48 w-[120%] -translate-x-1/2 bg-gradient-to-b from-gold/30 to-transparent blur-3xl motion-safe:animate-pulse motion-reduce:animate-none"
          aria-hidden
        />
      ) : null}

      <div className="relative z-10 space-y-10 px-4 py-10 sm:px-8 sm:py-14">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex justify-center">
            <BadgeIcon badgeKey="content_creator" earned size="xl" showGlow animate />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-gold/80">
            {t("eyebrow")}
          </p>
          <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {t("subtitle")}
          </p>
        </header>

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {(["pillar1", "pillar2", "pillar3"] as const).map((key, i) => (
            <GlassCard
              key={key}
              className="group border border-white/10 bg-white/[0.04] p-5 transition hover:border-gold/35 hover:bg-gold/5"
            >
              <div
                className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold/30 to-rose-500/20 text-gold"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                {i === 0 ? <IconStar size={22} /> : i === 1 ? <IconEvents size={22} /> : <IconChat size={22} />}
              </div>
              <h2 className="font-bold text-white">{t(`${key}Title`)}</h2>
              <p className="mt-2 text-xs leading-relaxed text-white/60">{t(`${key}Body`)}</p>
            </GlassCard>
          ))}
        </div>

        <section className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center font-[family-name:var(--font-cairo)] text-xl font-extrabold text-gold">
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
                    className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-gold/40 hover:bg-gold/5"
                  >
                    <p className="font-bold text-white">{ev.title}</p>
                    <p className="mt-1 text-[11px] text-white/50">
                      {t("eventMeta", {
                        status: ev.status,
                        count: ev.participantCount,
                      })}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <GlassCard className="mx-auto max-w-2xl border border-gold/25 bg-gradient-to-br from-gold/10 via-transparent to-rose-500/10 p-6 text-center sm:p-8">
          <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white sm:text-xl">
            {t("circleTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/65">{t("circleBody")}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isRoomMember ? (
              <Link
                href={`/growth/chat?room=${CREATOR_ROOM_SLUG}`}
                className="inline-flex rounded-[10px] bg-[linear-gradient(135deg,#B07D2B,#E4B84D)] px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
              >
                {t("ctaChat")}
              </Link>
            ) : (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                {t("ctaPending")}
              </p>
            )}
            <Link
              href="/growth/events"
              className="text-xs font-semibold text-gold/90 underline-offset-4 hover:underline"
            >
              {t("ctaEvents")}
            </Link>
          </div>
        </GlassCard>

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
