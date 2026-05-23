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
  const t = useTranslations("Growth");
  const { showToast } = useToast();
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      showToast({
        type: "success",
        title: successKey ? t(`admin.${successKey}` as "admin.toastSaved") : t("admin.toastSaved"),
      });
    } else {
      const key = `formErrors.${state.error}` as "formErrors.invalid_input";
      showToast({
        type: "error",
        title: t.has(key) ? t(key) : state.error,
      });
    }
  }, [state, showToast, t, successKey]);

  return (
    <form action={formAction} className={className} data-pending={pending ? "" : undefined}>
      {children}
    </form>
  );
}
