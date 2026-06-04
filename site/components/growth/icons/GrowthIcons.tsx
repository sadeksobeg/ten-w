import type { ComponentType, ReactNode, SVGProps } from "react";

export type GrowthIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

const strokeDefaults = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function GrowthIconBase({
  size = 20,
  className = "",
  children,
  ...rest
}: GrowthIconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`.trim()}
      aria-hidden
      {...strokeDefaults}
      {...rest}
    >
      {children}
    </svg>
  );
}

// Navigation
export function IconDashboard(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </GrowthIconBase>
  );
}

export function IconDeals(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </GrowthIconBase>
  );
}

export function IconEarnings(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 10v8c0 3.87 3.13 7 7 7s7-3.13 7-7v-8" />
      <path d="M12 14v3" />
    </GrowthIconBase>
  );
}

export function IconNetwork(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M8 7.5l3.5 8M16 7.5l-3.5 8M8 6h8" />
    </GrowthIconBase>
  );
}

export function IconEvents(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="M12 13l1.5 1.5L16 11" />
    </GrowthIconBase>
  );
}

export function IconChat(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M5 6h14a2 2 0 012 2v7a2 2 0 01-2 2H11l-4 4V8a2 2 0 012-2z" />
      <circle cx="18" cy="10" r="1" fill="currentColor" stroke="none" />
    </GrowthIconBase>
  );
}

export function IconNotifications(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M12 3a5 5 0 00-5 5v2.5l-1.5 2h13L17 10.5V8a5 5 0 00-5-5z" />
      <path d="M10 19.5a2 2 0 004 0" />
    </GrowthIconBase>
  );
}

export function IconSettings(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
      <path d="M19.4 13.5a7.2 7.2 0 00.1-3l2-1.2-2-3.5-2.3 1a7.4 7.4 0 00-2.6-1.5L14 2h-4l-.6 3.3a7.4 7.4 0 00-2.6 1.5l-2.3-1-2 3.5 2 1.2a7.2 7.2 0 00.1 3l-2 1.2 2 3.5 2.3-1a7.4 7.4 0 002.6 1.5L10 22h4l.6-3.3a7.4 7.4 0 002.6-1.5l2.3 1 2-3.5-2-1.2z" />
    </GrowthIconBase>
  );
}

export function IconKit(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M4 8h16v12H4z" />
      <path d="M4 8l8-4 8 4" />
      <path d="M12 12v4" />
    </GrowthIconBase>
  );
}

// Actions
export function IconPlus(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8" strokeWidth={2.25} />
    </GrowthIconBase>
  );
}

export function IconSearch(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </GrowthIconBase>
  );
}

export function IconFilter(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M4 5h16M7 12h10M10 19h4" />
    </GrowthIconBase>
  );
}

export function IconShare(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
      <path d="M12 3v12M8 7l4-4 4 4" />
    </GrowthIconBase>
  );
}

export function IconCopy(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <rect x="8" y="8" width="12" height="14" rx="2" />
      <path d="M4 16V6a2 2 0 012-2h10" />
    </GrowthIconBase>
  );
}

export function IconDownload(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M12 3v12M8 11l4 4 4-4" />
      <path d="M4 19h16" />
    </GrowthIconBase>
  );
}

export function IconEdit(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M4 20h4l10.5-10.5a2 2 0 000-2.83L14.33 5.5a2 2 0 00-2.83 0L4 17v3z" />
    </GrowthIconBase>
  );
}

export function IconTrash(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M4 7h16M10 11v6M14 11v6M7 7l1-2h8l1 2M9 4h6" />
    </GrowthIconBase>
  );
}

export function IconClose(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" strokeWidth={2.25} />
    </GrowthIconBase>
  );
}

export function IconCheck(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M5 12l5 5L19 7" />
    </GrowthIconBase>
  );
}

export function IconChevronDown(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M6 9l6 6 6-6" />
    </GrowthIconBase>
  );
}

export function IconChevronRight(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M9 6l6 6-6 6" />
    </GrowthIconBase>
  );
}

export function IconExternalLink(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M14 3h7v7M10 14L21 3M15 10h5v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9" />
    </GrowthIconBase>
  );
}

// Status
export function IconStar(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M12 3l2.4 7.4h7.6l-6 4.6 2.3 7.4L12 17.4l-6.3 4.6 2.3-7.4-6-4.6h7.6L12 3z" />
    </GrowthIconBase>
  );
}

export function IconStarFilled(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props} fill="currentColor" stroke="none">
      <path d="M12 3l2.4 7.4h7.6l-6 4.6 2.3 7.4L12 17.4l-6.3 4.6 2.3-7.4-6-4.6h7.6L12 3z" />
    </GrowthIconBase>
  );
}

export function IconLock(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </GrowthIconBase>
  );
}

export function IconUnlock(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 018 0" />
    </GrowthIconBase>
  );
}

export function IconTrending(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M3 17l6-6 4 4 8-10" />
      <path d="M14 5h7v7" />
    </GrowthIconBase>
  );
}

export function IconAlert(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M12 3L2 19h20L12 3z" />
      <path d="M12 10v4M12 17h.01" />
    </GrowthIconBase>
  );
}

export function IconInfo(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </GrowthIconBase>
  );
}

export function IconSpinner(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props} className={`animate-spin ${props.className ?? ""}`}>
      <path d="M12 3a9 9 0 109 9" opacity={0.35} />
      <path d="M12 3a9 9 0 019 9" />
    </GrowthIconBase>
  );
}

// Domain
export function IconXp(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M13 2L4 14h7l-1 8 10-12h-7l1-8z" fill="currentColor" fillOpacity={0.15} />
    </GrowthIconBase>
  );
}

export function IconLevel(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M12 2l4 6h7l-4 5 1.5 7L12 17l-6.5 3 1.5-7-4-5h7l4-6z" />
    </GrowthIconBase>
  );
}

export function IconStreak(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M12 3c2.5 4.5 6 5.5 6 9a6 6 0 11-12 0c0-3.5 3.5-4.5 6-9z" fill="currentColor" fillOpacity={0.12} />
    </GrowthIconBase>
  );
}

export function IconBadge(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <circle cx="12" cy="9" r="5" />
      <path d="M8 14h8l2 7H6l2-7z" />
    </GrowthIconBase>
  );
}

/** @deprecated Use IconPartners or IconTrophy */
export function IconRank(props: GrowthIconProps) {
  return <IconTrophy {...props} />;
}

export function IconPartners(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M4 20c0-2.8 2.2-5 5-5s5 2.2 5 5M13 20c0-2.2 1.8-4 4-4" />
    </GrowthIconBase>
  );
}

export function IconTrophy(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M8 5h8v4a4 4 0 01-8 0V5z" />
      <path d="M6 5H4a2 2 0 002 2M18 5h2a2 2 0 01-2 2" />
      <path d="M12 13v2M9 20h6M10 15h4" />
    </GrowthIconBase>
  );
}

export function IconCommission(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a3 3 0 015 0M12 16v-1" />
    </GrowthIconBase>
  );
}

export function IconPayout(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M5 8h14v10H5z" />
      <path d="M9 12h6M12 9v6" />
      <path d="M16 5l2-2M8 5L6 3" />
    </GrowthIconBase>
  );
}

export function IconReferral(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M4 18v-1a5 5 0 015-5h0a5 5 0 015 5v1" />
      <path d="M17 11v6M20 8v6M17 8h6" />
    </GrowthIconBase>
  );
}

export function IconMission(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M9 5H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-4" />
      <path d="M9 5a2 2 0 014 0M9 12l2 2 4-4" />
    </GrowthIconBase>
  );
}

export function IconEvent(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M5 4h14l-1 14H6L5 4z" />
      <path d="M12 8v6M9 11l3 3 3-3" />
    </GrowthIconBase>
  );
}

export function IconEye(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </GrowthIconBase>
  );
}

export function IconCalendar(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v3M16 3v3M4 10h16" />
    </GrowthIconBase>
  );
}

export function IconQr(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <rect x="4" y="4" width="6" height="6" />
      <rect x="14" y="4" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM20 14v6M14 20h6" />
    </GrowthIconBase>
  );
}

// Social brand icons (stroke style)
export function IconWhatsApp(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3z" />
      <path d="M9.5 10.5l1 2.5 4.5-2.5-2-1.5-3.5 1.5z" />
    </GrowthIconBase>
  );
}

export function IconLinkedIn(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 10v7M8 7h.01" strokeWidth={2.5} />
      <path d="M12 10v7M12 13c0-1.5 1.5-2 3-2" />
    </GrowthIconBase>
  );
}

export function IconXSocial(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M9 9.5h6v1.2H9zm0 3.3h4.5v1.2H9z" fill="currentColor" stroke="none" />
    </GrowthIconBase>
  );
}

export function IconMap(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M12 2C8.5 6 5 9.8 5 14a7 7 0 1014 0c0-4.2-3.5-8-7-12z" />
      <circle cx="12" cy="14" r="2.5" fill="currentColor" stroke="none" />
    </GrowthIconBase>
  );
}

export function IconOracle(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity={0.15} stroke="none" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2" />
      <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" opacity={0.45} />
    </GrowthIconBase>
  );
}

export function IconRival(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M6 4l3 16M18 4l-3 16" />
      <path d="M4 8h6M14 8h6M5 16h5M14 16h5" />
    </GrowthIconBase>
  );
}

export function IconLegends(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M5 18h14" />
      <path d="M7 18l1.5-7 3.5 4 3.5-4L17 18" />
      <path d="M5 10l2.5-4 4.5 3 4.5-3L19 10l-2 2H7l-2-2z" />
      <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
    </GrowthIconBase>
  );
}

export function IconHeart(props: GrowthIconProps & { filled?: boolean }) {
  const { filled, ...rest } = props;
  return (
    <GrowthIconBase {...rest}>
      <path
        d="M12 21s-6.5-4.35-9-8.5C1.5 9.5 3.5 5 7.5 5c2 0 3.2 1.2 4.5 2.8C13.3 6.2 14.5 5 16.5 5 20.5 5 22.5 9.5 21 12.5 18.5 16.65 12 21 12 21z"
        fill={filled ? "currentColor" : "none"}
      />
    </GrowthIconBase>
  );
}

export function IconComment(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M4 5h16v11H8l-4 4V5z" />
      <path d="M8 10h8M8 13h5" opacity={0.55} />
    </GrowthIconBase>
  );
}

export function IconRepost(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M7 7h11v6" />
      <path d="M17 7l-3-3M17 13H6V7" />
      <path d="M6 13l3 3" />
    </GrowthIconBase>
  );
}

export function IconSparkle(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M12 3l1.2 4.2L17.5 8.5 13.2 9.7 12 14l-1.2-4.3L6.5 8.5l4.3-1.3L12 3z" />
      <path d="M5 16l.7 2.3L8 19l-2.3.7L5 22l-.7-2.3L2 19l2.3-.7L5 16z" opacity={0.7} />
      <path d="M19 14l.5 1.7L21 16l-1.5.3L19 18l-.5-1.7L17 16l1.5-.3L19 14z" opacity={0.55} />
    </GrowthIconBase>
  );
}

export function IconRobotAssistant(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <rect x="5" y="8" width="14" height="11" rx="3" fill="currentColor" opacity={0.15} />
      <rect x="5" y="8" width="14" height="11" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="9.5" cy="13" r="1.5" fill="currentColor" />
      <circle cx="14.5" cy="13" r="1.5" fill="currentColor" />
      <path d="M10 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 4v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="3" r="1.25" fill="currentColor" />
      <path d="M3 12h2M19 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 10l-1.5-1M19 10l1.5-1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity={0.7} />
    </GrowthIconBase>
  );
}

export function IconChronicle({ size = 20, className = "" }: GrowthIconProps) {
  return (
    <GrowthIconBase size={size} className={className}>
      <path d="M6 4h12v16H6z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </GrowthIconBase>
  );
}

export function IconConstellation({ size = 20, className = "" }: GrowthIconProps) {
  return (
    <GrowthIconBase size={size} className={className}>
      <path
        d="M12 3l1.2 3.6L17 8l-3.6 1.2L12 13l-1.2-3.8L7 8l3.8-1.4L12 3z"
        fill="currentColor"
      />
      <ellipse cx="12" cy="16" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1" fill="none" opacity={0.5} />
    </GrowthIconBase>
  );
}

export function IconVault({ size = 20, className = "" }: GrowthIconProps) {
  return (
    <GrowthIconBase size={size} className={className}>
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M8 10V8a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    </GrowthIconBase>
  );
}

export function IconBattle({ size = 20, className = "" }: GrowthIconProps) {
  return (
    <GrowthIconBase size={size} className={className}>
      <path d="M5 5l4 14M19 5l-4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </GrowthIconBase>
  );
}

export function IconMentor({ size = 20, className = "" }: GrowthIconProps) {
  return (
    <GrowthIconBase size={size} className={className}>
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.25" fill="none" />
      <path d="M4 18c0-2.5 2-4 5-4M13 18c0-2 1.5-3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </GrowthIconBase>
  );
}

export function IconGhost(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M12 3a5 5 0 00-5 5v3.5c0 1.4-.45 2.35-1.35 3.35L4 20h16l-1.65-5.15C17.55 13.85 17 12.9 17 11.5V8a5 5 0 00-5-5z" />
      <circle cx="9" cy="10" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1.1" fill="currentColor" stroke="none" />
      <path d="M10 14.5c.6.8 1.4 1.2 2 1.2s1.4-.4 2-1.2" opacity={0.7} />
    </GrowthIconBase>
  );
}

export function IconCapsule(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <rect x="7" y="5" width="10" height="15" rx="5" />
      <path d="M7 11.5h10" strokeWidth={2} />
      <path d="M9.5 5V3.5M14.5 5V3.5" />
      <circle cx="12" cy="8.5" r="1" fill="currentColor" stroke="none" opacity={0.6} />
    </GrowthIconBase>
  );
}

export function IconLightbulb(props: GrowthIconProps) {
  return (
    <GrowthIconBase {...props}>
      <path d="M9 18h6M10 21h4M12 3a5 5 0 00-3.2 8.85V14h6.4v-2.15A5 5 0 0012 3z" />
      <path d="M12 14v1.5" opacity={0.55} />
    </GrowthIconBase>
  );
}

/** Mobile bottom nav mapping */
export const GROWTH_MOBILE_NAV_ICONS = {
  dashboard: IconDashboard,
  deals: IconDeals,
  events: IconEvents,
  map: IconMap,
  chat: IconChat,
  settings: IconSettings,
} as const;

/** Desktop nav includes network + notifications + kit via shell */
export const GROWTH_DESKTOP_NAV_ICONS: Record<string, ComponentType<GrowthIconProps>> = {
  dashboard: IconDashboard,
  deals: IconDeals,
  earnings: IconEarnings,
  network: IconNetwork,
  leaderboard: IconTrophy,
  events: IconEvents,
  creators: IconStar,
  chat: IconChat,
  notifications: IconNotifications,
  settings: IconSettings,
  map: IconMap,
  chronicle: IconChronicle,
  constellation: IconConstellation,
  vault: IconVault,
  battles: IconBattle,
  mentors: IconMentor,
  legends: IconLegends,
};
