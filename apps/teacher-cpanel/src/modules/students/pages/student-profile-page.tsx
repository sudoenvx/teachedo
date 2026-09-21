import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Edit3, GraduationCap, Phone, Users } from 'lucide-react'
import { Badge, Body, Breadcrumb, Button, Card, PageHeader, Title } from '@teachedo/ui/legacy'
import { useStudent } from '../api/students.queries'
import { useMemo, useState } from 'react'
import { CreditCard, CalendarCheck, Download, KeyRound } from 'lucide-react'
import { useRegenerateStudentCredentials } from '../api/students.mutations'
import type { StudentDetails } from '../types/student.types'
import { useNotification } from '@/core/hooks/use_notification'
import { BASE_URL } from '@/core/config'

type ProfileTab = 'overview' | 'grades' | 'payments' | 'attendance' | 'groups'

const tabs: Array<{ key: ProfileTab; label: string; icon: typeof GraduationCap }> = [
  { key: 'overview', label: 'نظرة عامة', icon: GraduationCap },
  { key: 'grades', label: 'الدرجات', icon: GraduationCap },
  { key: 'payments', label: 'المدفوعات', icon: CreditCard },
  { key: 'attendance', label: 'الحضور', icon: CalendarCheck },
  { key: 'groups', label: 'المجموعات', icon: Users },
]

function imageUrl(path?: string | null) {
  // if (!path) return AVATAR_PLACEHOLDER
  if (!path) return "/avatar.jpg"
  return path.startsWith('http') ? path : `${BASE_URL}${path}`
}

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notify } = useNotification()
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const { data: student, isLoading } = useStudent(Number(id))
  const credentialsMutation = useRegenerateStudentCredentials()

  const qrData = useMemo(() => {
    if (!student?.studentCode) return ''
    return JSON.stringify({
      studentCode: student.studentCode,
      password: student.plainPassword || newPassword || 'غير متاحة',
    })
  }, [newPassword, student?.studentCode])
  const qrUrl = qrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`
    : ''

  if (isLoading || !student)
    return (
      <div className="flex h-[50vh] items-center justify-center text-[12px] text-text-muted">
        جاري تحميل ملف الطالب...
      </div>
    )

  const regenerateCredentials = async () => {
    try {
      const result = await credentialsMutation.mutateAsync({ id: student.id })
      setNewPassword(result.newPassword)
      notify.success('تم إصدار بيانات دخول جديدة للطالب')
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'تعذر إصدار بيانات الدخول')
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-300">
      <Breadcrumb items={[{ label: 'الطلاب', href: '/students' }, { label: student.fullName }]} />
      <PageHeader
        title={student.fullName}
        description="ملف الطالب وبيانات التواصل والمجموعات المرتبط بها."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              color="secondary"
              style="tint"
              size="sm"
              uppercase={false}
              leftIcon={<ArrowRight size={14} />}
              onClick={() => navigate('/students')}
            >
              العودة للطلاب
            </Button>
            <Link to={`/students/${student.id}/edit`}>
              <Button
                type="button"
                color="primary"
                style="solid"
                size="sm"
                uppercase={false}
                leftIcon={<Edit3 size={14} />}
              >
                تعديل الطالب
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <main className="min-w-0">
          <Card bodyClassName="p-3!">
            <div className="flex gap-1 overflow-x-auto bg-secondary rounded-sm p-1">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-sm px-3 py-1 text-[12px] font-semibold transition-colors duration-200 ${activeTab === key ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:bg-neutral-100 hover:text-text'}`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3">
              {activeTab === 'overview' && <Overview student={student} />}
              {activeTab === 'grades' && (
                <UnavailableView
                  title="درجات الطالب"
                  description="لا توجد بيانات امتحانات ودرجات مرتبطة بهذا الطالب في النظام حالياً."
                />
              )}
              {activeTab === 'payments' && <Payments student={student} />}
              {activeTab === 'attendance' && <Attendance student={student} />}
              {activeTab === 'groups' && <Groups student={student} />}
            </div>
          </Card>
        </main>

        <aside className="sticky top-4 flex flex-col gap-4 self-start">
          <Card bodyClassName="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="bg-surface-secondary border border-border-subtle rounded-sm p-2 w-full flex flex-col py-4 items-center justify-center">
                <img
                  src={imageUrl(student.profilePictureUrl)}
                  alt={student.fullName}
                  className="h-20 w-20 rounded-sm object-cover"
                />
                <Title size="small" className="mt-3 font-semibold text-primary">
                  {student.fullName}
                </Title>
              </div>
              <Badge
                variant={student.status === 'active' ? 'success' : 'neutral'}
                size="sm"
                className="mt-2"
              >
                {student.status === 'active' ? 'نشط' : 'غير نشط'}
              </Badge>
            </div>

            <div className="h-px bg-border/50"></div>

            <div className="mt-4 pt-4">
              {qrUrl ? (
                <img src={qrUrl} alt="رمز دخول الطالب" className="mx-auto h-40 w-40 rounded-sm " />
              ) : (
                <div className="flex h-40 items-center justify-center bg-neutral-100 text-center text-[11px] text-text-muted">
                  لا يوجد رمز طالب لإنشاء QR
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <Credential label="الرمز" value={student.studentCode || 'غير محدد'} />
                <Credential
                  label="كلمة المرور"
                  value={student.plainPassword || newPassword || 'غير معروضة'}
                />
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  color="primary"
                  style="tint"
                  size="sm"
                  uppercase={false}
                  leftIcon={<KeyRound size={13} />}
                  loading={credentialsMutation.isPending}
                  onClick={regenerateCredentials}
                >
                  إصدار بيانات جديدة
                </Button>
                {qrUrl && (
                  <a
                    href={qrUrl}
                    download={`student-${student.studentCode || student.id}-qr.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-6.5 items-center gap-1.5 rounded-sm bg-neutral-100 px-3 text-[11px] font-medium text-text hover:bg-neutral-200"
                  >
                    <Download size={13} />
                    تحميل QR
                  </a>
                )}
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function Overview({ student }: { student: StudentDetails }) {
  const groups = student.groupEnrollments?.filter((item) => item.status === 'active') || []
  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-3 sm:grid-cols-2">
        <InfoBlock label="المرحلة الدراسية" value={student.stageName} />
        <InfoBlock label="المعلم" value={student.teacher?.fullName || 'غير محدد'} />
        <InfoBlock label="عدد المجموعات" value={String(groups.length)} />
        <InfoBlock label="إجمالي الدرجات" value="0 من 0" />
      </section>
      <Card className="bg-surface-secondary shadow-none" bodyClassName="p-3">
        <h2 className="text-[13px] font-bold text-text">بيانات التواصل</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Detail icon={Phone} label="هاتف الطالب" value={student.phoneNumber || 'غير محدد'} />
          <Detail icon={Users} label="ولي الأمر" value={student.parentName || 'غير مرتبط'} />
          <Detail icon={Phone} label="هاتف ولي الأمر" value={student.parentPhone || 'غير محدد'} />
          <Detail
            icon={Phone}
            label="واتساب ولي الأمر"
            value={student.parentWhatsapp || 'غير محدد'}
          />
        </div>
      </Card>
      <Card className="bg-surface-secondary shadow-none" bodyClassName="p-3">
        <h2 className="text-[13px] font-bold text-text">المجموعات والمعلم</h2>
        <div className="mt-3 flex flex-col gap-2">
          {groups.length ? (
            groups.map(({ group }) => (
              <div
                key={group.id}
                className="flex items-center justify-between border border-border-subtle bg-surface p-2.5"
              >
                <span className="text-[12px] font-semibold text-text">{group.groupName}</span>
                <span className="text-[11px] text-text-muted">
                  {student.teacher?.fullName || 'المعلم غير محدد'}
                </span>
              </div>
            ))
          ) : (
            <Body className="text-text-muted">لا توجد مجموعات نشطة.</Body>
          )}
        </div>
      </Card>
    </div>
  )
}

function Payments({ student }: { student: StudentDetails }) {
  return (
    <TableView
      headers={['الشهر', 'المجموعة', 'المستحق', 'المدفوع', 'الحالة']}
      rows={(student.invoices || []).map((invoice) => [
        invoice.billingMonth,
        invoice.group?.groupName || 'غير محدد',
        String(invoice.amountDue),
        String(invoice.amountPaid),
        invoice.status,
      ])}
    // empty="لا توجد فواتير مسجلة."
    />
  )
}

function Attendance({ student }: { student: StudentDetails }) {
  return (
    <TableView
      headers={['التاريخ', 'الحصة', 'المجموعة', 'الحالة']}
      rows={(student.attendance || []).map((entry) => [
        new Date(entry.session?.sessionDate || entry.recordedAt).toLocaleDateString('ar-EG'),
        entry.session?.topic || 'حصة تعليمية',
        entry.session?.group?.groupName || 'غير محدد',
        entry.status || 'غير محدد',
      ])}
    // empty="لا توجد سجلات حضور."
    />
  )
}

function Groups({ student }: { student: StudentDetails }) {
  return (
    <TableView
      headers={['المجموعة', 'الحالة', 'السعر الشهري']}
      rows={(student.groupEnrollments || []).map((entry) => [
        entry.group.groupName,
        entry.status,
        String(entry.customPrice || entry.group.standardMonthlyFee || 'غير محدد'),
      ])}
    // empty="لا توجد مجموعات مرتبطة."
    />
  )
}

function TableView({
  headers,
  rows,
  empty,
}: {
  headers: string[]
  rows: string[][]
  empty?: string
}) {
  if (!rows.length) return <UnavailableView title="لا توجد بيانات" description={empty} />
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right text-[11px]">
        <thead>
          <tr className="border-b border-border-subtle text-text-muted">
            {headers.map((header) => (
              <th key={header} className="px-2 py-2 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-border-subtle last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-2 py-2.5 text-text">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-100 p-3">
      <p className="text-[10px] text-text-muted">{label}</p>
      <p className="mt-1 text-[13px] font-bold text-text">{value}</p>
    </div>
  )
}
function Credential({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-100 p-2">
      <p className="text-[10px] text-text-muted">{label}</p>
      <p className="mt-1 truncate font-inter text-[11px] font-bold text-text">{value}</p>
    </div>
  )
}
function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone
  label: string
  value: string
}) {
  return (
    <div className="mt-3 flex items-start gap-2">
      <Icon size={14} className="mt-0.5 text-primary" />
      <div>
        <p className="text-[10px] text-text-muted">{label}</p>
        <p className="mt-0.5 text-[12px] font-semibold text-text">{value}</p>
      </div>
    </div>
  )
}
function UnavailableView({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-sm  bg-surface-secondary px-6 text-center border border-border-subtle">
      <div className="p-2 flex items-center justify-center rounded-sm bg-neutral-100 text-secondary">
        <GraduationCap className='w-14 h-14' />
      </div>
      <Title size='medium' className="mt-3 font-bold text-text">{title}</Title>
      <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-text-muted">{description}</p>
    </div>
  )
}
