"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react"
import {
  flexRender,
  type Column,
  type ColumnDef,
  type Header,
  type Row,
  type RowData,
  type Table as TanStackTable,
} from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, ChevronDownIcon, Loader2Icon } from "lucide-react"

import { cn } from "cn"

import { Button } from "./button"
import { Card, CardHeader, CardTitle } from "./card"
import { Checkbox } from "./checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { SELECT_COLUMN_ID } from "./use-data-table"

/* ==========================================================================
   Anatomy

   const table = useDataTable({ data, columns, selectable, ... })

   <DataTable table={table} loading>          context + card surface
     <DataTableHeader>                        title area (optional)
       <DataTableTitle /> <DataTableDescription /> <DataTableActions />
     <DataTableToolbar />                     row for <DataTableGroupBy />, search, filters...
     <DataTableContent>                       scroll container + <table>
       <DataTableHead />                      header cells + sorting
       <DataTableBody />                      rows, group rows, empty and loading states
     <DataTableFooter />                      pagination, totals...
     <DataTableSelectionBar />                floating bar for bulk actions

   Each part is optional. <DataTable table={table} /> alone renders the table.
   The component that calls useDataTable re-renders on every table state
   change, and the parts re-render with it.
   ========================================================================== */

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Label for the group-by menu and group rows. Falls back to a string header, then the column id. */
    label?: string
    /** Formats the value shown on a group row (e.g. an enum key to its Arabic label). */
    formatGroupValue?: (value: unknown, row: Row<TData>) => React.ReactNode
  }
}

export { type ColumnDef, type TanStackTable }

/* ---- context ------------------------------------------------------------ */

type DataTableContextValue = { table: TanStackTable<any>; loading: boolean }

const DataTableContext = React.createContext<DataTableContextValue | null>(null)

export function useDataTableContext<TData = any>() {
  const context = React.useContext(DataTableContext)
  if (!context) throw new Error("DataTable parts must be rendered inside <DataTable table={...}>.")
  return context as { table: TanStackTable<TData>; loading: boolean }
}

export function getColumnLabel(column: Column<any, unknown>): string {
  const { meta, header } = column.columnDef
  if (meta?.label) return meta.label
  return typeof header === "string" ? header : column.id
}

/* ==========================================================================
   Root and card parts
   ========================================================================== */

export type DataTableProps<TData> = Omit<React.ComponentProps<typeof Card>, "children"> & {
  table: TanStackTable<TData>
  loading?: boolean
  children?: React.ReactNode
}

function DataTable<TData>({ table, loading = false, className, children, ...props }: DataTableProps<TData>) {
  const value = React.useMemo(() => ({ table, loading }), [table, loading])

  return (
    <DataTableContext.Provider value={value}>
      <Card
        data-slot="data-table"
        className={cn("gap-0 overflow-hidden border border-border-subtle", className)}
        {...props}
      >
        {children ?? <DataTableContent />}
      </Card>
    </DataTableContext.Provider>
  )
}

function DataTableHeader({ className, ...props }: React.ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader
      data-slot="data-table-header"
      className={cn(
        "flex flex-col gap-3 border-b border-border-subtle bg-surface px-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    />
  )
}

function DataTableTitle({ className, ...props }: React.ComponentProps<typeof CardTitle>) {
  return <CardTitle data-slot="data-table-title" className={cn("truncate text-sm", className)} {...props} />
}

function DataTableDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="data-table-description"
      className={cn("m-0 mt-1 truncate text-xs text-text-muted", className)}
      {...props}
    />
  )
}

function DataTableActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="data-table-actions" className={cn("flex shrink-0 items-center gap-2", className)} {...props} />
  )
}

function DataTableToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-toolbar"
      className={cn("flex flex-wrap items-center gap-2 border-b border-border-subtle px-3 py-2", className)}
      {...props}
    />
  )
}

function DataTableFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="data-table-footer" className={cn("border-t border-border-subtle px-3 py-2", className)} {...props} />
  )
}

/* ==========================================================================
   Content
   ========================================================================== */

type DataTableContentProps = React.ComponentProps<"div"> & { tableClassName?: string }

/** Scroll container + <table>. Without children it renders the default head and body. */
function DataTableContent({ className, tableClassName, children, ...props }: DataTableContentProps) {
  return (
    <div data-slot="data-table-content" className={cn("relative overflow-x-auto", className)} {...props}>
      <Table className={cn("min-w-full border-separate border-spacing-0", tableClassName)}>
        {children ?? (
          <>
            <DataTableHead />
            <DataTableBody />
          </>
        )}
      </Table>
    </div>
  )
}

/* ---- head --------------------------------------------------------------- */

function SortButton({ column, children }: { column: Column<any, unknown>; children: React.ReactNode }) {
  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ArrowUpDownIcon

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={column.getToggleSortingHandler()} // TanStack cycles: none -> asc -> desc -> none
      className="-ms-2 gap-1.5 px-2 text-start font-medium text-text"
    >
      {children}
      <Icon className="size-3 text-text-muted" aria-hidden="true" />
    </Button>
  )
}

const selectCellClassName = "w-10 min-w-10 max-w-10 px-0"

function DataTableHeadCell({ header }: { header: Header<any, unknown> }) {
  const { column } = header
  const sorted = column.getIsSorted()
  const canSort = column.getCanSort()
  const content = header.isPlaceholder ? null : flexRender(column.columnDef.header, header.getContext())

  return (
    <TableHead
      colSpan={header.colSpan}
      aria-sort={canSort ? (sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none") : undefined}
      style={{ width: header.getSize() }}
      className={cn(
        // Borders live on the cells: `border-separate` ignores borders set on <tr>.
        "sticky top-0 z-10 h-8 border-b border-border-subtle bg-neutral-50 px-4 text-start text-[11px] font-semibold text-text",
        column.id === SELECT_COLUMN_ID && selectCellClassName
      )}
    >
      {canSort && content ? <SortButton column={column}>{content}</SortButton> : content}
    </TableHead>
  )
}

function DataTableHead({ className, ...props }: React.ComponentProps<typeof TableHeader>) {
  const { table } = useDataTableContext()

  return (
    <TableHeader className={className} {...props}>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id} className="border-b-0 hover:bg-transparent">
          {headerGroup.headers.map((header) => (
            <DataTableHeadCell key={header.id} header={header} />
          ))}
        </TableRow>
      ))}
    </TableHeader>
  )
}

/* ---- rows --------------------------------------------------------------- */

const cellClassName = "border-b border-border-subtle px-4 py-3 text-start text-xs"

function DataTableRow<TData>({
  row,
  onClick,
  className,
}: {
  row: Row<TData>
  onClick?: (row: Row<TData>) => void
  className?: string
}) {
  return (
    <TableRow
      data-state={row.getIsSelected() ? "selected" : undefined}
      onClick={onClick ? () => onClick(row) : undefined}
      className={cn(
        "hover:bg-neutral-100/50 data-[state=selected]:bg-primary-subtle/40",
        onClick && "cursor-pointer",
        className
      )}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className={cn(cellClassName, cell.column.id === SELECT_COLUMN_ID && selectCellClassName)}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

/* ---- group row ---------------------------------------------------------- */

const leafRowsOf = (row: Row<any>) => row.getLeafRows().filter((leaf) => !leaf.getIsGrouped())

function DefaultGroupLabel({ row, count }: { row: Row<any>; count: number }) {
  const { table } = useDataTableContext()
  const column = row.groupingColumnId ? table.getColumn(row.groupingColumnId) : undefined
  const value = row.groupingValue
  const formatted =
    column?.columnDef.meta?.formatGroupValue?.(value, row) ??
    (value === null || value === undefined || value === "" ? "غير محدد" : String(value))

  return (
    <>
      {column && <span className="text-text-muted">{getColumnLabel(column)}:</span>}
      <span className="font-semibold text-text">{formatted}</span>
      <span className="rounded-full bg-neutral-200/70 px-1.5 py-px text-[10px] font-medium tabular-nums text-text-muted">
        {count}
      </span>
    </>
  )
}

/**
 * One row per group: chevron, "column: value", item count, and (when the table
 * is selectable) a checkbox that selects the whole group. Columns that define
 * `aggregatedCell` show their aggregate in their own cell.
 */
function DataTableGroupRow<TData>({
  row,
  renderLabel,
}: {
  row: Row<TData>
  renderLabel?: (row: Row<TData>) => React.ReactNode
}) {
  const { table } = useDataTableContext<TData>()
  const cells = row.getVisibleCells()
  const selectCell = cells.find((cell) => cell.column.id === SELECT_COLUMN_ID)
  const dataCells = cells.filter((cell) => cell.column.id !== SELECT_COLUMN_ID)
  const hasAggregates = dataCells.some((cell) => cell.column.columnDef.aggregatedCell)

  const leaves = leafRowsOf(row)
  const selectedCount = leaves.filter((leaf) => leaf.getIsSelected()).length
  const expanded = row.getIsExpanded()

  const toggleSelection = (value: boolean) =>
    table.setRowSelection((old) => {
      const next = { ...old }
      for (const leaf of leaves) {
        if (!leaf.getCanSelect()) continue
        if (value) next[leaf.id] = true
        else delete next[leaf.id]
      }
      return next
    })

  return (
    <TableRow
      data-slot="data-table-group-row"
      data-state={expanded ? "open" : "closed"}
      onClick={row.getToggleExpandedHandler()}
      className="cursor-pointer bg-neutral-100/40 hover:bg-neutral-100/70"
    >
      {selectCell && (
        <TableCell className={cn(cellClassName, selectCellClassName)} onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-center">
            <Checkbox
              aria-label="تحديد المجموعة"
              className="after:inset-0"
              checked={leaves.length > 0 && selectedCount === leaves.length}
              indeterminate={selectedCount > 0 && selectedCount < leaves.length}
              onCheckedChange={(checked) => toggleSelection(Boolean(checked))}
            />
          </div>
        </TableCell>
      )}

      <TableCell colSpan={hasAggregates ? 1 : Math.max(dataCells.length, 1)} className={cn(cellClassName, "py-2")}>
        {/* The row handles the click; the button gives keyboard users the same toggle. */}
        <button
          type="button"
          aria-expanded={expanded}
          style={{ paddingInlineStart: row.depth * 20 }}
          className="flex w-full items-center gap-2 rounded-sm text-start outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronDownIcon
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 text-text-muted transition-transform",
              !expanded && "-rotate-90 rtl:rotate-90"
            )}
          />
          {renderLabel ? renderLabel(row) : <DefaultGroupLabel row={row} count={leaves.length} />}
        </button>
      </TableCell>

      {hasAggregates &&
        dataCells.slice(1).map((cell) => (
          <TableCell key={cell.id} className={cn(cellClassName, "py-2")}>
            {cell.column.columnDef.aggregatedCell
              ? flexRender(cell.column.columnDef.aggregatedCell, cell.getContext())
              : null}
          </TableCell>
        ))}
    </TableRow>
  )
}

/* ---- body --------------------------------------------------------------- */

type DataTableBodyProps<TData> = React.ComponentProps<typeof TableBody> & {
  emptyMessage?: React.ReactNode
  loadingMessage?: React.ReactNode
  onRowClick?: (row: Row<TData>) => void
  /** Replaces the default "column: value (count)" label of group rows. */
  renderGroupLabel?: (row: Row<TData>) => React.ReactNode
}

function StatusRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-32 px-4 text-center text-xs text-text-muted">
        {children}
      </TableCell>
    </TableRow>
  )
}

function DataTableBody<TData = any>({
  emptyMessage = "لا توجد بيانات للعرض.",
  loadingMessage = "جاري التحميل...",
  onRowClick,
  renderGroupLabel,
  className,
  ...props
}: DataTableBodyProps<TData>) {
  const { table, loading } = useDataTableContext<TData>()
  const rows = table.getRowModel().rows
  const colSpan = Math.max(table.getVisibleLeafColumns().length, 1)

  return (
    <TableBody className={cn("[&_tr:last-child>td]:border-b-0", className)} {...props}>
      {loading ? (
        <StatusRow colSpan={colSpan}>
          <span className="inline-flex items-center gap-2">
            <Loader2Icon className="size-4 animate-spin" /> {loadingMessage}
          </span>
        </StatusRow>
      ) : rows.length > 0 ? (
        rows.map((row) =>
          row.getIsGrouped() ? (
            <DataTableGroupRow key={row.id} row={row} renderLabel={renderGroupLabel} />
          ) : (
            <DataTableRow key={row.id} row={row} onClick={onRowClick} />
          )
        )
      ) : (
        <StatusRow colSpan={colSpan}>{emptyMessage}</StatusRow>
      )}
    </TableBody>
  )
}

export {
  DataTable,
  DataTableHeader,
  DataTableTitle,
  DataTableDescription,
  DataTableActions,
  DataTableToolbar,
  DataTableContent,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableGroupRow,
  DataTableFooter,
}