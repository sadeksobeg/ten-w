"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updateShowcasedBadgesAction } from "@/lib/growth/actions";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";

type Badge = { key: string; name: string; earned: boolean };

type Props = {
  earnedBadges: Badge[];
  showcasedKeys: string[];
};

export function BadgeShowcase({ earnedBadges, showcasedKeys }: Props) {
  const t = useTranslations("Growth.badges.showcase");
  const [state, formAction, pending] = useActionState(updateShowcasedBadgesAction, null);
  const selected = new Set(showcasedKeys);

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">{t("hint")}</p>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="badgeKeys" value={[...selected].join(",")} id="showcase-keys" />
        <div className="flex flex-wrap gap-3">
          {earnedBadges.map((b) => {
            const on = selected.has(b.key);
            return (
              <button
                key={b.key}
                type="button"
                disabled={pending}
                onClick={() => {
                  if (on) selected.delete(b.key);
                  else if (selected.size < 5) selected.add(b.key);
                  const el = document.getElementById("showcase-keys") as HTMLInputElement | null;
                  if (el) el.value = [...selected].join(",");
                }}
                className={`rounded-2xl border p-2 transition ${
                  on ? "border-gold/50 bg-gold/10" : "border-white/10 bg-white/[0.03]"
                }`}
                title={b.name}
              >
                <BadgeIcon badgeKey={b.key} earned size="md" />
              </button>
            );
          })}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white"
        >
          {t("save")}
        </button>
        {state?.ok ? <p className="text-xs text-gold">{t("saved")}</p> : null}
      </form>
    </div>
  );
}
