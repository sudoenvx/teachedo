import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "cn"

import { Button } from "./button"

export type CopyButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "onClick"
> & {
  value: string
  label?: string
  copiedLabel?: string
}

function CopyButton({
  value,
  label = "نسخ",
  copiedLabel = "تم النسخ",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  const copyValue = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Button
      {...props}
      type="button"
      variant="ghost"
      size="icon-md"
      className={cn("text-text-muted hover:text-primary", className)}
      aria-label={copied ? copiedLabel : `${label} ${value}`}
      title={copied ? copiedLabel : label}
      onClick={copyValue}
    >
      {copied ? <CheckIcon className="text-success" aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
    </Button>
  )
}

export { CopyButton }