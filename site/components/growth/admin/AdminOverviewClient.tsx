"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import {
  IconBadge,
  IconEvent,
  IconNotifications,
  IconPlus,
} from "@/components/growth/icons/GrowthIcons";
import type { ReactNode } from "react";

export function AdminOverviewClient() {
  const t = useTranslations("Growth.admin.overview");

  const actions: { href: string; label: string; icon: ReactNode }[] = [
    { href: "/growth/admin/partners", label: t("actionCreatePartner"), icon: <IconPlus size={16} /> },
    { href: "/growth/admin/events", label: t("actionNewEvent"), icon: <IconEvent size={16} /> },
    {
      href: "/growth/admin/notifications",
      label: t("actionBroadcast"),
      icon: <IconNotifications size={16} />,
    },
    { href: "/growth/admin/badges", label: t("actionGrantBadge"), icon: <IconBadge size={16} /> },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <Link key={a.href} href={a.href}>
          <GoldButton variant="ghost" className="inline-flex items-center gap-2">
            <span aria-hidden className="inline-flex text-gold">
              {a.icon}
            </span>
            {a.label}
          </GoldButton>
        </Link>
      ))}
    </div>
  );
}
