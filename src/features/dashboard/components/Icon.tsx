import type { CSSProperties } from "react";

export type IconName =
  | "PawPrint"
  | "House"
  | "Dog"
  | "CalendarCheck"
  | "ShoppingBag"
  | "Wallet"
  | "Crown"
  | "LifeBuoy"
  | "Search"
  | "Bell"
  | "ChevronsUpDown"
  | "ChevronDown"
  | "ChevronRight"
  | "Star"
  | "MessageCircle"
  | "ArrowRight"
  | "ArrowLeft"
  | "Syringe"
  | "HeartPulse"
  | "Stethoscope"
  | "Bath"
  | "RotateCcw"
  | "Plus"
  | "Minus"
  | "Mail"
  | "Lock"
  | "Eye"
  | "EyeOff"
  | "Check"
  | "ShieldCheck"
  | "X"
  | "LogOut"
  | "MapPin"
  | "Calendar"
  | "Trash"
  | "Pencil"
  | "Cat"
  | "ShoppingCart"
  | "CreditCard"
  | "Receipt"
  | "AlertCircle";

type IconProps = {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
};

export function Icon({ name, size = 22, stroke = 2, color = "currentColor", className, style }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style,
    "aria-hidden": true,
  };

  switch (name) {
    case "PawPrint":
      return (
        <svg {...common} fill={color}>
          <ellipse cx="5.6" cy="9.4" rx="1.7" ry="2.3" />
          <ellipse cx="9.4" cy="5.4" rx="1.9" ry="2.5" />
          <ellipse cx="14.6" cy="5.4" rx="1.9" ry="2.5" />
          <ellipse cx="18.4" cy="9.4" rx="1.7" ry="2.3" />
          <path d="M12 11.2c-3 0-5.7 2.7-5.7 5.5 0 1.7 1.3 3 3 3 1 0 1.9-.4 2.7-.7.4-.1.7-.1 1 0 .8.3 1.7.7 2.7.7 1.7 0 3-1.3 3-3 0-2.8-2.7-5.5-5.7-5.5Z" />
        </svg>
      );
    case "House":
      return (
        <svg {...common}>
          <path d="M3 11 12 3l9 8" />
          <path d="M5 10v10h14V10" />
          <path d="M10 20v-6h4v6" />
        </svg>
      );
    case "Dog":
      return (
        <svg {...common}>
          <path d="M10 5.2c-.6-1.4-2.1-2.1-3.4-1.4S4.7 6 5.2 7.4" />
          <path d="M14 5.2c.6-1.4 2.1-2.1 3.4-1.4S19.3 6 18.8 7.4" />
          <path d="M5 9c0 5 3.1 9 7 9s7-4 7-9" />
          <path d="M11 13.5c.6.5 1.4.5 2 0" />
          <circle cx="9" cy="11" r="0.6" fill={color} />
          <circle cx="15" cy="11" r="0.6" fill={color} />
        </svg>
      );
    case "Cat":
      return (
        <svg {...common}>
          <path d="M5 4 7 8" />
          <path d="M19 4l-2 4" />
          <path d="M5 8c0 5 3 10 7 10s7-5 7-10" />
          <circle cx="9.5" cy="12" r="0.6" fill={color} />
          <circle cx="14.5" cy="12" r="0.6" fill={color} />
          <path d="M11 15c.4.4 1.6.4 2 0" />
        </svg>
      );
    case "CalendarCheck":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
          <path d="M3.5 10h17" />
          <path d="M8 3v3M16 3v3" />
          <path d="m9 14 2 2 4-4" />
        </svg>
      );
    case "Calendar":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
          <path d="M3.5 10h17" />
          <path d="M8 3v3M16 3v3" />
        </svg>
      );
    case "ShoppingBag":
      return (
        <svg {...common}>
          <path d="M5 7h14l-1.2 12.2A2 2 0 0 1 15.8 21H8.2a2 2 0 0 1-2-1.8L5 7Z" />
          <path d="M8 7V5a4 4 0 0 1 8 0v2" />
        </svg>
      );
    case "ShoppingCart":
      return (
        <svg {...common}>
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="17" cy="20" r="1.5" />
          <path d="M3 4h2.5l2 12h12l2-8H7" />
        </svg>
      );
    case "Wallet":
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
          <rect x="3" y="7" width="18" height="13" rx="2.5" />
          <circle cx="16.5" cy="13.5" r="1.3" fill={color} />
        </svg>
      );
    case "Crown":
      return (
        <svg {...common} fill={color}>
          <path d="M3 8l3 8h12l3-8-5 3-4-6-4 6-5-3Z" stroke="none" />
          <path d="M5 18h14" stroke={color} fill="none" />
        </svg>
      );
    case "LifeBuoy":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3.5" />
          <path d="m4.5 4.5 5 5M14.5 14.5l5 5M19.5 4.5l-5 5M9.5 14.5l-5 5" />
        </svg>
      );
    case "Search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "Bell":
      return (
        <svg {...common}>
          <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
    case "ChevronsUpDown":
      return (
        <svg {...common}>
          <path d="m8 9 4-4 4 4" />
          <path d="m8 15 4 4 4-4" />
        </svg>
      );
    case "ChevronDown":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "ChevronRight":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "Star":
      return (
        <svg {...common} fill={color}>
          <path d="M12 3.4 14.6 9l6.1.6-4.6 4.2 1.4 6L12 16.9 6.5 19.8l1.4-6L3.3 9.6 9.4 9 12 3.4Z" />
        </svg>
      );
    case "MessageCircle":
      return (
        <svg {...common}>
          <path d="M21 12a9 9 0 1 1-3.6-7.2l.1.1L21 4l-1 4.4A9 9 0 0 1 21 12Z" />
        </svg>
      );
    case "ArrowRight":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 5 7 7-7 7" />
        </svg>
      );
    case "ArrowLeft":
      return (
        <svg {...common}>
          <path d="M19 12H5" />
          <path d="m11 5-7 7 7 7" />
        </svg>
      );
    case "Syringe":
      return (
        <svg {...common}>
          <path d="m18 2 4 4" />
          <path d="m15 5 4 4" />
          <path d="m13 7 4 4-8 8H5v-4l8-8Z" />
          <path d="m9 11 4 4" />
        </svg>
      );
    case "HeartPulse":
      return (
        <svg {...common}>
          <path d="M20.8 11A6 6 0 0 0 10 7.4 6 6 0 0 0 3.2 11c0 5.4 8.8 10 8.8 10s1.7-.9 3.6-2.4" />
          <path d="M3.5 12.5h3l1.5-3 2 6 1.5-3h3" />
        </svg>
      );
    case "Stethoscope":
      return (
        <svg {...common}>
          <path d="M6 4v6a4 4 0 0 0 8 0V4" />
          <path d="M6 4H4.5M14 4h1.5" />
          <path d="M10 14v3a4 4 0 0 0 8 0v-1" />
          <circle cx="18" cy="14" r="1.6" />
        </svg>
      );
    case "Bath":
      return (
        <svg {...common}>
          <path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3Z" />
          <path d="M6 12V6a2 2 0 0 1 4 0v1" />
          <path d="M5 21l-1 2M19 21l1 2" />
        </svg>
      );
    case "RotateCcw":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      );
    case "Plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "Minus":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
        </svg>
      );
    case "Mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m3.5 7 8.5 6 8.5-6" />
        </svg>
      );
    case "Lock":
      return (
        <svg {...common}>
          <rect x="4" y="10.5" width="16" height="10.5" rx="2.5" />
          <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
        </svg>
      );
    case "Eye":
      return (
        <svg {...common}>
          <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "EyeOff":
      return (
        <svg {...common}>
          <path d="M3 3l18 18" />
          <path d="M10.6 6.1A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.3 3.9" />
          <path d="M6.1 7.5C3.6 9.1 2.5 12 2.5 12s3.5 6 9.5 6c1.6 0 3-.3 4.2-.9" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
      );
    case "Check":
      return (
        <svg {...common}>
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      );
    case "ShieldCheck":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v6c0 4.6 3.2 8.4 7.5 9 4.3-.6 7.5-4.4 7.5-9V6L12 3Z" />
          <path d="m9 12.2 2.2 2.3L15.5 10" />
        </svg>
      );
    case "X":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M6 18 18 6" />
        </svg>
      );
    case "LogOut":
      return (
        <svg {...common}>
          <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
          <path d="M16 8l4 4-4 4" />
          <path d="M9 12h11" />
        </svg>
      );
    case "MapPin":
      return (
        <svg {...common}>
          <path d="M12 22s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "Trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          <path d="M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      );
    case "Pencil":
      return (
        <svg {...common}>
          <path d="M4 20h4l11-11-4-4L4 16v4Z" />
        </svg>
      );
    case "CreditCard":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3 10h18" />
          <path d="M7 15h3" />
        </svg>
      );
    case "Receipt":
      return (
        <svg {...common}>
          <path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2V3Z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "AlertCircle":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" />
          <path d="M12 16v.1" />
        </svg>
      );
    default:
      return null;
  }
}
