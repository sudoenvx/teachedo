import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  CreditCard,
  School,
  TrendingUp,
  AlertOctagon,
  Zap,
  PieChart,
  ActivitySquare,
  Plus,
  Wallet,
  Settings
} from 'lucide-react'
import { StatisticCard, Badge, Card, IconButton } from '@teachedo/ui/legacy'
import { DataTable, Button, type ColumnDef } from '@teachedo/ui/components'
import { useAdminStats, useLatestTeachers } from '../api/dashboard.queries'
import type { LatestTeacher } from '../types/dashboard.types'
import { cn } from '@/core/utils'
import { QuickDataTable, SimpleTeachersTable, TeachersTable } from '@/modules/dashboard/pages/x.d'

// --- بيانات الرسم البياني (MRR) ---
// type: 'primary' | 'secondary' | 'projected' (مخطط)
const MRR_CHART_DATA = [
  { month: 'يناير', value: 30, type: 'secondary' },
  { month: 'فبراير', value: 45, type: 'secondary' },
  { month: 'مارس', value: 80, type: 'secondary' },
  { month: 'أبريل', value: 65, type: 'primary' },
  { month: 'مايو', value: 90, type: 'secondary' },
  { month: 'يونيو', value: 75, type: 'primary' },
  { month: 'يوليو', value: 40, type: 'projected' },
  { month: 'أغسطس', value: 55, type: 'projected' },
  { month: 'سبتمبر', value: 55, type: 'projected' },
  { month: 'أكتوبر', value: 55, type: 'projected' },
  { month: 'نوفمبر', value: 55, type: 'projected' },
  { month: 'ديسمبر', value: 55, type: 'projected' },
]

// --- بيانات أفضل المدرسين ---
const VIP_TEACHERS = [
  { name: 'أحمد محمود', students: 450, percent: 90 },
  { name: 'سارة إبراهيم', students: 320, percent: 65 },
  { name: 'محمد صلاح', students: 280, percent: 55 },
  { name: 'علي طارق', students: 150, percent: 30 },
]

const STATUS_MAP: Record<string, string> = {
  ACTIVE: 'نشط', INACTIVE: 'غير نشط', SUSPENDED_PAYMENT: 'موقوف', TRIAL: 'تجريبي',
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: latestTeachers = [], isLoading: teachersLoading } = useLatestTeachers()

  const columns = useMemo<ColumnDef<LatestTeacher>[]>(() => [
    {
      header: 'ID',
      accessorKey: 'id',
      cell: ({ row }) => <span className="font-bold text-text">{row.original.id}</span>,
    },
    {
      header: 'المدرس',
      accessorKey: 'name',
      cell: ({ row }) => <span className="font-bold text-[12px] text-primary-hover">{row.original.name}</span>,
    },
    {
      header: 'البريد',
      accessorKey: 'email',
      cell: ({ row }) => <span className="text-text-muted text-[11px] font-inter">{row.original.email}</span>,
    },
    {
      header: 'الطلاب',
      accessorKey: 'studentsCount',
      cell: ({ row }) => <span className="text-[12px] font-bold text-primary tabular-nums">{row.original.studentsCount}</span>,
    },
    {
      header: 'الحالة',
      accessorKey: 'status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
          {STATUS_MAP[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      header: '',
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end gap-1">
            <Link to={`/teachers/${row.original.id}`}>
              <IconButton aria-label="فتح ملف المدرس" title="فتح ملف المدرس" icon={<Settings />} size="sm" />
            </Link>
          </div>
        )
      }
    }
  ], [])

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-10">

      {/* 1. الإحصائيات السريعة (Using your StatisticCard) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        <StatisticCard
          label="إجمالي المدرسين"
          value={statsLoading ? '...' : stats?.activeTeachers.toLocaleString() || '0'}
          icon={School}
          iconClassName="bg-primary-subtle text-primary"
        />
        <StatisticCard
          label="الطلاب المسجلين"
          value={statsLoading ? '...' : stats?.enrolledStudents.toLocaleString() || '0'}
          icon={GraduationCap}
          iconClassName="bg-neutral-100 text-secondary"
        />
        <StatisticCard
          label="إجمالي الإيرادات (ج.م)"
          value={statsLoading ? '...' : stats?.monthlyRevenue.toLocaleString() || '0'}
          icon={Wallet}
          iconClassName="bg-success-subtle text-success"
        />
        <StatisticCard
          label="المجموعات النشطة"
          value={statsLoading ? '...' : stats?.activeGroups.toLocaleString() || '0'}
          icon={ActivitySquare}
          iconClassName="bg-accent-subtle text-accent"
        />
        <StatisticCard
          label="المستحقات المتأخرة"
          // value={statsLoading ? '...' : stats?.overdueTeachers.toLocaleString() || '0'}
          value={statsLoading ? '...' : '0'}
          icon={AlertOctagon}
          iconClassName="bg-destructive-subtle text-destructive"
        />
      </div>

      {/* 2. الشبكة الرئيسية للرسومات البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* --- رسم الإيرادات العمودي (Concept from image, using your tokens) --- */}
        <Card
          className="lg:col-span-2 rounded-sm"
          bodyClassName="p-4 flex flex-col h-full"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-[14px] font-bold text-text mb-1">
                <PieChart size={16} className="text-text-muted" /> الإيرادات الشهرية
              </span>
              <span className="text-[11px] text-text-muted">الإيرادات المحصلة بالمحفظة (MRR)</span>
            </div>
            <span className="text-3xl font-black text-primary-hover font-inter tracking-tight">
              ${stats?.monthlyRevenue.toLocaleString() || '14,346'}
            </span>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-border px-2 pb-1 relative min-h-55">
            {/* خطوط الشبكة */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
              {[400, 300, 200, 100, 0].map(val => (
                <div key={val} className="flex items-center w-full border-t border-dashed border-border/60">
                  <span className="text-[10px] font-medium text-text-faint absolute -right-3">{val}</span>
                </div>
              ))}
            </div>

            {/* الأعمدة */}
            {MRR_CHART_DATA.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group z-10">
                <div
                  className={cn(
                    "w-full max-sm:w-7! max-md:w-8! max-w-9 rounded-t-sm transition-all duration-300 relative",
                    data.type === 'primary' && "bg-primary group-hover:bg-primary-hover",
                    data.type === 'secondary' && "bg-secondary group-hover:bg-secondary-hover",
                    data.type === 'projected' && "bg-transparent border-2 border-dashed border-border group-hover:bg-surface-raised"
                  )}
                  style={{ height: `${data.value}%` }}
                >
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary-hover text-white text-[10px] font-bold px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.value}K
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-text-muted mt-2">{data.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* --- أفضل المدرسين - شريط أفقي (Concept from image, using your tokens) --- */}
        <Card className="rounded-sm" bodyClassName="p-4 flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-[14px] font-bold text-text mb-1">
                <TrendingUp size={16} className="text-text-muted" /> أفضل المدرسين (VIP)
              </span>
              <span className="text-[11px] text-text-muted">إجمالي طلاب أفضل 4 مدرسين</span>
            </div>
            <span className="text-2xl font-black text-text font-inter tracking-tight">
              1,200
            </span>
          </div>

          <div className="flex flex-col gap-4 flex-1 justify-center">
            {VIP_TEACHERS.map((teacher, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-bold text-text">{teacher.name}</span>
                  <span className="text-[11px] font-bold text-primary font-inter">{teacher.students}</span>
                </div>
                {/* Horizontal Bar using your colors */}
                <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden flex">
                  <div
                    className={cn("h-full rounded-full", i % 2 === 0 ? "bg-primary" : "bg-secondary")}
                    style={{ width: `${teacher.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* 3. شبكة الإجراءات والتنبيهات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* صندوق التنبيه المالي بستايل نظامك (Danger colors) */}
        <Card className="rounded-sm border-destructive/30 bg-destructive-subtle" bodyClassName="p-4 flex flex-col justify-between relative overflow-hidden group cursor-pointer">
          <div className="absolute -left-6 -top-6 text-destructive/20">
            <AlertOctagon size={100} strokeWidth={1} />
          </div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-destructive-subtle-text">
              <AlertOctagon size={18} className="text-destructive" />
              <h3 className="text-[14px] font-bold">تنبيه تأخر السداد</h3>
            </div>
          </div>
          <div className="relative z-10 flex flex-col mt-2">
            <span className="text-[11px] font-medium text-destructive-subtle-text">مستحقات متأخرة من 4 مدرسين</span>
            <span className="text-3xl font-black text-destructive font-inter mt-1 tracking-tight">
              3,400 <span className="text-sm font-bold">EGP</span>
            </span>
          </div>
        </Card>

        {/* الإجراءات السريعة (Concept from Activity Time, using your layout) */}
        <Card className="lg:col-span-2 rounded-sm" bodyClassName="p-4">
          <div className="flex items-center gap-1.5 text-[14px] font-bold text-text mb-4">
            <Zap size={16} className="text-text-muted" /> إجراءات سريعة
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { label: 'إضافة مدرس', icon: School, route: '/teachers/new', className: 'bg-primary text-primary-foreground/80! hover:bg-primary-hover!' },
              { label: 'الفواتير', icon: CreditCard, className: 'border border-border/80' },
              { label: 'التقارير', icon: TrendingUp, className: 'border border-border/80' },
              { label: 'الإعدادات', icon: Settings, route: '/settings', className: 'bg-secondary text-secondary-foreground/80! hover:bg-secondary-hover!' },
            ].map((btn, i) => (
              <Link
                key={i}
                to={btn.route || '#'}
                className={`flex min-w-32 flex-col items-center justify-center gap-2 rounded-sm p-2 transition-colors hover:bg-secondary/10 hover:border-secondary/30 hover:text-secondary group text-text-muted ${btn.className || ''}`}
              >
                <btn.icon size={22} strokeWidth={1.5} className="transition-colors" />
                <span className="text-[11px] font-bold  transition-colors">{btn.label}</span>
              </Link>
            ))}
          </div>
        </Card>

      </div>
    </div>
  )
}