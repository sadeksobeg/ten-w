import type { ComponentType } from "react";
import {
  IconBadge,
  IconChat,
  IconDeals,
  IconEarnings,
  IconEvent,
  IconInfo,
  IconLevel,
  IconMission,
  IconNotifications,
  IconXp,
  type GrowthIconProps,
} from "@/components/growth/icons/GrowthIcons";

export type NotificationStyle = {
  bg: string;
  color: string;
  Icon: ComponentType<GrowthIconProps>;
};

export const NOTIFICATION_STYLES: Record<string, NotificationStyle> = {
  DEAL_CLOSED: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", Icon: IconDeals },
  BADGE_EARNED: { bg: "rgba(139,92,246,0.15)", color: "#a78bfa", Icon: IconBadge },
  LEVEL_UP: { bg: "rgba(176,125,43,0.2)", color: "#E4B84D", Icon: IconLevel },
  XP_BOOST: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa", Icon: IconXp },
  PAYOUT_UPDATE: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", Icon: IconEarnings },
  EVENT_INVITE: { bg: "rgba(99,102,241,0.15)", color: "#818cf8", Icon: IconEvent },
  EVENT_REMINDER: { bg: "rgba(99,102,241,0.15)", color: "#818cf8", Icon: IconEvent },
  EVENT_MILESTONE: { bg: "rgba(20,184,166,0.15)", color: "#2dd4bf", Icon: IconMission },
  SYSTEM: { bg: "rgba(107,114,128,0.15)", color: "#9ca3af", Icon: IconInfo },
  ADMIN_MESSAGE: { bg: "rgba(239,68,68,0.15)", color: "#f87171", Icon: IconChat },
};

const FALLBACK: NotificationStyle = {
  bg: "rgba(107,114,128,0.15)",
  color: "#9ca3af",
  Icon: IconNotifications,
};

export function getNotificationStyle(type: string): NotificationStyle {
  return NOTIFICATION_STYLES[type] ?? FALLBACK;
}

export function NotificationTypeIcon({
  type,
  size = 18,
  circleSize = 36,
}: {
  type: string;
  size?: number;
  circleSize?: number;
}) {
  const style = getNotificationStyle(type);
  const Icon = style.Icon;
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: circleSize,
        height: circleSize,
        background: style.bg,
        color: style.color,
      }}
    >
      <Icon size={size} />
    </span>
  );
}
