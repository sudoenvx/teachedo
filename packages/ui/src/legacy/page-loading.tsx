import { Loader2 } from 'lucide-react'
import { Typography } from './typography'
import { cn } from 'cn'

interface PageLoadingProps {
  label?: string
  className?: string
}

export function PageLoading({ label = 'جاري التحميل...', className }: PageLoadingProps) {
  return (
    <div className={cn("flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 animate-in fade-in duration-300", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface shadow-sm border border-border/50">
        <Loader2 size={24} className="animate-spin text-primary" strokeWidth={2} />
      </div>
      <Typography variant="title-small" className="text-text-muted font-medium">
        {label}
      </Typography>
    </div>
  )
}