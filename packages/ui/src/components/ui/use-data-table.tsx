"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react"
import {
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
  type GroupingState,
  type RowSelectionState,
  type SortingState,
  type Table,
  type TableOptions,
  type Updater,
} from "@tanstack/react-table"

import { Checkbox } from "./checkbox"

/* ==========================================================================
   Selection column
   ========================================================================== */

export const SELECT_COLUMN_ID = "select"

/** Keeps the checkbox centered in its own narrow column. */
function SelectionCell({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-center">{children}</div>
}

export function createSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: SELECT_COLUMN_ID,
    size: 40,
    enableSorting: false,
    enableHiding: false,
    enableGrouping: false,
    header: ({ table }) => (
      <SelectionCell>
        <Checkbox
          aria-label="تحديد الكل"
          className="after:inset-0"
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onCheckedChange={(checked) => table.toggleAllRowsSelected(Boolean(checked))}
        />
      </SelectionCell>
    ),
    cell: ({ row }) => (
      <SelectionCell>
        <Checkbox
          aria-label={`تحديد الصف ${row.index + 1}`}
          className="after:inset-0"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
        />
      </SelectionCell>
    ),
  }
}

/* ==========================================================================
   Controllable state
   Works controlled (value + onChange) or uncontrolled (default value). The
   latest value lives in a ref, so several updates in one tick never read a
   stale closure.
   ========================================================================== */

function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
) {
  const [internal, setInternal] = React.useState(defaultValue)
  const value = controlled ?? internal
  const latest = React.useRef({ value, controlled, onChange })

  React.useEffect(() => {
    latest.current = { value, controlled, onChange }
  })

  const setValue = React.useCallback((updater: Updater<T>) => {
    const { value: current, controlled: isControlled, onChange: notify } = latest.current
    const next = typeof updater === "function" ? (updater as (old: T) => T)(current) : updater
    latest.current.value = next
    if (isControlled === undefined) setInternal(next)
    notify?.(next)
  }, [])

  return [value, setValue] as const
}

/* ==========================================================================
   useDataTable
   ========================================================================== */

export type UseDataTableOptions<TData> = {
  data: TData[]
  columns: ColumnDef<TData, any>[]
  getRowId?: TableOptions<TData>["getRowId"]

  /** Prepends a checkbox column and enables row selection. */
  selectable?: boolean
  onSelectionChange?: (rows: TData[]) => void

  sorting?: SortingState
  defaultSorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void

  /** Grouping is opt-in per column: set `enableGrouping: true` on the columns users may group by. */
  grouping?: GroupingState
  defaultGrouping?: GroupingState
  onGroupingChange?: (grouping: GroupingState) => void
  /** `true` opens every group. Also applied whenever the grouping changes. */
  defaultExpanded?: ExpandedState
  /** `remove` hides the grouped column (its value is on the group row). */
  groupedColumnMode?: TableOptions<TData>["groupedColumnMode"]

  /** Escape hatch: any other TanStack option (pagination, filtering, column visibility...). */
  tableOptions?: Partial<TableOptions<TData>>
}

export function useDataTable<TData>({
  data,
  columns,
  getRowId,
  selectable = false,
  onSelectionChange,
  sorting: sortingProp,
  defaultSorting = [],
  onSortingChange,
  grouping: groupingProp,
  defaultGrouping = [],
  onGroupingChange,
  defaultExpanded = true,
  groupedColumnMode = "remove",
  tableOptions,
}: UseDataTableOptions<TData>): Table<TData> {
  const [sorting, setSorting] = useControllableState(sortingProp, defaultSorting, onSortingChange)
  const [grouping, setGrouping] = useControllableState(groupingProp, defaultGrouping, onGroupingChange)
  const [expanded, setExpanded] = React.useState<ExpandedState>(defaultExpanded)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const resolvedColumns = React.useMemo<ColumnDef<TData, any>[]>(
    () => (selectable ? [createSelectionColumn<TData>(), ...columns] : columns),
    [columns, selectable]
  )

  const table = useReactTable<TData>({
    data,
    columns: resolvedColumns,
    state: { sorting, grouping, expanded, rowSelection },
    getRowId,
    enableRowSelection: selectable,
    enableMultiSort: false,
    sortDescFirst: false, // none -> asc -> desc -> none, for every column type
    autoResetExpanded: false, // expansion is owned by the state above, not reset on new data
    groupedColumnMode,
    defaultColumn: { enableGrouping: false },
    onSortingChange: setSorting,
    onGroupingChange: (updater) => {
      setGrouping(updater)
      setExpanded(defaultExpanded)
    },
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    ...tableOptions,
  })

  /* Report the selected rows. The callback goes through a ref so an inline
     function in the parent can never re-trigger the effect. */
  const selectionCallback = React.useRef(onSelectionChange)
  React.useEffect(() => {
    selectionCallback.current = onSelectionChange
  })
  React.useEffect(() => {
    selectionCallback.current?.(table.getSelectedRowModel().rows.map((row) => row.original))
  }, [rowSelection, table])

  return table
}