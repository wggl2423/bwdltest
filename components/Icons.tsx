import type { SVGProps } from "react";

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

type NationIconProps = { id: string } & SVGProps<SVGSVGElement>;

// 各国代表物的单色线性图标，颜色由父级 color 控制
export function NationIcon({ id, ...props }: NationIconProps) {
  switch (id) {
    case "tinyland":
      return (
        <svg {...base} {...props}>
          <path d="M4 20V10.5L12 5l8 5.5V20" />
          <path d="M9.5 20v-5.5h5V20" />
        </svg>
      );
    case "food":
      return (
        <svg {...base} {...props}>
          <path d="M4 12h16a8 8 0 0 1-16 0Z" />
          <path d="M8 8.5V5M12 8.5V4M16 8.5V5" />
        </svg>
      );
    case "eleven":
      return (
        <svg {...base} {...props}>
          <path d="M6 21V3.5" />
          <path d="M6 5h11l-2 4 2 4H6" />
        </svg>
      );
    case "bo":
      return (
        <svg {...base} {...props}>
          <path d="M4 13.5c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" />
          <path d="M4 18c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" />
        </svg>
      );
    case "children":
      return (
        <svg {...base} {...props}>
          <circle cx="12" cy="9" r="5" />
          <path d="M12 14v3.5M9 20.5h6" />
        </svg>
      );
    default:
      return (
        <svg {...base} {...props}>
          <circle cx="12" cy="12" r="7.5" />
        </svg>
      );
  }
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <path d="M12 14.5v2" />
    </svg>
  );
}
