// components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { Loader2 } from 'lucide-react'
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react'

// type ButtonColor = 'primary' | 'secondary' | 'accent' | 'danger' | 'neutral' | 'success' | 'warning' | 'info'

/**
 * Design model:
 * - `color`  → semantic intent (primary / secondary / accent / danger / neutral)
 * - `style`  → visual weight (solid / tint / outline / ghost)
 * Every (color × style) pair is defined exactly once in compoundVariants below.
 * This replaces the old variant/outline/tint boolean soup, which allowed
 * impossible states (outline + tint together) and let the three matrices
 * drift out of sync with each other.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center gap-1.5 w-fit rounded-sm select-none',
    'font-[inherit] font-medium',
    'transition-colors duration-200',
    'cursor-pointer disabled:cursor-not-allowed disabled:opacity-45',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1'
  ],
  {
    variants: {
      color: {
        primary: '',
        secondary: '',
        accent: '',
        danger: '',
        neutral: '',
        info: '',
        success: '',
        warning: ''
      },
      style: {
        solid: '',
        tint: '',
        outline: '',
        ghost: '',
        surface: ''
      },
      size: {
        xs: 'px-2 text-[10px] h-5.5 font-normal',
        sm: 'px-3 text-[11px] h-6.5',
        md: 'px-4 text-[12px] h-7.5',
        lg: 'px-5 text-[14px] h-9'
      },
      uppercase: {
        true: 'uppercase',
        false: ''
      }
    },
    compoundVariants: [
      // --- solid ---
      { color: 'primary', style: 'solid', class: 'bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-primary/50' },
      { color: 'secondary', style: 'solid', class: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover focus-visible:ring-secondary/50' },
      { color: 'accent', style: 'solid', class: 'bg-accent text-accent-foreground hover:bg-accent-hover focus-visible:ring-accent/50' },
      { color: 'danger', style: 'solid', class: 'bg-destructive text-destructive-foreground hover:bg-destructive-hover focus-visible:ring-destructive/50' },
      { color: 'neutral', style: 'solid', class: 'bg-neutral-100 text-text hover:bg-neutral-200 focus-visible:ring-border-strong/50' },

      // --- tint (soft bg, never escalates to solid on hover) ---
      { color: 'primary', style: 'tint', class: 'bg-primary-subtle text-primary-subtle-text hover:bg-primary-subtle/80 focus-visible:ring-primary/40' },
      { color: 'secondary', style: 'tint', class: 'bg-neutral-100 text-secondary-subtle-text hover:bg-neutral-200 focus-visible:ring-secondary/40' },
      { color: 'accent', style: 'tint', class: 'bg-accent-subtle text-accent-subtle-text hover:bg-accent-subtle/80 focus-visible:ring-accent/40' },
      { color: 'danger', style: 'tint', class: 'bg-destructive-subtle text-destructive-subtle-text hover:bg-destructive-subtle/80 focus-visible:ring-destructive/40' },
      { color: 'neutral', style: 'tint', class: 'bg-neutral-subtle text-neutral-subtle-text hover:bg-neutral-subtle/80 focus-visible:ring-border-strong/40' },

      // --- outline ---
      { color: 'primary', style: 'outline', class: 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-primary/50' },
      { color: 'secondary', style: 'outline', class: 'bg-transparent text-secondary border border-secondary hover:bg-secondary hover:text-secondary-foreground focus-visible:ring-secondary/50' },
      { color: 'accent', style: 'outline', class: 'bg-transparent text-accent border border-accent hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent/50' },
      { color: 'danger', style: 'outline', class: 'bg-transparent text-destructive border border-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-destructive/50' },
      { color: 'neutral', style: 'outline', class: 'bg-transparent text-text border border-border-strong hover:bg-surface-raised focus-visible:ring-border-strong/50' },

      // --- ghost (no bg/border at rest; color only shapes text + hover) ---
      { color: 'primary', style: 'ghost', class: 'bg-transparent text-primary hover:bg-primary-subtle focus-visible:ring-primary/40' },
      { color: 'secondary', style: 'ghost', class: 'bg-transparent text-secondary hover:bg-neutral-100 focus-visible:ring-secondary/40' },
      { color: 'accent', style: 'ghost', class: 'bg-transparent text-accent hover:bg-accent-subtle focus-visible:ring-accent/40' },
      { color: 'danger', style: 'ghost', class: 'bg-transparent text-destructive hover:bg-destructive-subtle focus-visible:ring-destructive/40' },
      { color: 'neutral', style: 'ghost', class: 'bg-transparent text-text hover:bg-surface-raised focus-visible:ring-border-strong/40' },

      // --- surface ---
      { color: 'primary', style: 'surface', class: 'bg-primary-subtle text-primary hover:bg-primary-subtle/80 focus-visible:ring-primary/40' },
      { color: 'secondary', style: 'surface', class: 'bg-surface text-secondary hover:bg-surface-raised focus-visible:ring-secondary/40' },
      { color: 'accent', style: 'surface', class: 'bg-accent-subtle text-accent hover:bg-accent-subtle/80 focus-visible:ring-accent/40' },
      { color: 'danger', style: 'surface', class: 'bg-destructive-subtle text-destructive hover:bg-destructive-subtle/80 focus-visible:ring-destructive/40' },
      { color: 'neutral', style: 'surface', class: 'bg-surface text-text hover:bg-surface-raised focus-visible:ring-border-strong/40' },

      { color: 'success', style: 'solid', class: 'bg-success text-success-foreground hover:bg-success-hover focus-visible:ring-success/50' },
      { color: 'success', style: 'tint', class: 'bg-success-subtle text-success-subtle-foreground hover:bg-success-subtle/80 focus-visible:ring-success/40' },
      { color: 'success', style: 'outline', class: 'bg-transparent text-success border border-success hover:bg-success hover:text-success-foreground focus-visible:ring-success/50' },
      { color: 'success', style: 'ghost', class: 'bg-transparent text-success hover:bg-success-subtle focus-visible:ring-success/40' },
      { color: 'success', style: 'surface', class: 'bg-success-subtle text-success hover:bg-success-subtle/80 focus-visible:ring-success/40' },

      { color: 'warning', style: 'solid', class: 'bg-warning text-warning-foreground hover:bg-warning-hover focus-visible:ring-warning/50' },
      { color: 'warning', style: 'tint', class: 'bg-warning-subtle text-warning-subtle-foreground hover:bg-warning-subtle/80 focus-visible:ring-warning/40' },
      { color: 'warning', style: 'outline', class: 'bg-transparent text-warning border border-warning hover:bg-warning hover:text-warning-foreground focus-visible:ring-warning/50' },
      { color: 'warning', style: 'ghost', class: 'bg-transparent text-warning hover:bg-warning-subtle focus-visible:ring-warning/40' },
      { color: 'warning', style: 'surface', class: 'bg-warning-subtle text-warning hover:bg-warning-subtle/80 focus-visible:ring-warning/40' },

      { color: 'info', style: 'solid', class: 'bg-info text-info-foreground hover:bg-info-hover focus-visible:ring-info/50' },
      { color: 'info', style: 'tint', class: 'bg-info-subtle text-info-subtle-foreground hover:bg-info-subtle/80 focus-visible:ring-info/40' },
      { color: 'info', style: 'outline', class: 'bg-transparent text-info border border-info hover:bg-info hover:text-info-foreground focus-visible:ring-info/50' },
      { color: 'info', style: 'ghost', class: 'bg-transparent text-info hover:bg-info-subtle focus-visible:ring-info/40' },
      { color: 'info', style: 'surface', class: 'bg-info-subtle text-info hover:bg-info-subtle/80 focus-visible:ring-info/40' }
    ],
    defaultVariants: {
      color: 'primary',
      style: 'solid',
      size: 'sm',
      uppercase: true
    }
  }
)

const spinnerSizeClasses = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4'
} as const

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
    leftIcon?: ReactNode
    rightIcon?: ReactNode
  }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      color,
      style,
      size = 'sm',
      uppercase,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(buttonVariants({ color, style, size, uppercase }), className)}
        {...props}
      >
        {loading ? (
          <Loader2 className={cn('animate-spin', spinnerSizeClasses[size ?? 'sm'])} aria-hidden="true" />
        ) : leftIcon ? (
          <span className="shrink-0 inline-flex items-center [&>svg]:w-[1.1em] [&>svg]:h-[1.1em]" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        {/* Text stays in the DOM (just dimmed) while loading, so the accessible
            name is never dropped — screen readers still announce the label. */}
        {children && <span className={loading ? 'opacity-70' : undefined}>{children}</span>}

        {!loading && rightIcon && (
          <span className="shrink-0 inline-flex items-center [&>svg]:w-[1.1em] [&>svg]:h-[1.1em]" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'