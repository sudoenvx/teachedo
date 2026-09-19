// dashed-tooltip-text.tsx
import { forwardRef, type ReactNode } from 'react'
import { cn } from 'cn'
import { Tooltip } from './tooltip' // Adjust import path if needed

type DashedTextVariant = 'primary' | 'secondary' | 'accent'

interface DashedTooltipTextProps {
  /** The text to display with the dashed underline */
  text: ReactNode
  /** The content to show inside the custom tooltip/popover */
  tooltipContent: ReactNode
  /** Visual color variant */
  variant?: DashedTextVariant
  className?: string
}

const variantStyles: Record<DashedTextVariant, string> = {
  primary: 'text-primary decoration-primary/40 hover:decoration-primary hover:text-primary-hover',
  secondary: 'text-text-muted decoration-text-muted/50 hover:decoration-text-muted hover:text-text',
  accent: 'text-accent decoration-accent/40 hover:decoration-accent hover:text-accent-hover',
}

export const DashedTooltipText = forwardRef<HTMLSpanElement, DashedTooltipTextProps>(
  ({ text, tooltipContent, variant = 'secondary', className }, ref) => {
    return (
      <Tooltip content={tooltipContent} side="top">
        <span
          ref={ref}
          // tabIndex={0} makes the span keyboard-focusable so the tooltip works for all users
          tabIndex={0}
          className={cn(
            'inline-flex cursor-help rounded-xs underline decoration-dashed underline-offset-4 transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1',
            variantStyles[variant],
            className
          )}
        >
          {text}
        </span>
      </Tooltip>
    )
  }
)
DashedTooltipText.displayName = 'DashedTooltipText'