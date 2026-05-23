"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { requestDealCloseAction } from "@/lib/growth/actions";

export function RequestDealCloseButton({ dealId }: { dealId: string }) {
  const t = useTranslations("Growth.deals");
  const [state, formAction, pending] = useActionState(requestDealCloseAction, null);

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="dealId" value={dealId} />
      <button
        type="submit"
        disabled={pending || state?.ok === true}
        className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-100 disabled:opacity-50"
      >
        {state?.ok ? t("closeRequestSent") : t("requestClose")}
      </button>
    </form>
  );
}
