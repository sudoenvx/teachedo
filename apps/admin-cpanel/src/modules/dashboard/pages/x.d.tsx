import type * as React from "react"
import { CheckIcon, PauseIcon, Trash2Icon } from "lucide-react"
import { Button, DataTable, DataTableActions, DataTableBody, DataTableContent, DataTableDescription, DataTableFooter, DataTableGroupBy, DataTableHead, DataTableHeader, DataTableSelectionBar, DataTableTitle, DataTableToolbar, useDataTable, type ColumnDef, type UseDataTableOptions } from "@teachedo/ui/components"


/* ==========================================================================
   Columns: define them OUTSIDE the component (or in useMemo) so their
   identity is stable between renders.
   ========================================================================== */

type Teacher = {
  id: string
  name: string
  subject: string
  status: "active" | "paused"
  students: number
}

const statusLabels: Record<Teacher["status"], string> = { active: "نشط", paused: "موقوف" }

const columns: ColumnDef<Teacher>[] = [
  { accessorKey: "name", header: "الاسم" },
  {
    accessorKey: "subject",
    header: "المادة",
    enableGrouping: true, // grouping is opt-in per column
  },
  {
    accessorKey: "status",
    header: "الحالة",
    enableGrouping: true,
    cell: ({ getValue }) => statusLabels[getValue<Teacher["status"]>()],
    meta: { formatGroupValue: (value) => statusLabels[value as Teacher["status"]] },
  },
  {
    accessorKey: "students",
    header: "الطلاب",
    aggregationFn: "sum", // shown on group rows through aggregatedCell
    aggregatedCell: ({ getValue }) => <span className="font-semibold tabular-nums">{getValue<number>()}</span>,
  },
]

/* ==========================================================================
   1. Everything composed: header, group-by, table, footer, selection bar
   ========================================================================== */

type TeachersTableProps = {
  teachers: Teacher[]
  loading?: boolean
  onSetStatus: (ids: string[], status: Teacher["status"]) => void
  onDelete: (ids: string[]) => void
}

export function TeachersTable({ teachers, loading, onSetStatus, onDelete }: TeachersTableProps) {
  const table = useDataTable({
    data: teachers,
    columns,
    getRowId: (teacher) => teacher.id, // stable ids keep the selection correct across sorting and grouping
    selectable: true,
    defaultSorting: [{ id: "name", desc: false }],
  })

  return (
    <DataTable table={table} loading={loading}>
      <DataTableHeader>
        <div className="min-w-0">
          <DataTableTitle>إدارة المدرسين</DataTableTitle>

        </div>
        <DataTableActions>
          <Button>إضافة مدرس</Button>
        </DataTableActions>
      </DataTableHeader>

      <DataTableToolbar>
        <DataTableGroupBy />
      </DataTableToolbar>

      <DataTableContent>
        <DataTableHead />
        <DataTableBody emptyMessage="لا يوجد مدرسون بعد." />
      </DataTableContent>



      {/* The operations are yours; the bar only frames them. */}
      <DataTableSelectionBar<Teacher>>
        {({ rows, clear }) => {
          const ids = rows.map((teacher) => teacher.id)
          const run = (action: () => void) => () => {
            action()
            clear()
          }
          return (
            <>
              <Button size="sm" variant="outline" onClick={run(() => onSetStatus(ids, "active"))}>
                <CheckIcon className="size-4" /> تفعيل
              </Button>
              <Button size="sm" variant="outline" onClick={run(() => onSetStatus(ids, "paused"))}>
                <PauseIcon className="size-4" /> إيقاف
              </Button>
              <Button size="sm" variant="destructive" onClick={run(() => onDelete(ids))}>
                <Trash2Icon className="size-4" /> حذف
              </Button>
            </>
          )
        }}
      </DataTableSelectionBar>
    </DataTable>
  )
}

/* ==========================================================================
   2. Minimal: <DataTable table={table} /> alone renders head and body
   ========================================================================== */

export function SimpleTeachersTable({ teachers }: { teachers: Teacher[] }) {
  const table = useDataTable({ data: teachers, columns })
  return <DataTable table={table} />
}

/* ==========================================================================
   3. Optional: keep the old all-in-one props API for quick screens.
   It is a thin wrapper over the parts, and it is yours to change.
   ========================================================================== */

type QuickDataTableProps<TData> = UseDataTableOptions<TData> & {
  title?: React.ReactNode
  description?: React.ReactNode
  toolbar?: React.ReactNode
  pagination?: React.ReactNode
  loading?: boolean
  emptyMessage?: React.ReactNode
  className?: string
}

export function QuickDataTable<TData>({
  title,
  description,
  toolbar,
  pagination,
  loading,
  emptyMessage,
  className,
  ...options
}: QuickDataTableProps<TData>) {
  const table = useDataTable(options)

  return (
    <DataTable table={table} loading={loading} className={className}>
      {(title || description || toolbar) && (
        <DataTableHeader>
          <div className="min-w-0">
            {title && <DataTableTitle>{title}</DataTableTitle>}
            {description && <DataTableDescription>{description}</DataTableDescription>}
          </div>
          {toolbar && <DataTableActions>{toolbar}</DataTableActions>}
        </DataTableHeader>
      )}

      <DataTableContent>
        <DataTableHead />
        <DataTableBody emptyMessage={emptyMessage} />
      </DataTableContent>

      {pagination && <DataTableFooter>{pagination}</DataTableFooter>}
    </DataTable>
  )
}