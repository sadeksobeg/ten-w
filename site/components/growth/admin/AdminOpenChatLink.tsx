"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { IconChat } from "@/components/growth/icons/GrowthIcons";

type Props = {
  partnerUserId: string;
  className?: string;
};

export function AdminOpenChatLink({ partnerUserId, className = "" }: Props) {
  const t = useTranslations("Growth.admin.partners");

  return (
    <Link
      href={`/growth/admin/chat?partnerUserId=${encodeURIComponent(partnerUserId)}`}
      className={`inline-flex min-h-[var(--growth-touch-min)] items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-bold text-gold transition hover:border-gold/50 hover:bg-gold/15 focus-visible:ring-2 focus-visible:ring-gold/40 ${className}`}
    >
      <IconChat size={14} aria-hidden />
      {t("openChat")}
    </Link>
  );
}
