/**
 * Line drawings for the schedule timeline, in the delicate single-weight style
 * of the comps. Each is drawn on a 64×64 grid and inherits `currentColor`.
 */

type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Frame({ children, className = "" }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g {...stroke}>{children}</g>
    </svg>
  );
}

export const icons = {
  rings: (p: IconProps) => (
    <Frame {...p}>
      <circle cx="26" cy="36" r="13" />
      <circle cx="40" cy="36" r="13" />
      <path d="M36 20l4-6 4 6" />
    </Frame>
  ),
  camera: (p: IconProps) => (
    <Frame {...p}>
      <path d="M10 24h9l4-5h18l4 5h9v22H10z" />
      <circle cx="32" cy="35" r="8" />
      <path d="M14 20c3-4 7-6 11-5" />
      <path d="M50 18c-3 2-5 5-5 8" />
    </Frame>
  ),
  fountain: (p: IconProps) => (
    <Frame {...p}>
      <path d="M32 12c-3 4-3 7 0 9 3-2 3-5 0-9z" />
      <path d="M32 21v10" />
      <path d="M22 31h20l-3 8H25z" />
      <path d="M16 47h32l-4 7H20z" />
      <path d="M24 31c-2-5-6-7-9-6" />
      <path d="M40 31c2-5 6-7 9-6" />
    </Frame>
  ),
  glasses: (p: IconProps) => (
    <Frame {...p}>
      <path d="M18 14l-6 14c0 5 3 8 7 8s7-3 7-8l-5-14z" />
      <path d="M46 14l6 14c0 5-3 8-7 8s-7-3-7-8l5-14z" />
      <path d="M19 36v12" />
      <path d="M45 36v12" />
      <path d="M13 50h12" />
      <path d="M39 50h12" />
    </Frame>
  ),
  table: (p: IconProps) => (
    <Frame {...p}>
      <ellipse cx="32" cy="30" rx="20" ry="7" />
      <path d="M12 30v8c0 4 9 7 20 7s20-3 20-7v-8" />
      <path d="M20 45v7" />
      <path d="M44 45v7" />
      <path d="M32 12v11" />
      <path d="M27 16c3-3 7-3 10 0" />
    </Frame>
  ),
  car: (p: IconProps) => (
    <Frame {...p}>
      <path d="M10 40l4-12h36l4 12v7H10z" />
      <path d="M18 28l3-7h22l3 7" />
      <circle cx="20" cy="47" r="4" />
      <circle cx="44" cy="47" r="4" />
      <path d="M26 20l4-5 4 5" />
    </Frame>
  ),
} as const;

export type IconName = keyof typeof icons;
