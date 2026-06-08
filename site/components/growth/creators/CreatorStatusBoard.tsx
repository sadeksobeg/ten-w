"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { updateCreatorStatusAction } from "@/lib/growth/creator-arena-actions";
import type { CreatorStatusCard } from "@/lib/growth/creator-arena";

const STATUSES = ["INVITED", "JOINED", "FILMING", "SUBMITTED", "FEATURED"] as const;

type Props = {
  cards: CreatorStatusCard[];
  myUserId: string;
};

export function CreatorStatusBoard({ cards, myUserId }: Props) {
  const t = useTranslations("Growth.creators");

  return (
    <GlassCard className="border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
        {t("statusTitle")}
      </h2>
      <p className="mt-1 text-xs text-white/55">{t("statusSubtitle")}</p>

      <ul className="mt-4 space-y-2">
        {cards.map((card) => (
          <StatusRow key={card.userId} card={card} isMe={card.userId === myUserId} t={t} />
        ))}
      </ul>
    </GlassCard>
  );
}

function StatusRow({
  card,
  isMe,
  t,
}: {
  card: CreatorStatusCard;
  isMe: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const [state, formAction, pending] = useActionState(updateCreatorStatusAction, undefined);

  if (!isMe) {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
        <GrowthAvatar name={card.name} email={card.userId} avatarUrl={card.avatarUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{card.name}</p>
        </div>
        <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/60">
          {t(`status.${card.status}`)}
        </span>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-gold/30 bg-gold/5 px-3 py-3">
      <div className="flex items-center gap-3">
        <GrowthAvatar name={card.name} email={card.userId} avatarUrl={card.avatarUrl} size="sm" />
        <p className="text-sm font-semibold text-white">{t("statusYourCard")}</p>
      </div>
      <form action={formAction} className="mt-3 flex flex-wrap items-center gap-2">
        <input type="hidden" name="userId" value={card.userId} />
        <select
          name="status"
          defaultValue={card.status}
          className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gold/20 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/30"
        >
          {pending ? "…" : t("statusUpdate")}
        </button>
        {state && !state.ok ? (
          <span className="text-[10px] text-rose-300">{t("statusError")}</span>
        ) : null}
      </form>
    </li>
  );
}
