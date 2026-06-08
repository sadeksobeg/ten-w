"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { adminReviewApplicationAction } from "@/lib/growth/creator-arena-actions";

export type CreatorApplicationRow = {
  id: string;
  name: string;
  email: string;
  mainPlatformUrl: string;
  platform: string | null;
  followersRange: string;
  status: string;
  createdAt: string;
};

type Props = { applications: CreatorApplicationRow[] };

export function AdminCreatorApplications({ applications: initial }: Props) {
  const t = useTranslations("Growth.creators.admin.applications");
  const [, action, pending] = useActionState(adminReviewApplicationAction, undefined);

  if (initial.length === 0) {
    return <GlassCard className="p-8 text-center text-sm text-white/50">{t("empty")}</GlassCard>;
  }

  return (
    <ul className="space-y-3">
      {initial.map((app) => (
        <li key={app.id}>
          <GlassCard className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold text-white">{app.name}</p>
                <p className="text-xs text-white/55">{app.email}</p>
                <a href={app.mainPlatformUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs text-gold underline">
                  {app.mainPlatformUrl}
                </a>
                <p className="mt-1 text-[10px] text-white/40">{app.followersRange} · {app.status}</p>
              </div>
              {app.status === "PENDING" ? (
                <div className="flex gap-2">
                  <form action={action}>
                    <input type="hidden" name="id" value={app.id} />
                    <input type="hidden" name="decision" value="accept" />
                    <GoldButton type="submit" disabled={pending} className="text-xs">{t("accept")}</GoldButton>
                  </form>
                  <form action={action}>
                    <input type="hidden" name="id" value={app.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <button type="submit" disabled={pending} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-white/70">{t("reject")}</button>
                  </form>
                </div>
              ) : null}
            </div>
          </GlassCard>
        </li>
      ))}
    </ul>
  );
}
