interface IconProps {
  size?: number
  className?: string
  strokeWidth?: number
}

function base({ size = 16, className, strokeWidth = 1.25 }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  }
}

export function ArrowUpRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  )
}

export function ArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}

export function ArrowLeft(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 12H5M11 6l-6 6 6 6" />
    </svg>
  )
}

export function Close(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function Layers(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m12 4 8 4.5-8 4.5-8-4.5L12 4Z" />
      <path d="m4 12.4 8 4.5 8-4.5" />
      <path d="m4 16.4 8 4.5 8-4.5" />
    </svg>
  )
}

export function Compass(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="m15 9-1.8 4.2L9 15l1.8-4.2L15 9Z" />
    </svg>
  )
}

export function Book(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 4.5h9.5A3.5 3.5 0 0 1 18 8v11.5H8.5A3.5 3.5 0 0 0 5 23" transform="translate(0 -2)" />
      <path d="M5 2.5v17A2.5 2.5 0 0 1 7.5 17H18" />
    </svg>
  )
}

export function Play(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 6.5 17 12l-8 5.5v-11Z" />
    </svg>
  )
}

export function Pause(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 6v12M15 6v12" />
    </svg>
  )
}

export function ZoomIn(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4M11 8.5v5M8.5 11h5" />
    </svg>
  )
}

export function ZoomOut(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4M8.5 11h5" />
    </svg>
  )
}

export function CompassReset(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 9A8 8 0 1 1 4 14" />
      <path d="M4 4v5h5" />
      <path d="m14.8 10.2-2.1 3.7-3.7 1 2.1-3.7 3.7-1Z" />
    </svg>
  )
}

export function Edit(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m15.5 5.5 3 3L8 19l-4 1 1-4 10.5-10.5Z" />
      <path d="m13.5 7.5 3 3" />
    </svg>
  )
}

export function Sparkle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2.4 2.4M15.1 15.1l2.4 2.4M17.5 6.5l-2.4 2.4M8.9 15.1 6.5 17.5" />
    </svg>
  )
}

export function Info(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 11v5M12 8.2v.2" />
    </svg>
  )
}

export function MapPin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s6.5-5.4 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </svg>
  )
}

export function ChevronLeft(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m14.5 6-6 6 6 6" />
    </svg>
  )
}

export function ChevronRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9.5 6 6 6-6 6" />
    </svg>
  )
}

export function ChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  )
}

export function Check(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  )
}

export function Menu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 8h16M4 16h16" />
    </svg>
  )
}

export function Globe(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M3.8 12h16.4M12 3.6c2.4 2.3 3.6 5.1 3.6 8.4S14.4 18.1 12 20.4C9.6 18.1 8.4 15.3 8.4 12S9.6 5.9 12 3.6Z" />
    </svg>
  )
}

export function Sun(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </svg>
  )
}

export function Moon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 14.5A8.2 8.2 0 0 1 9.5 4a8.2 8.2 0 1 0 10.5 10.5Z" />
    </svg>
  )
}
