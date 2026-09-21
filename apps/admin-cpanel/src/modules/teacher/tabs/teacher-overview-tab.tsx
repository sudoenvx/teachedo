import { useMemo } from 'react'
import { Users2 } from 'lucide-react'
import { Badge, DataTable, type DataTableColumn } from '@teachedo/ui/legacy'
import type { GroupItem } from '../types/teacher-profile.types'

export function TeacherOverviewTab({ groups }: { groups: GroupItem[] }) {
  const columns = useMemo<DataTableColumn<GroupItem>[]>(() => [
    { header: 'اسم المجموعة', accessor: 'groupName', render: (row) => <div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary/10 text-secondary"><Users2 size={14} /></div><span className="font-bold text-[12px] text-text">{row.groupName}</span></div> },
    { header: 'الاشتراك الشهري', accessor: 'standardMonthlyFee', render: (row) => <span className="font-semibold tabular-nums text-primary">{row.standardMonthlyFee ? `${row.standardMonthlyFee} ج.م` : 'غير محدد'}</span> },
    { header: 'السعة القصوى', accessor: 'maxCapacity', render: (row) => <span className="tabular-nums text-text-muted">{row.maxCapacity ? `${row.maxCapacity} طالب` : 'غير محدودة'}</span> },
    { header: 'الطلاب المسجلين', render: (row) => <Badge variant="primary" size="sm">{row._count?.enrollments || 0} طالب</Badge> },
  ], [])

  return <DataTable title="المجموعات الدراسية" description="قائمة بجميع المجموعات التابعة لهذا المدرس ومعدل الإشغال." data={groups} columns={columns} getRowId={(row) => String(row.id)} />
}
