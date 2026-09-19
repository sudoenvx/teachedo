import { Home } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from 'cn'

export type ToolbarProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  /** Content displayed beside the fixed home icon. Accepts text or custom content. */
  leading?: ReactNode
  /** Actions or other content displayed at the opposite side of the toolbar. */
  trailing?: ReactNode
}

export function Toolbar({ leading, trailing, className, ...props }: ToolbarProps) {
  return (
    <header
      className={cn(
        'flex items-center  justify-between gap-3 rounded-sm bg-creamy p-1.5',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <a href={"/"}>
          <span
            aria-hidden="true"
            className="inline-flex p-1.5 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground"
          >
            <Home className="h-4.5 w-4.5" strokeWidth={1.8} />
          </span>
        </a>

        {leading && <div className="min-w-0 truncate flex items-center px-1 h-full">{leading}</div>}
      </div>

      {trailing && <div className="flex shrink-0 items-center gap-1.5">{trailing}</div>}
    </header>
  )
}
