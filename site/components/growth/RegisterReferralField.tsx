"use client";

import { useSearchParams } from "next/navigation";

type Props = { label: string; readOnly?: boolean };

export function RegisterReferralField({ label, readOnly }: Props) {
  const sp = useSearchParams();
  const ref = sp.get("ref") ?? "";

  return (
    <label className="block">
      <span className="text-xs text-white/55">{label}</span>
      <input
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold/40 disabled:opacity-60"
        name="referralCode"
        defaultValue={ref}
        readOnly={readOnly}
        disabled={readOnly}
      />
    </label>
  );
}
