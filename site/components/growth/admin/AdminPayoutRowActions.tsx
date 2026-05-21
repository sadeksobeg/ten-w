"use client";

import { PayoutStatus } from "@prisma/client";
import { useTranslations } from "next-intl";
import {
  approvePayoutAdminFormAction,
  markPayoutPaidAdminFormAction,
  rejectPayoutAdminFormAction,
} from "@/lib/growth/actions";
import { AdminToastForm } from "@/components/growth/admin/AdminToastForm";

type Props = { payoutId: string; status: PayoutStatus };

export function AdminPayoutRowActions({ payoutId, status }: Props) {
  const t = useTranslations("Growth.admin.payoutsPage");

  if (status === PayoutStatus.PENDING) {
    return (
      <>
        <AdminToastForm action={approvePayoutAdminFormAction} successKey="toastPayoutUpdated">
          <input type="hidden" name="payoutId" value={payoutId} />
          <button
            type="submit"
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200"
          >
            {t("approve")}
          </button>
        </AdminToastForm>
        <AdminToastForm action={rejectPayoutAdminFormAction} successKey="toastPayoutUpdated">
          <input type="hidden" name="payoutId" value={payoutId} />
          <button
            type="submit"
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200"
          >
            {t("reject")}
          </button>
        </AdminToastForm>
      </>
    );
  }

  if (status === PayoutStatus.APPROVED) {
    return (
      <AdminToastForm action={markPayoutPaidAdminFormAction} successKey="toastPayoutUpdated">
        <input type="hidden" name="payoutId" value={payoutId} />
        <button
          type="submit"
          className="rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold"
        >
          {t("markPaid")}
        </button>
      </AdminToastForm>
    );
  }

  return null;
}
