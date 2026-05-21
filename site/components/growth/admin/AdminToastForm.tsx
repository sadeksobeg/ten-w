"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";

type ActionResult = { ok: true } | { ok: false; error: string };

type Props = {
  action: (prev: unknown, formData: FormData) => Promise<ActionResult>;
  children: ReactNode;
  className?: string;
  successKey?: string;
};

export function AdminToastForm({ action, children, className, successKey }: Props) {
  const t = useTranslations("Growth.admin");
  const { showToast } = useToast();
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      showToast({
        type: "success",
        title: successKey ? t(successKey as "toastDealClosed") : t("toastSaved"),
      });
    } else {
      showToast({ type: "error", title: state.error });
    }
  }, [state, showToast, t, successKey]);

  return (
    <form action={formAction} className={className} data-pending={pending ? "" : undefined}>
      {children}
    </form>
  );
}
