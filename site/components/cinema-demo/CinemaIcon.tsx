type IconName =
  | "film"
  | "chart"
  | "crown"
  | "volume"
  | "volume-off"
  | "star"
  | "star-filled"
  | "check"
  | "ticket"
  | "seat"
  | "popcorn"
  | "phone"
  | "arrow"
  | "live"
  | "alert"
  | "users"
  | "clock"
  | "wallet";

type Props = {
  name: IconName;
  size?: number;
  className?: string;
  filled?: boolean;
};

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.75,
  fill: "none" as const,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CinemaIcon({ name, size = 24, className = "", filled = false }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "film":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" {...stroke} />
          <path d="M7 5v14M12 5v14M17 5v14" {...stroke} />
          <circle cx="7" cy="8" r="1" fill="currentColor" />
          <circle cx="7" cy="16" r="1" fill="currentColor" />
          <circle cx="17" cy="8" r="1" fill="currentColor" />
          <circle cx="17" cy="16" r="1" fill="currentColor" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 20V4M4 20h16" {...stroke} />
          <path d="M8 16v-4M12 16V8M16 16v-6" {...stroke} />
        </svg>
      );
    case "crown":
      return (
        <svg {...common}>
          <path d="M4 18h16l-2-10-4 4-2-6-2 6-4-4z" {...stroke} />
          <path d="M4 18v2h16v-2" {...stroke} />
        </svg>
      );
    case "volume":
      return (
        <svg {...common}>
          <path d="M11 5L6 9H3v6h3l5 4V5z" {...stroke} />
          <path d="M16 9a4 4 0 010 6M18 7a7 7 0 010 10" {...stroke} />
        </svg>
      );
    case "volume-off":
      return (
        <svg {...common}>
          <path d="M11 5L6 9H3v6h3l5 4V5z" {...stroke} />
          <path d="M16 9l5 6M21 9l-5 6" {...stroke} />
        </svg>
      );
    case "star":
    case "star-filled":
      return (
        <svg {...common}>
          <path
            d="M12 3l2.4 5.5L20 9.5l-4.5 4 1.2 6.5L12 17.5 7.3 20l1.2-6.5L4 9.5l5.6-1L12 3z"
            fill={filled || name === "star-filled" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" {...stroke} />
          <path d="M8 12l3 3 5-6" {...stroke} />
        </svg>
      );
    case "ticket":
      return (
        <svg {...common}>
          <path d="M4 8a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 010 4 2 2 0 010 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 010-4 2 2 0 010-4V8z" {...stroke} />
          <path d="M12 6v12" strokeDasharray="2 3" {...stroke} />
        </svg>
      );
    case "seat":
      return (
        <svg {...common}>
          <path d="M6 18V8a2 2 0 012-2h8a2 2 0 012 2v10" {...stroke} />
          <path d="M4 18h16M8 18v2h8v-2" {...stroke} />
        </svg>
      );
    case "popcorn":
      return (
        <svg {...common}>
          <path d="M8 10l-1 10h10l-1-10" {...stroke} />
          <path d="M9 10c0-2 1.5-4 3-4s3 2 3 4M7 10h10" {...stroke} />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <rect x="7" y="3" width="10" height="18" rx="2" {...stroke} />
          <path d="M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" {...stroke} />
        </svg>
      );
    case "live":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <circle cx="12" cy="12" r="8" {...stroke} opacity="0.5" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 3L2 20h20L12 3z" {...stroke} />
          <path d="M12 10v4M12 17h.01" {...stroke} />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" {...stroke} />
          <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" {...stroke} />
          <circle cx="17" cy="9" r="2" {...stroke} />
          <path d="M15 20c.5-2 2-3 4-3" {...stroke} />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" {...stroke} />
          <path d="M12 7v5l3 2" {...stroke} />
        </svg>
      );
    case "wallet":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="13" rx="2" {...stroke} />
          <path d="M3 10h18M16 14h2" {...stroke} />
        </svg>
      );
    default:
      return null;
  }
}
