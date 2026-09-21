"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import { XIcon } from "lucide-react"

import { cn } from "cn"

import { Button } from "./button"
import { useDataTableContext } from "./data-table"

type SelectionBarContext<TData> = {
  rows: TData[]
  table: TanStackTable<TData>
  clear: () => void
}

type DataTableSelectionBarProps<TData> = Omit<React.ComponentProps<"div">, "children"> & {
  /** Your bulk operations: plain nodes, or a function that receives the selected rows. */
  children?: React.ReactNode | ((context: SelectionBarContext<TData>) => React.ReactNode)
  /** Text after the count. */
  label?: React.ReactNode
  clearLabel?: string
}

/**
 * Floating bar that slides in while at least one row is selected and slides
 * away when the selection is cleared. It only renders the frame (count, clear
 * button); the operations are yours.
 */
function DataTableSelectionBar<TData = any>({
  children,
  label = "محدد",
  clearLabel = "إلغاء التحديد",
  className,
  ...props
}: DataTableSelectionBarProps<TData>) {
  const { table } = useDataTableContext<TData>()
  const rows = table.getSelectedRowModel().rows.map((row) => row.original)
  const count = rows.length
  const open = count > 0

  // Keep showing the last count while the bar slides out.
  const [lastCount, setLastCount] = React.useState(count)
  React.useEffect(() => {
    if (count > 0) setLastCount(count)
  }, [count])

  const clear = React.useCallback(() => table.setRowSelection({}), [table])

  return (
    <div
      role="region"
      aria-label="العناصر المحددة"
      data-slot="data-table-selection-bar"
      data-state={open ? "open" : "closed"}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4",
        "transition-[opacity,transform,visibility] duration-200",
        open ? "visible translate-y-0 opacity-100" : "invisible translate-y-4 opacity-0",
        className
      )}
      {...props}
    >
      <div className="pointer-events-auto flex max-w-full items-center gap-1.5 overflow-x-auto rounded-lg border border-border-subtle bg-surface p-1.5 shadow-elevated">
        <span className="whitespace-nowrap ps-2 pe-1 text-xs font-medium text-text" aria-live="polite">
          <span className="tabular-nums">{count || lastCount}</span> {label}
        </span>

        <span aria-hidden="true" className="mx-1 h-4 w-px shrink-0 bg-border" />

        {typeof children === "function" ? children({ rows, table, clear }) : children}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={clearLabel}
          title={clearLabel}
          onClick={clear}
          className="size-7 shrink-0 p-0"
        >
          <XIcon className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

export { DataTableSelectionBar }