"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { appreciationAction } from "@/lib/growth/actions";
import { useToast } from "@/hooks/useToast";

type Props = {
  slug: string;
  partnerName: string;
};

export function ProfileAppreciationButton({ slug, partnerName }: Props) {
  const t = useTranslations("Growth.publicProfile.appreciation");
  const { showToast } = useToast();
  const [state, formAction, pending] = useActionState(appreciationAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      showToast({ type: "success", title: t("sent", { name: partnerName }) });
    } else if (state.error === "rate_limited") {
      showToast({ type: "error", title: t("rateLimited") });
    }
  }, [state, showToast, t, partnerName]);

  return (
    <form action={formAction}>
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold hover:border-gold/50 disabled:opacity-50"
      >
        {pending ? t("sending") : t("cta")}
      </button>
    </form>
  );
}
