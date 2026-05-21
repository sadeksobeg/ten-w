"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { GoldButton } from "@/components/growth/ui/GoldButton";

export function AdminOverviewClient() {
  const t = useTranslations("Growth.admin.overview");

  const actions = [
    { href: "/growth/admin/partners", label: t("actionCreatePartner"), icon: "+" },
    { href: "/growth/admin/events", label: t("actionNewEvent"), icon: "📅" },
    { href: "/growth/admin/notifications", label: t("actionBroadcast"), icon: "📢" },
    { href: "/growth/admin/badges", label: t("actionGrantBadge"), icon: "🏆" },
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <Link key={a.href} href={a.href}>
          <GoldButton variant="ghost" className="inline-flex items-center gap-2">
            <span aria-hidden>{a.icon}</span>
            {a.label}
          </GoldButton>
        </Link>
      ))}
    </div>
  );
}
