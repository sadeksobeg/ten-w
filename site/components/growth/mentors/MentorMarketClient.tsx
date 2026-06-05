"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  createMentorOfferFormAction,
  requestMentorshipAction,
  respondMentorshipAction,
} from "@/lib/growth/engagement-actions";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { GlassCard } from "@/components/growth/ui/GlassCard";

export type MentorOfferView = {
  id: string;
  mentorId: string;
  mentorName: string;
  specialty: string;
  duration: number;
  slotsLeft: number;
};

export type MentorshipRow = {
  id: string;
  status: string;
  mentorName: string;
  menteeName: string;
  isMentor: boolean;
};

type Props = {
  offers: MentorOfferView[];
  myOffer: boolean;
  canOffer: boolean;
  sessions: MentorshipRow[];
  myUserId: string;
};

export function MentorMarketClient({ offers, myOffer, canOffer, sessions, myUserId }: Props) {
  const t = useTranslations("Growth.mentors");
  const [pending, start] = useTransition();

  return (
    <div className="growth-section-gap">
      {canOffer && !myOffer ? (
        <GlassCard className="p-5">
          <h3 className="font-bold text-gold">{t("offer")}</h3>
          <form action={createMentorOfferFormAction} className="mt-4 space-y-3">
            <input
              name="specialtyAr"
              required
              placeholder={t("specialtyAr")}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
            <input
              name="specialtyEn"
              required
              placeholder={t("specialtyEn")}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
            <GoldButton type="submit">{t("publishOffer")}</GoldButton>
          </form>
        </GlassCard>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gold">{t("available")}</h3>
        {offers.length === 0 ? (
          <p className="text-sm text-white/55">{t("noOffers")}</p>
        ) : (
          offers.map((o) => (
            <GlassCard key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-bold text-white">{o.mentorName}</p>
                <p className="text-sm text-white/65">{o.specialty}</p>
                <p className="text-xs text-white/45">
                  {o.duration} {t("minutes")} · {o.slotsLeft} {t("slots")}
                </p>
              </div>
              {o.mentorId !== myUserId ? (
                <GoldButton
                  type="button"
                  disabled={pending || o.slotsLeft <= 0}
                  onClick={() => start(() => void requestMentorshipAction(o.id))}
                >
                  {t("request")}
                </GoldButton>
              ) : null}
            </GlassCard>
          ))
        )}
      </section>

      {sessions.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-gold">{t("mySessions")}</h3>
          {sessions.map((s) => (
            <GlassCard key={s.id} className="p-4 text-sm">
              <p>
                {s.isMentor ? s.menteeName : s.mentorName} — {s.status}
              </p>
              {s.isMentor && s.status === "REQUESTED" ? (
                <div className="mt-2 flex gap-2">
                  <GoldButton
                    type="button"
                    disabled={pending}
                    onClick={() => start(() => void respondMentorshipAction(s.id, true))}
                  >
                    {t("accept")}
                  </GoldButton>
                  <GoldButton
                    type="button"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => start(() => void respondMentorshipAction(s.id, false))}
                  >
                    {t("decline")}
                  </GoldButton>
                </div>
              ) : null}
            </GlassCard>
          ))}
        </section>
      ) : null}
    </div>
  );
}
