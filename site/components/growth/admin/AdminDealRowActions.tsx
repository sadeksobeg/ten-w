"use client";

import { useTranslations } from "next-intl";
import {
  closeDealAdminFormAction,
  markDealLostAdminFormAction,
} from "@/lib/growth/actions";
import { AdminToastForm } from "@/components/growth/admin/AdminToastForm";

type Props = { dealId: string };

export function AdminDealRowActions({ dealId }: Props) {
  const t = useTranslations("Growth.admin.dealsPage");

  return (
    <>
      <AdminToastForm action={closeDealAdminFormAction} successKey="toastDealClosed">
        <input type="hidden" name="dealId" value={dealId} />
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-gold/30 via-gold to-gold-bright px-4 py-2 text-xs font-extrabold text-bg"
        >
          {t("close")}
        </button>
      </AdminToastForm>
      <AdminToastForm action={markDealLostAdminFormAction} successKey="toastDealLost">
        <input type="hidden" name="dealId" value={dealId} />
        <button
          type="submit"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200"
        >
          {t("markLost")}
        </button>
      </AdminToastForm>
    </>
  );
}
