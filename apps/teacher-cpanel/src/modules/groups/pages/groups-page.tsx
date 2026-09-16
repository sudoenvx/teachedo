import { useMemo, useState } from 'react'
import { CalendarClock, Edit3, GraduationCap, Plus, Trash2, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  DataTable,
  IconButton,
  Modal,
  PageHeader,
  StatisticCard,
  Title,
  Body,
  type DataTableColumn,
} from '@teachedo/ui'
import { useNotification } from '@/core/hooks/use_notification'
import { useDeleteGroup } from '../api/groups.mutations'
import { useGroups } from '../api/groups.queries'
import type { GroupListItem } from '../types/group.types'

export default function GroupsPage() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { data: groups = [], isLoading } = useGroups()
  const [groupToDelete, setGroupToDelete] = useState<GroupListItem | null>(null)
  const deleteMutation = useDeleteGroup()

  const totalStudents = groups.reduce((total, group) => total + group._count.enrollments, 0)
  const scheduledGroups = groups.filter((group) => group.schedules?.length).length
  const formatSchedule = (group: GroupListItem) => {
    const schedule = group.schedules?.[0]
    if (!schedule) return 'لا يوجد موعد'
    const day =
      (
        {
          saturday: 'السبت',
          sunday: 'الأحد',
          monday: 'الاثنين',
          tuesday: 'الثلاثاء',
          wednesday: 'الأربعاء',
          thursday: 'الخميس',
          friday: 'الجمعة',
        } as Record<string, string>
      )[schedule.dayOfWeek] || schedule.dayOfWeek
    const start = schedule.startTime.includes('T')
      ? schedule.startTime.slice(11, 16)
      : schedule.startTime.slice(0, 5)
    const end = schedule.endTime.includes('T')
      ? schedule.endTime.slice(11, 16)
      : schedule.endTime.slice(0, 5)
    return `${day}، ${start} - ${end}${(group.schedules?.length || 0) > 1 ? ` + ${(group.schedules?.length || 0) - 1}` : ''}`
  }

  const columns = useMemo<DataTableColumn<GroupListItem>[]>(
    () => [
      {
        header: 'المجموعة',
        accessor: 'groupName',
        sortable: true,
        render: (group) => (
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center bg-primary-subtle text-text rounded-sm">
              <Users size={14} />
            </span>
            <span className="text-[12px] font-bold text-text">{group.groupName}</span>
          </div>
        ),
      },
      {
        header: 'المرحلة',
        render: (group) => (
          <span className="text-[12px] text-text-muted">
            {group.studyStage?.stageName || 'غير محددة'}
          </span>
        ),
      },
      {
        header: 'الطلاب',
        render: (group) => (
          <span dir='ltr' className="inline-flex items-center gap-1 text-[12px] font-semibold text-text">
            <GraduationCap size={13} className="text-text-muted" />
            {group._count.enrollments}
            {group.maxCapacity ? ` / ${group.maxCapacity}` : ''}
          </span>
        ),
      },
      {
        header: 'المواعيد',
        render: (group) => (
          <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
            <CalendarClock size={13} />
            {formatSchedule(group)}
          </span>
        ),
      },
      {
        header: 'الاشتراك الشهري',
        render: (group) => (
          <span className="font-inter text-[12px] text-text-muted">
            {group.standardMonthlyFee ?? 'غير محدد'} EGP
          </span>
        ),
      },
      {
        header: 'الحصص',
        render: (group) => (
          <Badge variant="neutral" size="sm" className='font-inter'>
            {group._count.classSessions}
          </Badge>
        ),
      },
      {
        header: 'الإجراءات',
        render: (group) => (
          <div className="flex items-center gap-1">
            <IconButton
              type="button"
              color="secondary"
              style="tint"
              size="sm"
              aria-label={`تعديل ${group.groupName}`}
              title="تعديل المجموعة"
              icon={<Edit3 size={14} />}
              onClick={() => navigate(`/groups/${group.id}/edit`)}
            />
            <IconButton
              type="button"
              color="danger"
              style="tint"
              size="sm"
              aria-label={`حذف ${group.groupName}`}
              title="حذف المجموعة"
              icon={<Trash2 size={14} />}
              onClick={() => setGroupToDelete(group)}
            />
          </div>
        ),
      },
    ],
    [navigate]
  )

  const confirmDelete = async () => {
    if (!groupToDelete) return
    try {
      await deleteMutation.mutateAsync({ id: groupToDelete.id })
      notify.success('تم حذف المجموعة')
      setGroupToDelete(null)
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'تعذر حذف المجموعة')
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-300">
      <Breadcrumb showHome items={[{ label: 'المجموعات' }]} />
      <PageHeader
        title="إدارة المجموعات"
        description="نظّم مجموعاتك الدراسية وتابع أعداد الطلاب والحصص."
        actions={
          <Button
            type="button"
            color="primary"
            style="solid"
            size="sm"
            uppercase={false}
            leftIcon={<Plus size={15} />}
            onClick={() => navigate('/groups/new')}
          >
            إضافة مجموعة
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatisticCard label="إجمالي المجموعات" value={String(groups.length)} icon={Users} iconClassName="bg-primary-subtle text-primary" />
        <StatisticCard label="الطلاب المسجلون" value={String(totalStudents)} icon={GraduationCap} iconClassName="bg-success-subtle text-success" />
        <StatisticCard label="مجموعات لها مواعيد" value={String(scheduledGroups)} icon={CalendarClock} iconClassName="bg-accent-subtle text-accent" />
      </div>
      {!isLoading && groups.length === 0 ? (
        <Card bodyClassName="p-8 text-center">
          <Users size={28} className="mx-auto text-primary" />
          <h2 className="mt-3 text-[14px] font-bold text-text">ابدأ بأول مجموعة</h2>
          <p className="mx-auto mt-1 max-w-sm text-[12px] leading-6 text-text-muted">
            أنشئ مجموعة وحدد مرحلتها ورسومها ومواعيدها لتبدأ بإضافة الطلاب وتنظيم الحضور.
          </p>
          <Button
            type="button"
            color="primary"
            style="solid"
            size="sm"
            className="mt-4"
            leftIcon={<Plus size={14} />}
            onClick={() => navigate('/groups/new')}
          >
            إنشاء مجموعة
          </Button>
        </Card>
      ) : (
        <DataTable
          title={<span className="flex items-center gap-2">قائمة المجموعات <Badge variant="neutral" size="sm">{groups.length} مجموعة</Badge></span>}
          description="المجموعات النشطة المرتبطة بحسابك التعليمي."
          data={groups}
          columns={columns}
          getRowId={(group) => String(group.id)}
          loading={isLoading}
        />
      )}
      <Modal
        open={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        size="sm"
        footer={
          <>
            <Button
              type="button"
              color="secondary"
              style="tint"
              size="sm"
              uppercase={false}
              onClick={() => setGroupToDelete(null)}
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
              حذف المجموعة
            </Button>
          </>
        }
      >
        <div className="p-0">
          <Title className="mb-1 font-bold text-text">حذف {groupToDelete?.groupName}؟</Title>
          <Body className="leading-relaxed text-text-muted">
            سيتم إخفاء المجموعة من قائمتك. سجلات الطلاب والحصص المرتبطة بها لن تُحذف.
          </Body>
        </div>
      </Modal>
    </div>
  )
}
