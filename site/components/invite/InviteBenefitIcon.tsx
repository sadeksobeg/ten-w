import type { InviteBenefit } from "@/lib/invite/message-templates";

type Props = {
  icon: InviteBenefit["icon"];
};

export function InviteBenefitIcon({ icon }: Props) {
  const props = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5 };

  switch (icon) {
    case "network":
      return (
        <svg {...props}>
          <circle cx="12" cy="5" r="2" />
          <circle cx="5" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
          <path d="M12 7v4M8.5 17.5L10.5 13M15.5 17.5L13.5 13" />
        </svg>
      );
    case "team":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case "star":
      return (
        <svg {...props}>
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
        </svg>
      );
    case "projects":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 4v16" />
        </svg>
      );
    case "priority":
      return (
        <svg {...props}>
          <path d="M12 2v20M5 9l7-7 7 7" />
        </svg>
      );
    case "partnership":
    default:
      return (
        <svg {...props}>
          <path d="M5 12c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7" />
          <path d="M5 12H2M5 12c0 3.87-3.13 7-7 7" transform="translate(7 0)" />
        </svg>
      );
  }
}
