import type { ReactNode } from 'react'

type IconProps = { className?: string }

function Icon({ children, className }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-5 w-5'}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const icons: Record<string, (props: IconProps) => ReactNode> = {
  math: (props) => (
    <Icon {...props}>
      <path d="M5 5h14M5 19h14M8 8l8 8M16 8l-8 8" />
    </Icon>
  ),
  physics: (props) => (
    <Icon {...props}>
      <ellipse cx="12" cy="12" rx="8" ry="3" />
      <ellipse cx="12" cy="12" rx="8" ry="3" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="8" ry="3" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </Icon>
  ),
  chemistry: (props) => (
    <Icon {...props}>
      <path d="M9 3v6l-5 8a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-8V3M8 3h8M7 16h10" />
    </Icon>
  ),
  biology: (props) => (
    <Icon {...props}>
      <path d="M7 4c5 1 10 5 10 10 0 4-3 6-6 6-4 0-5-3-5-6 0-4 2-7 5-10" />
      <path d="M5 19c4-5 7-8 12-10" />
    </Icon>
  ),
  arabic: (props) => (
    <Icon {...props}>
      <path d="M5 17c2-4 4-6 6-6 3 0 3 5 6 5 1 0 2-.5 2-2" />
      <path d="M8 7h.01M13 6h.01M17 8h.01" />
    </Icon>
  ),
  english: (props) => (
    <Icon {...props}>
      <path d="M5 18 10 6l5 12M7 14h6M15 18l2-5 2 5M16 16h2" />
    </Icon>
  ),
  social: (props) => (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2 2 3 5 3 8s-1 6-3 8c-2-2-3-5-3-8s1-6 3-8Z" />
    </Icon>
  ),
  computer: (props) => (
    <Icon {...props}>
      <rect x="4" y="5" width="16" height="12" rx="1" />
      <path d="M8 21h8M12 17v4" />
    </Icon>
  ),
  art: (props) => (
    <Icon {...props}>
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h2a7 7 0 0 0 0-10Z" />
      <circle cx="7.5" cy="10" r=".7" fill="currentColor" />
      <circle cx="9" cy="6.5" r=".7" fill="currentColor" />
      <circle cx="14.5" cy="6.5" r=".7" fill="currentColor" />
    </Icon>
  ),
  music: (props) => (
    <Icon {...props}>
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </Icon>
  ),
}

export function SubjectIcon({ icon, className }: { icon: string; className?: string }) {
  return icons[icon]?.({ className }) ?? icons.computer({ className })
}
