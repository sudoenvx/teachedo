import * as React from "react"
import { InfoIcon, RotateCcwIcon, SaveIcon } from "lucide-react"

import { cn } from "cn"

import { Button } from "./button"

export type FloatingFormActionsProps = {
  open?: boolean
  dirty?: boolean
  message?: React.ReactNode
  saveLabel?: string
  resetLabel?: string
  savingLabel?: string
  saving?: boolean
  onSave: () => void
  onReset: () => void
  className?: string
}

function FloatingFormActions({
  open = true,
  dirty = true,
  message = "لديك تغييرات غير محفوظة",
  saveLabel = "حفظ",
  resetLabel = "إعادة ضبط",
  savingLabel = "جاري الحفظ...",
  saving = false,
  onSave,
  onReset,
  className,
}: FloatingFormActionsProps) {
  if (!open || !dirty) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-4 bottom-5 z-50 mx-auto flex w-fit max-w-full items-center gap-3 rounded-full border border-border bg-surface px-2 py-2 text-text shadow-elevated sm:inset-x-auto sm:px-2.5",
        className,
      )}
    >
      <span className="flex min-w-0 items-center gap-2 px-2 text-xs font-medium">
        <InfoIcon className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
        <span className="truncate">{message}</span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onReset}
        disabled={saving}
        className="shrink-0"
      >
        <RotateCcwIcon aria-hidden="true" />
        {resetLabel}
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={onSave}
        disabled={saving}
        aria-busy={saving}
        className="shrink-0"
      >
        <SaveIcon aria-hidden="true" />
        {saving ? savingLabel : saveLabel}
      </Button>
    </div>
  )
}

export { FloatingFormActions }