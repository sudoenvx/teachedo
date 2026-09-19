import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Edit3,
  Users,
  GraduationCap,
  DollarSign,
  Info,
  AlertTriangle
} from 'lucide-react'

import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  DataTable,
  PageLoading,
  StatisticCard,
  Tabs,
  Heading,
  Title,
  Body,
  Text,
  type DataTableColumn
} from '@teachedo/ui'

import { useGroup } from '../api/groups.queries'
import type { GroupEnrollment, GroupListItem, GroupSession } from '../types/group.types'

// --- Helpers ---
const dayNames: Record<string, string> = {
  saturday: 'السبت', sunday: 'الأحد', monday: 'الاثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة',
}

const statusLabels: Record<string, string> = {
  scheduled: 'مجدولة', completed: 'مكتملة', cancelled: 'ملغاة', postponed: 'مؤجلة', present: 'حاضر', absent: 'غائب', late: 'متأخر', excused: 'بعذر',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

function formatTime(value?: string | null) {
  if (!value) return 'غير محدد'
  const time = value.includes('T') ? value.slice(11, 16) : value.slice(0, 5)
  const [hours, minutes] = time.split(':').map(Number)
  return new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit' }).format(new Date(1970, 0, 1, hours, minutes))
}

function sessionStatus(session: GroupSession) {
  if (session.status === 'cancelled') return 'cancelled'
  if (session.isCompleted || session.status === 'completed') return 'completed'
  return 'scheduled'
}

function statusVariant(status: string) {
  if (status === 'completed' || status === 'present') return 'success' as const
  if (status === 'cancelled' || status === 'absent') return 'danger' as const
  if (status === 'late' || status === 'postponed' || status === 'excused') return 'warning' as const
  return 'primary' as const
}

// --- Empty State Component ---
const EmptyState = ({ icon, title, description }: { icon: ReactNode; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-tint/50 text-text-muted mb-4">
      {icon}
    </div>
    <Title size="small" className="font-bold text-text mb-1 m-0">{title}</Title>
    <Body size="small" className="text-text-muted m-0 max-w-sm">{description}</Body>
  </div>
)

// =========================================================================
// Main Page Component
// =========================================================================

export default function GroupManagementPage() {
  const { id } = useParams<{ id: string }>()
  const groupId = Number(id)
  const { data: group, isLoading, isError } = useGroup(groupId)

  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading) return <PageLoading label="جاري تحميل بيانات المجموعة..." />
  if (isError || !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in-95">
        <AlertTriangle size={48} className="text-destructive mb-4 opacity-80" strokeWidth={1.5} />
        <Heading level={2} size="small" className="text-text font-bold mb-2">عذراً، تعذر تحميل المجموعة</Heading>
        <Body size="medium" className="text-text-muted mb-6 text-center max-w-md">
          قد تكون المجموعة محذوفة أو لا تملك صلاحيات الوصول إليها. يرجى التحقق من الرابط والمحاولة مجدداً.
        </Body>
        <Link to="/groups">
          <Button color="secondary" style="outline" leftIcon={<ArrowRight size={16} />}>العودة لقائمة المجموعات</Button>
        </Link>
      </div>
    )
  }

  const enrollments = group.enrollments ?? []
  const sessions = group.classSessions ?? []
  const attendanceRecords = sessions.flatMap((s) => s.attendance)
  const presentRecords = attendanceRecords.filter((a) => a.status === 'present' || a.status === 'late').length
  const attendanceRate = attendanceRecords.length ? Math.round((presentRecords / attendanceRecords.length) * 100) : 0

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-300">

      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex flex-col gap-1.5">
          <Breadcrumb items={[{ label: 'لوحة التحكم', href: '/' }, { label: 'المجموعات', href: '/groups' }, { label: group.groupName }]} />
          <div className="flex items-center gap-3 mt-1">
            <Heading level={1} size="medium" className="text-text font-extrabold m-0">
              {group.groupName}
            </Heading>
            <Badge variant="success" size="sm" className="rounded-full px-2.5">
              نشطة
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to={`/groups/${group.id}/edit`}>
            <Button color="primary" style="solid" leftIcon={<Edit3 size={16} />}>إعدادات المجموعة</Button>
          </Link>
        </div>
      </div>

      {/* --- Main Layout Grid (1/3 Aside - 2/3 Content) --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* === Right Aside: Group Info & Stats === */}
        <aside className="xl:col-span-1 flex flex-col gap-5">

          {/* Card 1: Main Info */}
          <Card className="rounded-xl border-border/60 shadow-sm" bodyClassName="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Info size={20} strokeWidth={2} />
              </div>
              <div className="flex flex-col min-w-0">
                <Title size="small" className="text-text font-bold m-0 truncate">بيانات المجموعة</Title>
                <Body size="small" className="text-text-muted m-0 truncate">{group.studyStage?.stageName || 'مرحلة غير محددة'}</Body>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <Text variant="body-small" className="text-text-muted flex items-center gap-1.5">
                  <DollarSign size={14} /> الرسوم الشهرية
                </Text>
                <Text variant="title-small" className="font-bold text-primary-dark font-inter">
                  {group.standardMonthlyFee ? `${group.standardMonthlyFee} EGP` : 'غير محددة'}
                </Text>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <Text variant="body-small" className="text-text-muted flex items-center gap-1.5">
                  <Users size={14} /> السعة القصوى
                </Text>
                <Text variant="title-small" className="font-bold text-text tabular-nums">
                  {group.maxCapacity ? `${group.maxCapacity} طالب` : 'غير محدودة'}
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Text variant="body-small" className="text-text-muted flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> المقاعد المتاحة
                </Text>
                <Text variant="title-small" className="font-bold text-success tabular-nums">
                  {group.maxCapacity ? Math.max(group.maxCapacity - enrollments.length, 0) : 'متاح'}
                </Text>
              </div>
            </div>
          </Card>

          {/* Card 2: Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatisticCard label="الطلاب المسجلين" value={String(enrollments.length)} icon={GraduationCap} iconClassName="bg-primary/10 text-primary" />
            <StatisticCard label="نسبة الحضور" value={attendanceRecords.length ? `${attendanceRate}%` : '--'} icon={CheckCircle2} iconClassName="bg-success/10 text-success" />
            <StatisticCard label="الحصص المكتملة" value={String(sessions.filter(s => s.isCompleted).length)} icon={CalendarDays} iconClassName="bg-secondary/10 text-secondary-dark" />
            <StatisticCard label="إجمالي الحصص" value={String(group._count.classSessions)} icon={Clock3} iconClassName="bg-accent/10 text-accent-dark" />
          </div>

        </aside>

        {/* === Left Area (Main Content): Tabs & DataTables === */}
        <main className="xl:col-span-2 flex flex-col gap-5 min-w-0">

          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            items={[
              { id: 'overview', label: 'الجدول الزمني', icon: CalendarClock },
              { id: 'students', label: 'الطلاب المشتركين', icon: GraduationCap },
              { id: 'sessions', label: 'سجل الحصص', icon: CalendarDays },
              { id: 'attendance', label: 'تقارير الحضور', icon: CheckCircle2 }
            ]}
          />

          <div className="flex flex-col gap-6 mt-2">
            {activeTab === 'overview' && <OverviewTab group={group} sessions={sessions} />}
            {activeTab === 'students' && <StudentsTab enrollments={enrollments} />}
            {activeTab === 'sessions' && <SessionsTab sessions={sessions} />}
            {activeTab === 'attendance' && <AttendanceTab enrollments={enrollments} sessions={sessions} />}
          </div>

        </main>
      </div>
    </div>
  )
}

// =========================================================================
// Tab Components (Using strict DataTable only)
// =========================================================================

function OverviewTab({ group, sessions }: { group: GroupListItem, sessions: GroupSession[] }) {
  const scheduleColumns: DataTableColumn<any>[] = [
    { header: 'اليوم', render: (s) => <span className="font-bold text-[13px] text-text">{dayNames[s.dayOfWeek] || s.dayOfWeek}</span> },
    { header: 'وقت البدء', render: (s) => <span className="text-[13px] font-inter text-text-muted">{formatTime(s.startTime)}</span> },
    { header: 'المدة (دقيقة)', accessor: 'durationMinutes', cellClassName: 'font-inter font-bold text-primary-dark text-[13px]' },
  ]

  const upcomingSessions = sessions.filter(s => !s.isCompleted && s.status !== 'cancelled').slice(0, 5)
  const sessionColumns: DataTableColumn<GroupSession>[] = [
    { header: 'التاريخ', render: (s) => <span className="font-bold text-[13px] text-text">{formatDate(s.sessionDate)}</span> },
    { header: 'الوقت', render: (s) => <span className="text-[13px] font-inter text-text-muted">{formatTime(s.startTime)}</span> },
    { header: 'الحالة', render: (s) => <Badge variant={statusVariant(sessionStatus(s))} size="sm">{statusLabels[sessionStatus(s)]}</Badge> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <DataTable
        title="مواعيد المجموعة الثابتة"
        description="الأيام المجدولة لتكرار حصص المجموعة."
        data={group.schedules || []}
        columns={scheduleColumns}
        getRowId={(s) => s.id?.toString() || s.dayOfWeek}
        emptyMessage={<EmptyState icon={<Clock3 size={24} />} title="لا توجد مواعيد ثابتة" description="لم تقم بإضافة جداول ثابتة، يمكنك إضافتها من إعدادات المجموعة." />}
      />
      <DataTable
        title="الحصص القادمة"
        description="الجدول الزمني للحصص التي لم تكتمل بعد."
        data={upcomingSessions}
        columns={sessionColumns}
        getRowId={(s) => String(s.id)}
        emptyMessage={<EmptyState icon={<CalendarDays size={24} />} title="لا توجد حصص قادمة" description="لا يوجد أي حصص مجدولة لهذه المجموعة في الوقت الحالي." />}
      />
    </div>
  )
}

function StudentsTab({ enrollments }: { enrollments: GroupEnrollment[] }) {
  const columns: DataTableColumn<GroupEnrollment>[] = [
    {
      header: 'اسم الطالب',
      render: ({ student }) => (
        <span>
          <Link to={`/students/${student.id}`} className="text-[13px] font-bold text-primary hover:underline">{student.fullName}</Link>{' '}
          <span className="font-inter text-[11px] text-text-muted">({student.studentCode || 'بدون كود'})</span>
        </span>
      )
    },
    { header: 'رقم الهاتف', render: ({ student }) => student.phoneNumber ? <span className="text-[13px] font-inter text-text">{student.phoneNumber}</span> : <span className="text-[11px] text-text-faint">غير متاح</span> },
    { header: 'حالة الاشتراك', render: ({ status }) => <Badge variant={status === 'active' ? 'success' : 'danger'} size="sm">{status === 'active' ? 'مستمر' : 'منقطع'}</Badge> },
  ]

  return (
    <DataTable
      title="سجل الطلاب"
      description="قائمة بجميع الطلاب المنضمين لهذه المجموعة."
      data={enrollments}
      columns={columns}
      getRowId={(e) => String(e.student.id)}
      emptyMessage={<EmptyState icon={<GraduationCap size={24} />} title="المجموعة فارغة" description="لم يتم تسجيل أي طلاب في هذه المجموعة حتى الآن." />}
    />
  )
}

function SessionsTab({ sessions }: { sessions: GroupSession[] }) {
  const columns: DataTableColumn<GroupSession>[] = [
    { header: 'تاريخ الحصة', render: (s) => <span className="font-bold text-[13px] text-text">{formatDate(s.sessionDate)}</span> },
    { header: 'الموضوع', render: (s) => <span className="text-[13px] text-text-muted">{s.topic || 'حصة عامة'}</span> },
    { header: 'حالة الحصة', render: (s) => <Badge variant={statusVariant(sessionStatus(s))} size="sm">{statusLabels[sessionStatus(s)]}</Badge> },
    {
      header: 'حضور الطلاب',
      render: (s) => {
        const total = s.attendance.length
        const present = s.attendance.filter(a => a.status === 'present' || a.status === 'late').length
        return total > 0 ? (
          <span className="text-[13px] font-bold text-success font-inter">{present} <span className="text-text-muted font-normal text-[11px]">/ {total}</span></span>
        ) : <span className="text-[12px] text-text-faint">--</span>
      }
    },
  ]

  return (
    <DataTable
      title="السجل الزمني للحصص"
      description="جميع الحصص المجدولة والمكتملة الخاصة بالمجموعة."
      data={sessions}
      columns={columns}
      getRowId={(s) => String(s.id)}
      emptyMessage={<EmptyState icon={<CalendarDays size={24} />} title="سجل الحصص فارغ" description="ابدأ بإنشاء حصص جديدة لجدولتها للطلاب." />}
    />
  )
}

function AttendanceTab({ enrollments, sessions }: { enrollments: GroupEnrollment[], sessions: GroupSession[] }) {
  const summary = useMemo(() => enrollments.map((enrollment) => {
    const records = sessions.flatMap((session) => session.attendance.filter((entry) => entry.studentId === enrollment.student.id))
    const present = records.filter((entry) => entry.status === 'present' || entry.status === 'late').length
    const absent = records.filter((entry) => entry.status === 'absent').length
    return { enrollment, records: records.length, present, absent }
  }), [enrollments, sessions])

  const columns: DataTableColumn<(typeof summary)[number]>[] = [
    { header: 'الطالب', render: ({ enrollment }) => <span className="font-bold text-[13px] text-text">{enrollment.student.fullName}</span> },
    { header: 'إجمالي الحصص', accessor: 'records', cellClassName: 'text-[13px] font-inter text-text-muted' },
    { header: 'حاضر', accessor: 'present', cellClassName: 'text-[13px] font-bold font-inter text-success' },
    { header: 'غائب', accessor: 'absent', cellClassName: 'text-[13px] font-bold font-inter text-destructive' },
    {
      header: 'نسبة الحضور',
      render: ({ records, present }) => {
        if (!records) return <span className="text-text-faint">--</span>
        const percentage = Math.round((present / records) * 100)
        return <span className={percentage >= 50 ? 'text-success font-bold font-inter text-[13px]' : 'text-destructive font-bold font-inter text-[13px]'}>{percentage}%</span>
      }
    },
  ]

  return (
    <DataTable
      title="تقارير الالتزام بالحضور"
      description="نظرة شاملة على مدى التزام كل طالب مسجل في المجموعة."
      data={summary}
      columns={columns}
      getRowId={({ enrollment }) => String(enrollment.student.id)}
      emptyMessage={<EmptyState icon={<CheckCircle2 size={24} />} title="لا توجد بيانات حضور" description="سيتم تجميع بيانات الحضور تلقائياً بمجرد تسجيلها في الحصص." />}
    />
  )
}