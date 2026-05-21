type IconProps = { className?: string };

function base(className?: string) {
  return className ?? "size-6 shrink-0";
}

export function NavHubIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function NavDealsIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 7h10v10H7V7z" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 4h6M9 20h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function NavEarningsIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v18M7 8c2-2 8-2 10 0s-2 6-5 6-3 4-5 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function NavEventsIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function NavChatIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 6h14a2 2 0 012 2v7a2 2 0 01-2 2H11l-4 4V8a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function NavSettingsIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const GROWTH_MOBILE_NAV_ICONS = {
  dashboard: NavHubIcon,
  deals: NavDealsIcon,
  earnings: NavEarningsIcon,
  events: NavEventsIcon,
  chat: NavChatIcon,
  settings: NavSettingsIcon,
} as const;
