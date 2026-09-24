import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Edit3,
  GraduationCap,
  Plus,
  ContactRound,
  Group,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  IconButton,
  InputGroup,
  InputGroupInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@teachedo/ui/components'
import { useDebounce } from '@/core/hooks/use_debounce'
import { useNotification } from '@/core/hooks/use_notification'
import { useDeleteStudent } from '../api/students.mutations'
import { useStudentStats, useStudentsList } from '../api/students.queries'
import type { StudentListItem } from '../types/student.types'
import { useTeacherMe } from '@/modules/authentication/api/auth.queries'
import {
  DataTable,
  type DataTableColumn,
} from '@teachedo/ui/components'
import {
  Breadcrumb,
  PageHeader,
  Pagination,
  StatisticCard,
} from '@teachedo/ui/legacy'

const statusMap: Record<string, { label: string; variant: 'success' | 'danger' }> = {
  active: { label: 'نشط', variant: 'success' },
  inactive: { label: 'غير نشط', variant: 'danger' },
}

export default function StudentsPage() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [stageId, setStageId] = useState('')
  const [classId, setClassId] = useState('')
  const [studentToDelete, setStudentToDelete] = useState<StudentListItem | null>(null)
  const debouncedSearch = useDebounce(search, 350)
  const { data: result, isLoading } = useStudentsList(
    page,
    debouncedSearch,
    undefined,
    stageId,
    classId
  )
  const { data: stats, isLoading: statsLoading } = useStudentStats()
  const { data: teacher } = useTeacherMe()
  const deleteMutation = useDeleteStudent()
  const selectedStageLabel = stageId
    ? teacher?.studyStages?.find((stage) => String(stage.id) === stageId)?.stageName
    : 'كل المراحل'
  const selectedClassLabel = classId
    ? teacher?.classes?.find((item) => String(item.id) === classId)?.className
    : 'كل الفصول'

  const columns = useMemo<DataTableColumn<StudentListItem>[]>(
    () => [
      {
        header: 'رمز الطالب',
        accessor: 'studentCode',
        sortable: true,
        render: (student) => (
          <Link to={`/students/${student.id}`} className="font-inter text-[12px] font-bold text-primary hover:text-primary-hover">
            {student.studentCode || 'غير محدد'}
          </Link>
        ),
      },
      {
        header: 'الطالب',
        accessor: 'fullName',
        sortable: true,
        render: (student) => (
          <Link to={`/students/${student.id}`} className="text-[13px] font-bold text-text hover:text-primary">
            {student.fullName}
          </Link>
        ),
      },
      {
        header: 'ولي الأمر',
        render: (student) => (
          <span className="text-[12px] text-text-muted">
            <span className="font-semibold text-text">{student.parentName || 'غير محدد'}</span>
            {student.parentPhone && <span className="ms-1 font-inter">({student.parentPhone})</span>}
          </span>
        ),
      },
      {
        header: 'المجموعات',
        render: (student) => (
          <div className="flex items-center gap-1.5 text-[12px] text-text">
            <Group size={13} className="text-text-muted" />
            {student.activeClasses.length ? student.activeClasses.join('، ') : 'بدون فصل'}
          </div>
        ),
      },
      {
        header: 'المرحلة',
        render: (student) => <Badge variant="default">{student.stageName || 'غير محددة'}</Badge>,
      },
      {
        header: 'الحالة',
        render: (student) => {
          const status = statusMap[student.status] || statusMap.inactive
          return (
            <Badge variant={status?.variant === 'success' ? 'secondary' : 'destructive'}>
              {status?.label}
            </Badge>
          )
        },
      },
      {
        header: 'الإجراءات',
        render: (student) => (
          <div className="flex items-center gap-1">
            <IconButton
              type="button"
              color="secondary"
              style="tint"
              size="sm"
              aria-label={`عرض ملف ${student.fullName}`}
              title="إدارة ملف الطالب"
              icon={<ContactRound size={14} />}
              onClick={() => navigate(`/students/${student.id}`)}
            />
            <IconButton
              type="button"
              color="secondary"
              style="tint"
              size="sm"
              aria-label={`تعديل ${student.fullName}`}
              title="تعديل الطالب"
              icon={<Edit3 size={14} />}
              onClick={() => navigate(`/students/${student.id}/edit`)}
            />
            <IconButton
              type="button"
              color="danger"
              style="tint"
              size="sm"
              aria-label={`حذف ${student.fullName}`}
              title="حذف الطالب"
              icon={<Trash2 size={14} />}
              onClick={() => setStudentToDelete(student)}
            />
          </div>
        ),
      },
    ],
    [navigate]
  )

  const confirmDelete = async () => {
    if (!studentToDelete) return
    try {
      await deleteMutation.mutateAsync({ id: studentToDelete.id })
      notify.success('تم حذف الطالب بنجاح')
      setStudentToDelete(null)
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'تعذر حذف الطالب')
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-300">
      <Breadcrumb showHome items={[{ label: 'الطلاب' }]} />
      <PageHeader
        title="إدارة الطلاب"
        description="إدارة بيانات الطلاب وحساباتهم ومجموعاتهم الدراسية من شاشة موحدة."
        actions={
          <Button
            type="button"
            onClick={() => navigate('/students/new')}
          >
            <Plus />
            إضافة طالب
          </Button>
        }
      />
      <section className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:grid-cols-4 xl:grid-cols-5">
        <StatisticCard
          label="إجمالي الطلاب"
          value={statsLoading ? '...' : String(stats?.total ?? 0)}
          icon={GraduationCap}
          iconClassName="bg-primary-subtle text-primary"
        />
        <StatisticCard
          label="الطلاب النشطون"
          value={statsLoading ? '...' : String(stats?.active ?? 0)}
          icon={UserRound}
          iconClassName="bg-success-subtle text-success"
        />
        <StatisticCard
          label="غير النشطين"
          value={statsLoading ? '...' : String(stats?.inactive ?? 0)}
          icon={UserRound}
          iconClassName="bg-neutral-100 text-text"
        />
        <StatisticCard
          label="لديهم ولي أمر"
          value={statsLoading ? '...' : String(stats?.withParent ?? 0)}
          icon={Users}
          iconClassName="bg-accent-subtle text-accent"
        />
      </section>
      <DataTable
        title={
          <>
            <div className="flex items-center gap-2">
              <span>قائمة الطلاب</span>
              <Badge variant="neutral">
                {result?.meta?.total ?? 0} طالب
              </Badge>
            </div>
          </>
        }
        description="ابحث وفلتر الطلاب حسب المرحلة أو المجموعة."
        tableActions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <InputGroup className="w-56" size="sm">
              <InputGroupInput
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="ابحث عن طالب..."
                aria-label="البحث عن طالب"
              />
            </InputGroup>
            <Select
              value={stageId}
              onValueChange={(value) => {
                setStageId(value ?? '')
                setPage(1)
              }}
            >
              <SelectTrigger size="sm" className="text-text-muted">
                <SelectValue>{selectedStageLabel || 'المرحلة'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">كل المراحل</SelectItem>
                {(teacher?.studyStages || []).map((stage) => (
                  <SelectItem key={stage.id} value={String(stage.id)}>
                    {stage.stageName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={classId}
              onValueChange={(value) => {
                setClassId(value ?? '')
                setPage(1)
              }}
            >
              <SelectTrigger size="sm" className="text-text-muted">
                <SelectValue>{selectedClassLabel || 'الفصل'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">كل الفصول</SelectItem>
                {(teacher?.classes || []).map((group) => (
                  <SelectItem key={group.id} value={String(group.id)}>
                    {group.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        data={result?.data || []}
        columns={columns}
        getRowId={(student) => String(student.id)}
        loading={isLoading}
        pagination={
          <Pagination
            size="sm"
            currentPage={result?.meta.current_page ?? 1}
            totalPages={result?.meta.last_page ?? 1}
            onPageChange={setPage}
            perPage={result?.meta.per_page ?? 10}
            totalItems={result?.meta.total ?? 0}
            showPerPageSelect
            onPerPageChange={() => { }}
          />
        }

      />
      <Dialog
        open={!!studentToDelete}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
            هل تريد حذف {studentToDelete?.fullName}؟
            </DialogTitle>
            <DialogDescription>
            سيتم إخفاء الطالب من قائمتك وتعطيل حسابه. هذا الإجراء لا يحذف السجلات المرتبطة به.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>إلغاء</DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={confirmDelete}
            >
              {deleteMutation.isPending ? 'جار الحذف...' : 'حذف الطالب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
