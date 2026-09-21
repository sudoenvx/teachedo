"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react"
import { CheckIcon, GroupIcon, XIcon } from "lucide-react"

import { cn } from "cn"

import { Button } from "./button"
import { getColumnLabel, useDataTableContext } from "./data-table"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

type DataTableGroupByProps = React.ComponentProps<"div"> & {
  label?: string
  menuTitle?: string
  expandAllLabel?: string
  collapseAllLabel?: string
  clearLabel?: string
  removeLabel?: string
}

/**
 * Group-by control. One button opens a menu of the columns that opted in with
 * `enableGrouping: true`; every active group also shows as a removable chip.
 * Clicking columns in order builds multi-level groups (the menu numbers them).
 */
function DataTableGroupBy({
  label = "تجميع",
  menuTitle = "تجميع حسب",
  expandAllLabel = "توسيع الكل",
  collapseAllLabel = "طي الكل",
  clearLabel = "إزالة التجميع",
  removeLabel = "إزالة التجميع حسب",
  className,
  ...props
}: DataTableGroupByProps) {
  const { table } = useDataTableContext()
  const grouping = table.getState().grouping
  const groupable = table.getAllLeafColumns().filter((column) => column.getCanGroup())

  if (groupable.length === 0) return null

  return (
    <div data-slot="data-table-group-by" className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
      <Popover>
        <PopoverTrigger render={<Button type="button" variant="outline" size="sm" className="gap-1.5" />}>
          <GroupIcon className="size-4" aria-hidden="true" />
          {label}
          {grouping.length > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-[10px] font-medium tabular-nums text-primary-foreground">
              {grouping.length}
            </span>
          )}
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-60 border border-border-subtle bg-surface p-1.5 text-text shadow-elevated"
        >
          <p className="px-2 pb-1 pt-0.5 text-[10px] font-bold tracking-wide text-text-muted">{menuTitle}</p>

          <div className="flex flex-col gap-0.5">
            {groupable.map((column) => {
              const index = grouping.indexOf(column.id)
              const active = index !== -1
              return (
                <button
                  key={column.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => column.toggleGrouping()}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-start text-[12px] font-medium outline-none transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span className="flex-1 truncate">{getColumnLabel(column)}</span>
                  {active && grouping.length > 1 && (
                    <span className="text-[10px] tabular-nums text-text-muted">{index + 1}</span>
                  )}
                  <CheckIcon className={cn("size-3.5 text-primary", !active && "invisible")} aria-hidden="true" />
                </button>
              )
            })}
          </div>

          {grouping.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1 border-t border-border-subtle pt-1.5">
              <Button type="button" variant="ghost" size="sm" onClick={() => table.toggleAllRowsExpanded(true)}>
                {expandAllLabel}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => table.toggleAllRowsExpanded(false)}>
                {collapseAllLabel}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="ms-auto" onClick={() => table.setGrouping([])}>
                {clearLabel}
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {grouping.map((id) => {
        const column = table.getColumn(id)
        if (!column) return null
        return (
          <span
            key={id}
            className="inline-flex h-7 items-center gap-1 rounded-sm border border-border-subtle bg-neutral-100 ps-2 pe-0.5 text-[11px] font-medium text-text"
          >
            {getColumnLabel(column)}
            <button
              type="button"
              aria-label={`${removeLabel} ${getColumnLabel(column)}`}
              onClick={() => column.toggleGrouping()}
              className="inline-flex size-5 items-center justify-center rounded-sm text-text-muted outline-none transition-colors hover:bg-neutral-200 hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
            >
              <XIcon className="size-3" aria-hidden="true" />
            </button>
          </span>
        )
      })}
    </div>
  )
}

export { DataTableGroupBy }