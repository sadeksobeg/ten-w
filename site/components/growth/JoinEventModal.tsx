"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { joinEventAction } from "@/lib/growth/actions";

type Props = {
  eventId: string;
  rulesHtml: string;
};

export function JoinEventModal({ eventId, rulesHtml }: Props) {
  const t = useTranslations("Growth.events");
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(joinEventAction, undefined);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl bg-gradient-to-r from-gold/35 via-gold to-gold-bright px-6 py-3 text-sm font-extrabold text-bg"
      >
        {t("joinEvent")}
      </button>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/12 bg-[#0a1020] p-6">
            <h3 className="text-lg font-bold">{t("rulesTitle")}</h3>
            <div
              className="mt-4 text-sm text-white/75"
              dangerouslySetInnerHTML={{ __html: rulesHtml }}
            />
            <form action={action} className="mt-6 space-y-4">
              <input type="hidden" name="eventId" value={eventId} />
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="acceptRules" required className="mt-1" />
                <span>{t("acceptRules")}</span>
              </label>
              {state && typeof state === "object" && "ok" in state && state.ok === false ? (
                <p className="text-sm text-red-300">{String((state as { error?: string }).error)}</p>
              ) : null}
              {state && typeof state === "object" && "ok" in state && state.ok === true ? (
                <p className="text-sm text-emerald-300">{t("joined")}</p>
              ) : null}
              <div className="flex gap-2">
                <button type="submit" className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-bg">
                  {t("confirmJoin")}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
