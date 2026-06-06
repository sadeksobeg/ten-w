"use client";

import { useState } from "react";
import { INVITE_TIERS, type InviteTier } from "@/lib/invite/generate";
import {
  INVITE_MESSAGE_AFTER_MEETING,
  INVITE_MESSAGE_TEMPLATES,
  INVITE_TIER_LABELS,
} from "@/lib/invite/message-templates";

export type InviteFormCard = {
  name: string;
  handle: string;
  tier: string;
  scope: string;
  message: string;
};

type Props = {
  card?: InviteFormCard;
  fieldClass: string;
};

function tierLabel(tier: string) {
  return INVITE_TIER_LABELS[tier as InviteTier] ?? tier;
}

export function InviteAdminFormFields({ card, fieldClass }: Props) {
  const initialTier = (card?.tier as InviteTier) ?? "CONTENT CREATOR";
  const [tier, setTier] = useState<InviteTier>(initialTier);
  const [message, setMessage] = useState(
    card?.message ?? INVITE_MESSAGE_TEMPLATES["CONTENT CREATOR"],
  );

  const handle = card?.handle?.replace(/^@/, "") ?? "";

  return (
    <>
      <label className="block">
        <span className="text-xs font-semibold text-white/55">الاسم</span>
        <input name="name" required defaultValue={card?.name} className={fieldClass} placeholder="أحمد الرشيد" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-white/55">المعرّف handle</span>
        <input name="handle" required defaultValue={handle} className={fieldClass} placeholder="ahmed.rashid" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-white/55">نوع الدعوة</span>
        <select name="tier" value={tier} onChange={(e) => setTier(e.target.value as InviteTier)} className={fieldClass}>
          {INVITE_TIERS.map((t) => (
            <option key={t} value={t}>
              {INVITE_TIER_LABELS[t]} — {t}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-white/55">النطاق scope</span>
        <input
          name="scope"
          required
          defaultValue={card?.scope}
          className={fieldClass}
          placeholder="Technology storytelling · Arabic"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-xs font-semibold text-white/55">نص الدعوة (قابل للتعديل)</span>
        <textarea
          name="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${fieldClass} resize-y`}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold text-white/70 hover:border-gold/30"
            onClick={() => setMessage(INVITE_MESSAGE_TEMPLATES[tier])}
          >
            قالب {tierLabel(tier)}
          </button>
          <button
            type="button"
            className="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold text-white/70 hover:border-gold/30"
            onClick={() => setMessage(INVITE_MESSAGE_AFTER_MEETING)}
          >
            بعد اللقاء والاتفاق
          </button>
        </div>
      </label>
    </>
  );
}
