import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Users,
  Users2,
  Wallet,
  CalendarDays,
  Phone,
  Mail,
  ShieldAlert,
  BookOpen,
  ArrowLeft,
  Settings,
  UserCheck,
  Clock,
  CheckCircle2,
  Save,
  Trash2,
  Copy,
  GraduationCap,
} from 'lucide-react'

import {
  Typography,
  StatisticCard,
  Button,
  Badge,
  DataTable,
  type DataTableColumn,
  Card,
  Input,
  IconButton,
  Tabs,
  useToast,
} from '@teachedo/ui/legacy'
import { useTeacherProfile } from '@/modules/teacher/api/teacher-profiles.queries'
import { useUpdateTeacher, useDeleteTeacher } from '@/modules/teacher/api/teachers.mutations'
import { useNotification } from '@/core/hooks/use_notification'
import type { GroupItem, InvoiceItem } from '@/modules/teacher/types/teacher-profile.types'
import { AVATAR_PLACEHOLDER } from '@/core/assets'

type TabKey = 'groups' | 'invoices' | 'settings'

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' }> = {
  active: { label: 'نشط', variant: 'success' },
  ACTIVE: { label: 'نشط', variant: 'success' },
  trial: { label: 'تجريبي', variant: 'warning' },
  TRIAL: { label: 'تجريبي', variant: 'warning' },
  suspended_payment: { label: 'موقوف (فواتير)', variant: 'danger' },
  SUSPENDED_PAYMENT: { label: 'موقوف (فواتير)', variant: 'danger' },
  inactive: { label: 'غير نشط', variant: 'danger' },
  INACTIVE: { label: 'غير نشط', variant: 'danger' },
}

export default function TeacherManagePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notify } = useNotification()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<TabKey>('groups')

  const teacherId = Number(id)
  const { data: teacher, isLoading } = useTeacherProfile(teacherId)

  const updateTeacherMutation = useUpdateTeacher(teacherId)
  const deleteTeacherMutation = useDeleteTeacher()

  // Form State for editing
  const [fullName, setFullName] = useState('')
  const [subjectSpecialization, setSubjectSpecialization] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [formInitialized, setFormInitialized] = useState(false)

  if (teacher && !formInitialized) {
    setFullName(teacher.fullName || teacher.name || '')
    setSubjectSpecialization(teacher.subjectSpecialization || teacher.subject || '')
    setPhoneNumber(teacher.phoneNumber || teacher.phone || '')
    setEmail(teacher.email || '')
    setFormInitialized(true)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateTeacherMutation.mutateAsync({
        fullName,
        // subjectSpecialization,
        // phoneNumber,
        // email,
        ...(newPassword ? { password: newPassword } : {}),
      })
      notify.success('تم تحديث بيانات المدرس بنجاح')
      setNewPassword('')
    } catch (err: any) {
      notify.error(err.message || 'فشل تحديث البيانات')
    }
  }


  const handleDeleteAccount = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في تعطيل/حذف حساب هذا المدرس؟')) return
    try {
      await deleteTeacherMutation.mutateAsync({ id: teacherId })
      notify.success('تم تعطيل حساب المدرس')
      navigate('/teachers')
    } catch (err: any) {
      notify.error(err.message || 'فشل حذف الحساب')
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`تم نسخ ${label}`)
  }

  // --- Data Table Columns ---
  const groupColumns: DataTableColumn<GroupItem>[] = useMemo(() => [
    {
      header: 'اسم المجموعة',
      accessor: 'groupName',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary/10 text-secondary font-bold">
            <Users2 size={14} />
          </div>
          <span className="font-bold text-[12px] text-text">{row.groupName}</span>
        </div>
      ),
    },
    {
      header: 'الاشتراك الشهري',
      accessor: 'standardMonthlyFee',
      render: (row) => (
        <span className="font-semibold text-[12px] text-primary tabular-nums">
          {row.standardMonthlyFee ? `${row.standardMonthlyFee} ج.م` : 'غير محدد'}
        </span>
      ),
    },
    {
      header: 'السعة القصوى',
      accessor: 'maxCapacity',
      render: (row) => (
        <span className="text-[12px] text-text-muted tabular-nums">
          {row.maxCapacity ? `${row.maxCapacity} طالب` : 'غير محدودة'}
        </span>
      ),
    },
    {
      header: 'الطلاب المسجلين',
      render: (row) => (
        <Badge variant="primary" size="sm">
          {row._count?.enrollments || 0} طالب
        </Badge>
      ),
    },
  ], [])

  const invoiceColumns: DataTableColumn<InvoiceItem>[] = useMemo(() => [
    { header: 'الشهر المفوتر', accessor: 'month', cellClassName: 'font-semibold text-[12px] text-text' },
    {
      header: 'المبلغ المطلوب',
      render: (row) => (
        <span className="font-semibold text-[12px] text-primary-hover tabular-nums">
          {row.amount.toLocaleString()} ج.م
        </span>
      ),
    },
    {
      header: 'المبلغ المدفوع',
      render: (row) => (
        <span className="font-semibold text-[12px] text-success tabular-nums">
          {row.amountPaid.toLocaleString()} ج.م
        </span>
      ),
    },
    {
      header: 'الحالة',
      render: (row) => {
        const isPaid = row.isPaid || row.status === 'paid'
        return (
          <Badge variant={isPaid ? 'success' : 'warning'} size="sm">
            {isPaid ? 'مسددة بالكامل' : 'مستحقة'}
          </Badge>
        )
      },
    },
  ], [])

  if (isLoading || !teacher) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-text-muted animate-pulse">
          <Users size={32} className="opacity-50" />
          <Typography variant="body-small">جاري تحميل ملف المدرس...</Typography>
        </div>
      </div>
    )
  }

  const currentStatus = (teacher.accountStatus || teacher.status || 'active').toLowerCase()
  const statusInfo = STATUS_MAP[currentStatus] || { label: currentStatus, variant: 'primary' }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">

      {/* 1. Header & Navigation */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 mt-1">
            <Typography variant="title-large" element="h1" className="text-text font-bold">
              {teacher.fullName || teacher.name}
            </Typography>
            <Badge variant={statusInfo.variant} size="sm">
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            rightIcon={<ArrowLeft />}
            color="neutral"
            size="sm"
            onClick={() => navigate('/teachers')}
          >
            العودة للمدرسين
          </Button>
        </div>
      </header>

      {/* 2. Key Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatisticCard
          label="إجمالي الطلاب المسجلين"
          value={teacher.stats?.totalStudents?.toLocaleString() || '0'}
          icon={GraduationCap}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatisticCard
          label="المجموعات الدراسية"
          value={teacher.stats?.activeGroups?.toString() || '0'}
          icon={Users2}
          iconClassName="bg-accent/20 text-accent-hover"
        />
        <StatisticCard
          label="المساعدين (Staff)"
          value={teacher.stats?.totalAssistants?.toString() || '0'}
          icon={UserCheck}
          iconClassName="bg-success/20 text-success"
        />
        <StatisticCard
          label="إجمالي الحصص المعطاة"
          value={teacher.stats?.totalSessions?.toString() || '0'}
          icon={Clock}
          iconClassName="bg-secondary/15 text-secondary-hover"
        />
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Right Info Sidebar (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card
            bodyClassName="p-0 bg-surface"
            title={
              <div className="flex items-center gap-1.5 text-white/80">
                <BookOpen size={14} />
                <span>بطاقة المدرس (Tenant Card)</span>
              </div>
            }
          >
            {/* Profile Hero Box */}
            <div className="flex items-center gap-3.5 p-2 bg-background/50">
              <div className="flex h-12 w-12 shrink-0 items-center p-1 justify-center rounded-xl bg-accent-subtle text-primary-foreground font-bold text-lg">
                <img alt='User Avatar Placeholder' src={AVATAR_PLACEHOLDER} className='bg-cover' style={{
                  mixBlendMode: 'multiply',
                  filter: 'contrast(1)'
                }} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-text text-[14px] truncate">{teacher.fullName || teacher.name}</span>
                <span className="text-[12px] text-text-muted font-medium mt-0.5">{teacher.subjectSpecialization || 'تخصص عام'}</span>
              </div>
            </div>

            {/* Information Rows */}
            <div className="flex flex-col p-4 gap-3 text-[12px]">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Mail size={13} />
                  <span>البريد الإلكتروني</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-text font-inter" dir="ltr">{teacher.email}</span>
                  <IconButton
                    icon={<Copy size={11} />}
                    size="xs"
                    color="secondary"
                    style='ghost'
                    title="نسخ البريد"
                    aria-label="نسخ البريد"
                    onClick={() => copyToClipboard(teacher.email, 'البريد الإلكتروني')}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Phone size={13} />
                  <span>رقم الهاتف</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-text font-inter" dir="ltr">{teacher.phoneNumber || teacher.phone || '—'}</span>
                  {teacher.phoneNumber && (
                    <IconButton
                      icon={<Copy size={11} />}
                      size="xs"
                      color='secondary'
                      style='ghost'
                      title="نسخ الهاتف"
                      aria-label="نسخ الهاتف"
                      onClick={() => copyToClipboard(teacher.phoneNumber!, 'رقم الهاتف')}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-text-muted flex items-center gap-1.5">
                  <CalendarDays size={13} />
                  <span>تاريخ الانضمام</span>
                </span>
                <span className="font-semibold text-text font-inter tabular-nums">
                  {teacher.joinDate || teacher.createdAt?.split('T')[0] || '—'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>معرف النظام</span>
                </span>
                <span className="font-bold text-primary font-inter">#{teacher.id}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Left Tabs Content (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {/* Tabs Switcher */}
          <Tabs
            value={activeTab}
            onChange={(value) => setActiveTab(value as TabKey)}
            ariaLabel="محتوى ملف المدرس"
            items={[
              { id: 'groups', label: `المجموعات (${teacher.groups?.length || 0})`, icon: Users2 },
              { id: 'invoices', label: `الفواتير والاشتراك (${teacher.recentInvoices?.length || 0})`, icon: Wallet },
              { id: 'settings', label: 'تعديل الحساب', icon: Settings },
            ]}
          />

          {/* Tab 1: Groups */}
          {activeTab === 'groups' && (
            <DataTable
              title="المجموعات الدراسية"
              description="قائمة بجميع المجموعات التابعة لهذا المدرس ومعدل الإشغال."
              data={teacher.groups || []}
              columns={groupColumns}
              getRowId={(row) => String(row.id)}
              className="bg-surface rounded-sm"
            />
          )}

          {/* Tab 2: SaaS Invoices */}
          {activeTab === 'invoices' && (
            <DataTable
              title="سجل دورات الفوترة الشهرية (SaaS Billing)"
              description="الفواتير الصادرة للمدرس بناءً على عدد الطلاب النشطين نهاية كل شهر."
              data={teacher.recentInvoices || []}
              columns={invoiceColumns}
              getRowId={(row) => row.id}
              className="bg-surface rounded-sm"
            />
          )}

          {/* Tab 3: Settings & Edit Profile */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-4">
              <form onSubmit={handleUpdateProfile}>
                <Card>
                  <div className="mb-4 border-b border-border-subtle pb-3">
                    <h2 className="text-[13px] font-bold text-text">تعديل البيانات الأساسية</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 p-3">
                    <Input
                      label="الاسم الكامل"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      variant="outline"
                      required
                    />
                    <Input
                      label="المادة التعليمية (التخصص)"
                      value={subjectSpecialization}
                      onChange={(e) => setSubjectSpecialization(e.target.value)}
                      variant="outline"
                    />
                    <Input
                      label="رقم الهاتف"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      variant="outline"
                      dir="ltr"
                      className="text-left"
                    />
                    <Input
                      label="البريد الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      variant="outline"
                      dir="ltr"
                      className="text-left"
                      required
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="تعيين كلمة مرور جديدة (اختياري)"
                        type="password"
                        placeholder="اتركه فارغاً إذا كنت لا تريد تغييره"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        variant="outline"
                        dir="ltr"
                        className="text-left"
                        hint="إذا تم إدخال كلمة مرور جديدة سيتم إعادة تشفيرها واستبدال القديمة."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end p-2 bg-neutral-100/50">
                    <Button
                      type="submit"
                      size="sm"
                      loading={updateTeacherMutation.isPending}
                      leftIcon={<Save size={14} />}
                    >
                      حفظ التعديلات
                    </Button>
                  </div>
                </Card>
              </form>

              {/* Danger Zone */}
              <Card>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-destructive/10 text-destructive">
                      <ShieldAlert size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-[12px] text-text">تعطيل أو حذف حساب المدرس</span>
                      <p className="text-[11px] text-text-muted">
                        سيتم إيقاف وصول المدرس ومساعديه للوحة التحكم، مع الاحتفاظ ببيانات الطلاب والحضور تاريخياً.
                      </p>
                    </div>
                  </div>

                  <Button
                    color="danger"
                    size="sm"
                    onClick={handleDeleteAccount}
                    loading={deleteTeacherMutation.isPending}
                    leftIcon={<Trash2 size={14} />}
                  >
                    تعطيل الحساب
                  </Button>
                </div>
              </Card>


              <div className="h-4"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}