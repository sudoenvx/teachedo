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
  Body,
  Breadcrumb,
  Button,
  DataTable,
  IconButton,
  Modal,
  Pagination,
  PageHeader,
  Select,
  SearchInput,
  StatisticCard,
  Title,
  type DataTableColumn,
} from '@teachedo/ui'
import { useDebounce } from '@/core/hooks/use_debounce'
import { useNotification } from '@/core/hooks/use_notification'
import { useDeleteStudent } from '../api/students.mutations'
import { useStudentStats, useStudentsList } from '../api/students.queries'
import type { StudentListItem } from '../types/student.types'
import { useTeacherMe } from '@/modules/authentication/api/auth.queries'

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
  const [groupId, setGroupId] = useState('')
  const [studentToDelete, setStudentToDelete] = useState<StudentListItem | null>(null)
  const debouncedSearch = useDebounce(search, 350)
  const { data: result, isLoading } = useStudentsList(
    page,
    debouncedSearch,
    undefined,
    stageId,
    groupId
  )
  const { data: stats, isLoading: statsLoading } = useStudentStats()
  const { data: teacher } = useTeacherMe()
  const deleteMutation = useDeleteStudent()

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
            {student.activeGroups.length ? student.activeGroups.join('، ') : 'بدون مجموعة'}
          </div>
        ),
      },
      {
        header: 'المرحلة',
        render: (student) => <Badge variant="primary" size="sm">{student.stageName || 'غير محددة'}</Badge>,
      },
      {
        header: 'الحالة',
        render: (student) => {
          const status = statusMap[student.status] || statusMap.inactive
          return (
            <Badge variant={status.variant} size="sm">
              {status.label}
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
            color="primary"
            style="solid"
            size="sm"
            uppercase={false}
            leftIcon={<Plus size={15} />}
            onClick={() => navigate('/students/new')}
          >
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
              <Badge variant="neutral" size="sm">
                {result?.meta?.total ?? 0} طالب
              </Badge>
            </div>
          </>
        }
        description="ابحث وفلتر الطلاب حسب المرحلة أو المجموعة."
        tableActions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <SearchInput
              containerClassName="w-8 sm:w-8"
              expandedWidth={224}
              mode="compact"
              size="md"
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder="ابحث عن طالب..."
              variant="neutral"
            />
            <Select
              value={stageId}
              onChange={(value) => {
                setStageId(value)
                setPage(1)
              }}
              options={[
                { value: '', label: 'كل المراحل' },
                ...(teacher?.studyStages || []).map((stage) => ({
                  value: String(stage.id),
                  label: stage.stageName,
                })),
              ]}
              placeholder="المرحلة"
              variant="neutral"
              size="sm"
            />
            <Select
              value={groupId}
              onChange={(value) => {
                setGroupId(value)
                setPage(1)
              }}
              variant="neutral"
              options={[
                { value: '', label: 'كل المجموعات' },
                ...(teacher?.groups || []).map((group) => ({
                  value: String(group.id),
                  label: group.groupName,
                })),
              ]}
              placeholder="المجموعة"
              size="sm"
            />
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
      <Modal
        open={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        size="sm"
        footer={
          <>
            <Button
              type="button"
              color="secondary"
              style="tint"
              size="sm"
              uppercase={false}
              onClick={() => setStudentToDelete(null)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              color="danger"
              style="solid"
              size="sm"
              uppercase={false}
              loading={deleteMutation.isPending}
              onClick={confirmDelete}
            >
              حذف الطالب
            </Button>
          </>
        }
      >
        <div className="p-0">
          <Title className="mb-1 font-bold text-text">
            هل تريد حذف {studentToDelete?.fullName}؟
          </Title>
          <Body className=" leading-relaxed text-text-muted">
            سيتم إخفاء الطالب من قائمتك وتعطيل حسابه. هذا الإجراء لا يحذف السجلات المرتبطة به.
          </Body>
        </div>
      </Modal>
    </div>
  )
}
