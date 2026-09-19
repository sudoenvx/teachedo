import React from 'react'
import { cn } from 'cn'

// Kept only the semantic variants that map to real states (success/warning/danger/neutral)
// plus 'primary' for brand-tinted badges. Anything more specific (custom hues, one-off
// statuses) should go through the `colors` prop instead of growing this list.
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'primary' | 'neutral'

export type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  size?: BadgeSize
  className?: string
  variant?: BadgeVariant
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-2.5 py-0.75 gap-1',
  md: 'text-[10px] px-3 py-1 gap-1.5',
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-success-subtle text-success-subtle-foreground',
  warning: 'bg-warning-subtle text-warning-subtle-foreground',
  danger: 'bg-destructive-subtle text-destructive-subtle-foreground',
  primary: 'bg-primary-subtle text-primary-subtle-foreground',
  neutral: 'bg-neutral-100 text-text'
}

export function Badge({
  children,
  size = 'sm',
  variant = 'neutral',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex py-0.5 items-center w-fit rounded-xs font-medium leading-none whitespace-nowrap',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}