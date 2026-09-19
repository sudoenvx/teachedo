// icon-button.tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from 'cn'
import { Tooltip } from './tooltip' // Ensure path is correct
import { type FloatingSide } from '../utils'

type IconButtonColor = 'primary' | 'secondary' | 'accent' | 'danger' | 'success' | 'neutral'
type IconButtonStyle = 'solid' | 'tint' | 'ghost'
type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  icon: ReactNode
  color?: IconButtonColor
  style?: IconButtonStyle
  size?: IconButtonSize
  loading?: boolean
  /** Tooltip content, visually replaces the native tooltip. */
  title?: string
  tooltipSide?: FloatingSide
  /** Icon-only control — an accessible name is not optional. */
  'aria-label': string
}

const colorStyle: Record<IconButtonColor, Record<IconButtonStyle, string>> = {
  primary: {
    solid: 'bg-primary text-primary-foreground hover:bg-primary-hover',
    tint: 'bg-primary-subtle text-primary-subtle-foreground hover:bg-primary-subtle/70',
    ghost: 'bg-transparent text-primary hover:bg-primary-subtle',
  },
  secondary: {
    solid: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
    tint: 'bg-neutral-200 text-text hover:bg-neutral-300',
    ghost: 'bg-transparent text-text hover:bg-neutral-100 hover:text-text',
  },
  accent: {
    solid: 'bg-accent text-accent-foreground hover:bg-accent-hover',
    tint: 'bg-accent-subtle text-accent-subtle-foreground hover:bg-accent-subtle/70',
    ghost: 'bg-transparent text-accent hover:bg-accent-subtle',
  },
  danger: {
    solid: 'bg-destructive text-destructive-foreground hover:bg-destructive-hover',
    tint: 'bg-destructive-subtle text-destructive-subtle-foreground hover:bg-destructive-subtle/70',
    ghost: 'bg-transparent text-destructive hover:bg-destructive-subtle',
  },
  success: {
    solid: 'bg-success text-success-foreground hover:bg-success-hover',
    tint: 'bg-success-subtle text-success-subtle-foreground hover:bg-success-subtle/70',
    ghost: 'bg-transparent text-success hover:bg-success-subtle',
  },
  neutral: {
    solid: 'bg-surface text-text border border-border-strong hover:bg-surface-raised',
    tint: 'bg-neutral-100 text-text hover:bg-neutral-200',
    ghost: 'bg-transparent text-text-muted hover:bg-neutral-100 hover:text-text',
  },
}

const sizeClasses: Record<IconButtonSize, string> = {
  xs: 'w-5 h-5 rounded-[3px]',
  sm: 'w-6 h-6 rounded-sm',
  md: 'w-6.5 h-6.5 rounded-sm',
  lg: 'w-8 h-8 rounded-sm',
}
const iconSize: Record<IconButtonSize, string> = {
  xs: '[&>svg]:w-3 [&>svg]:h-3',
  sm: '[&>svg]:w-3.5 [&>svg]:h-3.5',
  md: '[&>svg]:w-4 [&>svg]:h-4',
  lg: '[&>svg]:w-[18px] [&>svg]:h-[18px]',
}
const spinnerSize: Record<IconButtonSize, string> = {
  xs: 'w-2.5 h-2.5', sm: 'w-3 h-3', md: 'w-3.5 h-3.5', lg: 'w-4 h-4',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, color = 'secondary', style = 'tint', size = 'sm', loading = false, disabled = false, className, title, tooltipSide = 'top', ...props }, ref) => {
    const isDisabled = disabled || loading

    const button = (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          'inline-flex shrink-0 items-center justify-center transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:bg-disabled-background disabled:text-disabled-foreground disabled:border-disabled-border',
          sizeClasses[size],
          !isDisabled && colorStyle[color][style],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className={cn('animate-spin', spinnerSize[size])} aria-hidden="true" />
        ) : (
          <span className={cn('flex items-center justify-center', iconSize[size])} aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    )

    // Optionally wrap in tooltip if a `title` is provided
    if (title) {
      return <Tooltip side={tooltipSide} content={title}>{button}</Tooltip>
    }

    return button
  },
)
IconButton.displayName = 'IconButton'