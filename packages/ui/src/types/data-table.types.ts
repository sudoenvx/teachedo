import type { ReactNode } from 'react'

// ── Columns ──────────────────────────────────────────────────────────
export interface DataTableColumn<T> {
  id?: string // مُعرف فريد للعمود (مهم إذا كنت ستستخدم خاصية إخفاء الأعمدة أو الفرز)
  header: string
  accessor?: keyof T
  render?: (item: T) => ReactNode
  className?: string
  headerClassName?: string
  cellClassName?: string
  pinned?: 'start' | 'end'
  width?: number | string

  // ---- Sorting ----
  sortable?: boolean
  // إن لم يتم تمريرها، سيتم الفرز على أساس accessor مباشرة
  sortAccessor?: (item: T) => string | number | Date | null | undefined
}

// ── Sorting ──────────────────────────────────────────────────────────
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  columnId: string
  direction: SortDirection
}

// ── Grouping ─────────────────────────────────────────────────────────
export interface DataTableGroupConfig<T> {
  accessor: keyof T | ((item: T) => string)
  renderGroupHeader?: (groupKey: string, items: T[]) => ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  groupHeaderClassName?: string
}

export interface DataTableGroupingOption<T> {
  /** Stable id for this option. Falls back to accessor/label if omitted */
  id?: string
  /** Human-readable label shown in the dropdown and in the trigger button. */
  label: string
  /** Optional icon shown beside the selected grouping label. */
  icon?: ReactNode
  accessor: keyof T | ((item: T) => string)
  renderGroupHeader?: (groupKey: string, items: T[]) => ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  groupHeaderClassName?: string
}

// ── Selection ────────────────────────────────────────────────────────
export interface SelectionToolbarContext {
  selectedIds: string[]
  clearSelection: () => void
  count: number
}

// ── Main Props ───────────────────────────────────────────────────────
export interface DataTableProps<T> {
  // --- Header ---
  title?: ReactNode
  description?: ReactNode
  tableActions?: ReactNode
  persistedKey?: string

  // --- Core ---
  data: T[]
  columns: DataTableColumn<T>[]
  getRowId: (item: T) => string
  striped?: boolean

  // --- Actions Column ---
  actions?: (item: T) => ReactNode
  actionsHeader?: ReactNode
  pinActions?: boolean

  // --- Selection ---
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  selectionToolbar?: (ctx: SelectionToolbarContext) => ReactNode

  // --- Sorting ---
  sortState?: SortState | null
  defaultSortState?: SortState | null
  onSortChange?: (sort: SortState | null) => void

  // --- Grouping ---
  /** Fixed, single grouping config. Ignored if `groupingOptions` is provided. */
  grouping?: DataTableGroupConfig<T>
  /** A list of grouping methods the admin can pick between via a compact dropdown */
  groupingOptions?: DataTableGroupingOption<T>[]
  groupBy?: string | null
  defaultGroupBy?: string | null
  onGroupByChange?: (id: string | null) => void

  // --- Misc & UI ---
  pagination?: ReactNode
  loading?: boolean
  skeletonRows?: number
  emptyMessage?: ReactNode
  dir?: 'rtl' | 'ltr'
  className?: string
  rowClassName?: (item: T) => string
  onRowClick?: (item: T) => void
}