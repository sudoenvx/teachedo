import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Layers,
  ListFilter,
  ChevronRight,
  ArrowDownNarrowWideIcon,
  ArrowUpDownIcon,
  ArrowUpNarrowWide,
} from 'lucide-react'
import { cn } from 'cn'
import { Card } from './card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { Checkbox } from './checkbox'
import { useTableStore } from '../../hooks/use-table-store'

// ── existing types unchanged ──────────────────────────────────────
export interface DataTableColumn<T> {
  id?: string // مُعرف فريد للعمود (مهم إذا كنت ستستخدم خاصية إخفاء الأعمدة أو الفرز)
  header: string
  accessor?: keyof T
  render?: (item: T) => React.ReactNode
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
export type SortDirection = 'asc' | 'desc'
export interface SortState {
  columnId: string
  direction: SortDirection
}

export interface DataTableGroupConfig<T> {
  accessor: keyof T | ((item: T) => string)
  renderGroupHeader?: (groupKey: string, items: T[]) => React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  groupHeaderClassName?: string
}

// ── NEW: selectable grouping option ───────────────────────────────
export interface DataTableGroupingOption<T> {
  /** Stable id for this option. Falls back to accessor/label if omitted
   *  — same pattern as getColumnId, so most callers never need to set it. */
  id?: string
  /** Human-readable label shown in the dropdown and in the trigger button. */
  label: string
  /** Optional icon shown beside the selected grouping label. */
  icon?: React.ReactNode
  accessor: keyof T | ((item: T) => string)
  renderGroupHeader?: (groupKey: string, items: T[]) => React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  groupHeaderClassName?: string
}

export interface SelectionToolbarContext {
  selectedIds: string[]
  clearSelection: () => void
  count: number
}

export interface DataTableProps<T> {
  title?: React.ReactNode
  description?: React.ReactNode
  tableActions?: React.ReactNode
  persistedKey?: string

  data: T[]
  columns: DataTableColumn<T>[]
  getRowId: (item: T) => string
  striped?: boolean

  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  selectionToolbar?: (ctx: SelectionToolbarContext) => React.ReactNode

  sortState?: SortState | null
  defaultSortState?: SortState | null
  onSortChange?: (sort: SortState | null) => void

  /** Fixed, single grouping config — unchanged legacy behavior. Ignored
   *  if `groupingOptions` is provided. */
  grouping?: DataTableGroupConfig<T>

  /** NEW: a list of grouping methods the admin can pick between via a
   *  compact dropdown in the table header. Pass this instead of
   *  `grouping` to let the admin choose "no grouping" or any option. */
  groupingOptions?: DataTableGroupingOption<T>[]
  /** Controlled selected grouping id. `null` = no grouping. */
  groupBy?: string | null
  defaultGroupBy?: string | null
  onGroupByChange?: (id: string | null) => void

  pagination?: React.ReactNode
  loading?: boolean
  skeletonRows?: number
  emptyMessage?: React.ReactNode
  dir?: 'rtl' | 'ltr'
  className?: string
  rowClassName?: (item: T) => string
  onRowClick?: (item: T) => void
}

function getColumnId<T>(col: DataTableColumn<T>, index: number): string {
  return col.id || (typeof col.accessor === 'string' ? col.accessor : col.header) || `col-${index}`
}

function getGroupOptionId<T>(option: DataTableGroupingOption<T>, index: number): string {
  return (
    option.id ||
    (typeof option.accessor === 'string' ? option.accessor : option.label) ||
    `group-option-${index}`
  )
}

function getGroupKey<T>(item: T, accessor: DataTableGroupConfig<T>['accessor']): string {
  const value = typeof accessor === 'function' ? accessor(item) : (item[accessor] as unknown)
  return value === null || value === undefined ? '' : String(value)
}

function SortIcon({ direction }: { direction: SortDirection | null }) {
  const baseStyle = 'text-text-muted group-hover:text-text'
  if (direction === 'asc') return <ArrowDownNarrowWideIcon className={cn(baseStyle, 'w-3 h-3')} />
  if (direction === 'desc') return <ArrowUpNarrowWide className={cn(baseStyle, 'w-3 h-3')} />
  return <ArrowUpDownIcon className={cn(baseStyle, 'w-2.5 h-2.5')} />
}

export function DataTable<T>({
  title,
  description,
  tableActions,
  persistedKey,
  data,
  columns,
  getRowId,
  striped = false,
  selectable = false,
  selectedIds,
  onSelectionChange,
  selectionToolbar,
  sortState: controlledSortState,
  defaultSortState = null,
  onSortChange,
  grouping: fixedGrouping,
  groupingOptions,
  groupBy: controlledGroupBy,
  defaultGroupBy = null,
  onGroupByChange,
  pagination,
  loading = false,
  skeletonRows = 6,
  emptyMessage = 'لا توجد بيانات للعرض.',
  dir = 'rtl',
  className,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  const { hiddenColumns: allHiddenColumns } = useTableStore()
  const hiddenColumns = persistedKey ? allHiddenColumns[persistedKey] || [] : []

  const visibleColumns = useMemo(
    () => columns.filter((col, i) => !hiddenColumns.includes(getColumnId(col, i))),
    [columns, hiddenColumns]
  )

  // ── NEW: selectable grouping state ────────────────────────────
  const hasGroupingOptions = !!groupingOptions && groupingOptions.length > 0
  const [internalGroupBy, setInternalGroupBy] = useState<string | null>(defaultGroupBy)
  const groupBy = controlledGroupBy !== undefined ? controlledGroupBy : internalGroupBy

  const setGroupBy = (id: string | null) => {
    onGroupByChange?.(id)
    if (controlledGroupBy === undefined) setInternalGroupBy(id)
  }

  const activeGroupOption = useMemo(() => {
    if (!hasGroupingOptions || groupBy === null) return undefined
    return groupingOptions!.find((opt, i) => getGroupOptionId(opt, i) === groupBy)
  }, [groupingOptions, hasGroupingOptions, groupBy])

  // Resolves to whichever grouping is actually active this render:
  // the picked option (if groupingOptions is used) or the legacy fixed
  // `grouping` prop (if not) — the rest of the component below doesn't
  // need to know which mode produced it.
  const grouping: DataTableGroupConfig<T> | undefined = hasGroupingOptions
    ? activeGroupOption
    : fixedGrouping

  // Collapsed/expanded state is per grouping-key, so switching grouping
  // method with stale toggles would show meaningless expand states —
  // reset on every method change.
  const [toggledGroups, setToggledGroups] = useState<Set<string>>(new Set())
  useEffect(() => {
    setToggledGroups(new Set())
  }, [groupBy])

  // ── Selection (unchanged) ─────────────────────────────────────
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set())
  const selected = selectedIds ? new Set(selectedIds) : internalSelected
  const setSelected = (next: Set<string>) => {
    onSelectionChange?.(Array.from(next))
    if (!selectedIds) setInternalSelected(next)
  }
  const clearSelection = () => setSelected(new Set())
  const currentPageIds = useMemo(() => data.map(getRowId), [data, getRowId])
  const selectedOnPageCount = currentPageIds.filter((id) => selected.has(id)).length
  const allOnPageSelected = data.length > 0 && selectedOnPageCount === data.length
  const someOnPageSelected = selectedOnPageCount > 0 && !allOnPageSelected
  const toggleSelectAll = () => {
    const next = new Set(selected)
    if (allOnPageSelected) currentPageIds.forEach((id) => next.delete(id))
    else currentPageIds.forEach((id) => next.add(id))
    setSelected(next)
  }
  const toggleRow = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  // ── Sorting (unchanged) ────────────────────────────────────────
  const [internalSortState, setInternalSortState] = useState<SortState | null>(defaultSortState)
  const sortState = controlledSortState !== undefined ? controlledSortState : internalSortState
  const updateSort = (updater: (prev: SortState | null) => SortState | null) => {
    const next = updater(sortState)
    onSortChange?.(next)
    if (controlledSortState === undefined) setInternalSortState(next)
  }
  const handleSortClick = (col: DataTableColumn<T>, index: number) => {
    if (!col.sortable) return
    const id = getColumnId(col, index)
    updateSort((prev) => {
      if (!prev || prev.columnId !== id) return { columnId: id, direction: 'asc' }
      if (prev.direction === 'asc') return { columnId: id, direction: 'desc' }
      return null
    })
  }
  const sortedData = useMemo(() => {
    if (!sortState) return data
    const colIndex = visibleColumns.findIndex((c, i) => getColumnId(c, i) === sortState.columnId)
    if (colIndex === -1) return data
    const col = visibleColumns[colIndex]
    const getValue =
      col?.sortAccessor ?? ((item: T) => (col?.accessor ? (item[col.accessor] as any) : undefined))
    return [...data].sort((a, b) => {
      const va = getValue(a)
      const vb = getValue(b)
      if (va == null && vb == null) return 0
      if (va == null) return sortState.direction === 'asc' ? -1 : 1
      if (vb == null) return sortState.direction === 'asc' ? 1 : -1
      if (va < vb) return sortState.direction === 'asc' ? -1 : 1
      if (va > vb) return sortState.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortState, visibleColumns])

  // ── Grouping (unchanged logic, now fed by resolved `grouping` above) ──
  const groupedData = useMemo(() => {
    if (!grouping) return null
    const map = new Map<string, T[]>()
    sortedData.forEach((item) => {
      const key = getGroupKey(item, grouping.accessor)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    })
    return map
  }, [sortedData, grouping])

  const isGroupCollapsed = (key: string) => {
    const flipped = toggledGroups.has(key)
    return grouping?.defaultCollapsed ? !flipped : flipped
  }
  const toggleGroup = (key: string) => {
    setToggledGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // ── Column layout/pinning (unchanged) ───────────────────────────
  const checkboxIndex = selectable ? 0 : -1
  const columnStartIndex = selectable ? 1 : 0
  const colCount = (selectable ? 1 : 0) + visibleColumns.length

  const pinnedMap = useMemo(() => {
    const map: Record<number, 'start' | 'end'> = {}
    if (selectable) map[checkboxIndex] = 'start'
    visibleColumns.forEach((col, i) => {
      if (col.pinned) map[columnStartIndex + i] = col.pinned
    })
    return map
  }, [visibleColumns, selectable, checkboxIndex, columnStartIndex])

  const hasPinnedColumns = Object.keys(pinnedMap).length > 0
  const wrapperRef = useRef<HTMLDivElement>(null)
  const headerCellRefs = useRef<(HTMLTableCellElement | null)[]>([])
  const [pinOffsets, setPinOffsets] = useState<Record<number, number>>({})

  useLayoutEffect(() => {
    if (!hasPinnedColumns) return
    const computeOffsets = () => {
      const offsets: Record<number, number> = {}
      let runningStart = 0
      for (let i = 0; i < colCount; i++) {
        if (pinnedMap[i] === 'start') {
          offsets[i] = runningStart
          runningStart += headerCellRefs.current[i]?.offsetWidth ?? 0
        }
      }
      let runningEnd = 0
      for (let i = colCount - 1; i >= 0; i--) {
        if (pinnedMap[i] === 'end') {
          offsets[i] = runningEnd
          runningEnd += headerCellRefs.current[i]?.offsetWidth ?? 0
        }
      }
      setPinOffsets((prev) => {
        const prevKeys = Object.keys(prev)
        const newKeys = Object.keys(offsets)
        if (prevKeys.length !== newKeys.length) return offsets
        for (const key of newKeys) {
          if (prev[Number(key)] !== offsets[Number(key)]) return offsets
        }
        return prev
      })
    }
    computeOffsets()
    const ro = new ResizeObserver(computeOffsets)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    window.addEventListener('resize', computeOffsets)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', computeOffsets)
    }
  }, [pinnedMap, colCount, hasPinnedColumns, data.length, visibleColumns.length])

  const pinnedStyle = (index: number): React.CSSProperties | undefined => {
    const side = pinnedMap[index]
    if (!side) return undefined
    return {
      position: 'sticky',
      [side === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: pinOffsets[index] ?? 0,
      zIndex: 1,
    }
  }

  const renderRow = (item: T, rowIndex: number) => {
    const id = getRowId(item)
    const isSelected = selected.has(id)
    const rowBg = isSelected
      ? 'bg-neutral-100'
      : striped && rowIndex % 2 !== 0
        ? 'bg-surface-secondary'
        : 'bg-surface'

    return (
      <tr
        key={id}
        className={cn(
          'transition-colors border-t border-border',
          !selectable && 'hover:bg-surface-secondary',
          onRowClick && 'cursor-pointer',
          rowBg,
          rowClassName?.(item)
        )}
        onClick={() => onRowClick?.(item)}
      >
        {selectable && (
          <td style={pinnedStyle(checkboxIndex)} className={cn('w-8 bg-neutral-100 px-1.5 py-2', rowBg)}>
            <Checkbox checked={isSelected} onCheckedChange={() => toggleRow(id)} />
          </td>
        )}
        {visibleColumns.map((col, i) => {
          const index = columnStartIndex + i
          return (
            <td
              key={index}
              style={pinnedStyle(index)}
              className={cn(
                'whitespace-nowrap px-2 py-2',
                pinnedMap[index] && rowBg,
                col.cellClassName
              )}
            >
              {col.render
                ? col.render(item)
                : col.accessor
                  ? (item[col.accessor] as React.ReactNode)
                  : null}
            </td>
          )
        })}
      </tr>
    )
  }

  return (
    <Card className={cn('flex flex-col overflow-hidden border-none rounded-lg', className)}>
      {(title || description || tableActions || persistedKey || hasGroupingOptions) && (
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-col">
            {title && <h3 className="truncate text-[13px] font-bold text-text">{title}</h3>}
            {description && <p className="truncate text-[11px] text-text-muted">{description}</p>}
          </div>

          <div className="flex justify-between items-center gap-2">
            {/* ── NEW: grouping method selector ──────────────────
                A single compact dropdown, not a row of toggle buttons —
                stays out of the way at any number of options, and its
                own label already communicates the current state, so no
                separate "grouped by: X" indicator is needed elsewhere. */}
            {hasGroupingOptions && (
              <Select
                value={groupBy ?? 'no_grouping'}
                onValueChange={(value) => setGroupBy(value === 'no_grouping' ? null : value)}
              >
                <SelectTrigger
                  size="sm"
                  aria-label="التجميع حسب"
                >
                  <SelectValue placeholder="تجميع حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_grouping">
                    <span className="flex items-center gap-2">
                      <ListFilter size={14} />
                      بدون تجميع
                    </span>
                  </SelectItem>
                  {groupingOptions!.map((option, index) => (
                    <SelectItem key={getGroupOptionId(option, index)} value={getGroupOptionId(option, index)}>
                      <span className="flex items-center gap-2">
                        {option.icon ?? <Layers size={14} />}
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {tableActions}
          </div>
        </div>
      )}

      <div ref={wrapperRef} className="overflow-x-auto">
        <table dir={dir} className="w-full text-[11px]/normal">
          <thead className='bg-muted text-text'>
            <tr>
              {selectable && (
                <th
                  ref={(el) => {
                    headerCellRefs.current[checkboxIndex] = el
                  }}
                  style={pinnedStyle(checkboxIndex)}
                  className="w-8 bg-muted px-1.5 py-1.5"
                >
                  <Checkbox
                    checked={allOnPageSelected}
                    indeterminate={someOnPageSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
              )}
              {visibleColumns.map((col, i) => {
                const index = columnStartIndex + i
                const id = getColumnId(col, i)
                const isSorted = sortState?.columnId === id
                return (
                  <th
                    key={index}
                    ref={(el) => {
                      headerCellRefs.current[index] = el
                    }}
                    style={{ width: col.width, ...pinnedStyle(index) }}
                    aria-sort={
                      isSorted
                        ? sortState!.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={cn(
                      'whitespace-nowrap px-2.5 py-1.5 text-start text-text/65 text-[12px] font-bold uppercase tracking-wider',
                      col.headerClassName
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSortClick(col, i)}
                        className="inline-flex items-center gap-1 transition-colors hover:text-text group"
                      >
                        <span>{col.header}</span>
                        <SortIcon direction={isSorted ? sortState!.direction : null} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {Array.from({ length: colCount }).map((__, cellIndex) => (
                    <td key={cellIndex} className="bg-surface px-2 py-3">
                      <div className="h-4 animate-pulse rounded bg-neutral-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr className=''>
                <td
                  colSpan={colCount || 1}
                  className="py-8 text-center text-[12px] text-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : grouping && groupedData ? (
              Array.from(groupedData.entries()).flatMap(([key, items], groupIndex) => {
                const collapsed = grouping.collapsible !== false && isGroupCollapsed(key)
                const rows = [
                  <tr
                    key={`group-${key}`}
                    className={cn(
                      'bg-neutral-100',
                      grouping.collapsible !== false && 'cursor-pointer select-none',
                      grouping.groupHeaderClassName
                    )}
                    onClick={() => grouping.collapsible !== false && toggleGroup(key)}
                  >
                    <td
                      colSpan={colCount || 1}
                      className="px-2.5 py-2 text-[12px] font-semibold text-text"
                    >
                      <div className="flex items-center gap-1.5">
                        {grouping.collapsible !== false && (
                          <span
                            className={cn(
                              'inline-block transition-transform',
                              !collapsed && 'rotate-90'
                            )}
                          >
                            <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
                          </span>
                        )}
                        <div>
                          {grouping.renderGroupHeader
                            ? grouping.renderGroupHeader(key, items)
                            : `${key || '—'} (${items.length})`}
                        </div>
                      </div>
                    </td>
                  </tr>,
                ]
                if (!collapsed)
                  items.forEach((item, i) => rows.push(renderRow(item, groupIndex + i)))
                return rows
              })
            ) : (
              sortedData.map((item, rowIndex) => renderRow(item, rowIndex))
            )}
          </tbody>
        </table>

      </div>

      {pagination && data.length > 0 && !loading && (
        <div className="w-full min-w-0 overflow-hidden bg-surface ">
          <div className="w-full min-w-0 overflow-x-auto">{pagination}</div>
        </div>
      )}

      {selectable &&
        selectionToolbar?.({
          selectedIds: Array.from(selected),
          clearSelection,
          count: selected.size,
        })}
    </Card>
  )
}
