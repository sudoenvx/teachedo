import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Edit3,
  UserCheck,
  Users,
  GraduationCap,
  DollarSign,
  Info,
  AlertTriangle,
  MapPin,
  Plus,
  ClipboardList,
  FileText,
  ReceiptText,
  Video,
} from "lucide-react";
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  Checkbox,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Field,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@teachedo/ui/components";

import { useGroup } from "../api/groups.queries";
import { useCreateClassSession } from "../api/groups.mutations";
import type {
  GroupEnrollment,
  GroupSession,
  SessionType,
} from "../types/group.types";
import { DataTable, type DataTableColumn } from "@teachedo/ui/components";
import { StatisticCard } from "@teachedo/ui/legacy";
import { useNotification } from "@/core/hooks/use_notification";

// --- Helpers ---
const statusLabels: Record<string, string> = {
  scheduled: "مجدولة",
  completed: "مكتملة",
  cancelled: "ملغاة",
  postponed: "مؤجلة",
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
  excused: "بعذر",
};

const sessionTypeLabels: Record<SessionType, string> = {
  regular: "حصة عادية",
  extra_revision: "مراجعة إضافية",
  final_revision: "مراجعة نهائية",
  quiz_only: "اختبار قصير",
  mock_exam: "اختبار تجريبي",
  assessment: "تقييم",
  other: "أخرى",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value?: string | null) {
  if (!value) return "غير محدد";
  const time = value.includes("T") ? value.slice(11, 16) : value.slice(0, 5);
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(1970, 0, 1, hours, minutes));
}

function sessionStatus(session: GroupSession) {
  if (session.status === "cancelled") return "cancelled";
  if (session.isCompleted || session.status === "completed") return "completed";
  return "scheduled";
}

function statusVariant(status: string) {
  if (status === "completed" || status === "present")
    return "secondary" as const;
  if (status === "cancelled" || status === "absent")
    return "destructive" as const;
  if (status === "late" || status === "postponed" || status === "excused")
    return "warning" as const;
  return "outline" as const;
}

// --- Empty State Component ---
const EmptyState = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-tint/50 text-text-muted mb-4">
      {icon}
    </div>
    <h3 className="mb-1 text-sm font-bold text-text">{title}</h3>
    <p className="m-0 max-w-sm text-xs text-text-muted">{description}</p>
  </div>
);

// =========================================================================
// Main Page Component
// =========================================================================

export default function GroupManagementPage() {
  const { id } = useParams<{ id: string }>();
  const groupId = Number(id);
  const { data: group, isLoading, isError } = useGroup(groupId);

  const [activeTab, setActiveTab] = useState("overview");
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);

  if (isLoading)
    return (
      <div className="flex min-h-56 items-center justify-center text-sm text-text-muted">
        جاري تحميل بيانات المجموعة...
      </div>
    );
  if (isError || !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in-95">
        <AlertTriangle
          size={48}
          className="text-destructive mb-4 opacity-80"
          strokeWidth={1.5}
        />
        <h2 className="mb-2 text-base font-bold text-text">
          عذراً، تعذر تحميل المجموعة
        </h2>
        <p className="mb-6 max-w-md text-center text-sm text-text-muted">
          قد تكون المجموعة محذوفة أو لا تملك صلاحيات الوصول إليها. يرجى التحقق
          من الرابط والمحاولة مجدداً.
        </p>
        <Link to="/groups">
          <Button variant="outline">
            <ArrowRight size={16} /> العودة لقائمة المجموعات
          </Button>
        </Link>
      </div>
    );
  }

  const enrollments = group.enrollments ?? [];
  const sessions = group.classSessions ?? [];
  const attendanceRecords = sessions.flatMap((s) => s.attendance);
  const presentRecords = attendanceRecords.filter(
    (a) => a.status === "present" || a.status === "late",
  ).length;
  const attendanceRate = attendanceRecords.length
    ? Math.round((presentRecords / attendanceRecords.length) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-5 pb-12 animate-in fade-in duration-300">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/">لوحة التحكم</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/groups">المجموعات</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{group.className}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="rounded-lg  ">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3 mt-1">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                <Users className="size-5" />
              </span>
              <h1 className="m-0 text-xl font-extrabold text-text">
                {group.className}
              </h1>
              <Badge variant="secondary">نشطة</Badge>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/groups">
              <Button variant="neutral">
                <ArrowRight size={16} /> رجوع
              </Button>
            </Link>
            <Link to={`/groups/${group.id}/edit`}>
              <Button>
                <Edit3 size={16} /> إعدادات المجموعة
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* --- Main Layout Grid (1/3 Aside - 2/3 Content) --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* === Right Aside: Group Info & Stats === */}
        <aside className="xl:col-span-1 flex flex-col gap-5">
          {/* Card 1: Main Info */}
          <Card className="rounded-lg border-border-subtle shadow-none">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Info size={20} strokeWidth={2} />
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="truncate text-sm font-bold text-text">
                  بيانات المجموعة
                </h2>
                <p className="truncate text-xs text-text-muted">
                  {group.center?.name || "بدون سنتر"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <GraduationCap size={14} /> الصف الدراسي
                </span>
                <span className="text-sm font-bold text-text">
                  {group.gradeLevel || "غير محدد"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Users size={14} /> الطلاب المسجلون
                </span>
                <span className="text-sm font-bold text-text tabular-nums">
                  {enrollments.length} طالب
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <MapPin size={14} /> السنتر
                </span>
                <span className="text-sm font-bold text-text">
                  {group.center?.name || "بدون سنتر"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <DollarSign size={14} /> الرسوم الشهرية
                </span>
                <span className="text-sm font-bold text-primary font-inter">
                  {group.monthlyPrice
                    ? `${group.monthlyPrice} EGP`
                    : "غير محددة"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Users size={14} /> السعة والمقاعد المتاحة
                </span>
                <span className="text-sm font-bold tabular-nums">
                  <span className="text-text">
                    {group.maxCapacity ? `${group.maxCapacity} طالب` : "غير محدودة"}
                  </span>
                  <span className="mx-1 text-text-faint">-</span>
                  <span className="text-success">
                    {group.maxCapacity
                      ? `${Math.max(group.maxCapacity - enrollments.length, 0)} متاح`
                      : "متاح"}
                  </span>
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2: Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <QuickStat
              label="الطلاب المسجلين"
              value={String(enrollments.length)}
              icon={GraduationCap}
            />
            <QuickStat
              label="نسبة الحضور"
              value={attendanceRecords.length ? `${attendanceRate}%` : "--"}
              icon={CheckCircle2}
            />
            <QuickStat
              label="الحصص المكتملة"
              value={String(sessions.filter((s) => s.isCompleted).length)}
              icon={CalendarDays}
            />
            <QuickStat
              label="إجمالي الحصص"
              value={String(group._count.classSessions)}
              icon={Clock3}
            />
          </div>
        </aside>

        {/* === Left Area (Main Content): Tabs & DataTables === */}
        <main className="xl:col-span-2 flex flex-col gap-5 min-w-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            dir="rtl"
            orientation="horizontal"
            className={"flex flex-col"}
          >
            <TabsList>
              <TabsTrigger value="overview">
                <CalendarClock /> الجدول الزمني
              </TabsTrigger>
              <TabsTrigger value="students">
                <GraduationCap /> الطلاب المشتركين
              </TabsTrigger>
              <TabsTrigger value="sessions">
                <CalendarDays /> سجل الحصص
              </TabsTrigger>
              <TabsTrigger value="attendance">
                <CheckCircle2 /> تقارير الحضور
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-5">
              <OverviewTab sessions={sessions} onCreateSession={() => setIsSessionDialogOpen(true)} />
            </TabsContent>
            <TabsContent value="students" className="mt-5">
              <StudentsTab enrollments={enrollments} />
            </TabsContent>
            <TabsContent value="sessions" className="mt-5">
              <SessionsTab classId={group.id} sessions={sessions} />
            </TabsContent>
            <TabsContent value="attendance" className="mt-5">
              <AttendanceTab enrollments={enrollments} sessions={sessions} />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <CreateClassSessionDialog
        classId={group.id}
        open={isSessionDialogOpen}
        onOpenChange={setIsSessionDialogOpen}
      />
    </div>
  );
}

function QuickStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return <StatisticCard label={label} value={value} icon={Icon} />;
}

// =========================================================================
// Tab Components (Using strict DataTable only)
// =========================================================================

function OverviewTab({
  sessions,
  onCreateSession,
}: {
  sessions: GroupSession[];
  onCreateSession: () => void;
}) {
  const upcomingSessions = sessions
    .filter((s) => !s.isCompleted && s.status !== "cancelled")
    .slice(0, 5);
  const sessionColumns: DataTableColumn<GroupSession>[] = [
    {
      header: "التاريخ",
      render: (s) => (
        <span className="font-bold text-[13px] text-text">
          {formatDate(s.sessionDate)}
        </span>
      ),
    },
    {
      header: "الوقت",
      render: (s) => (
        <span className="text-[13px] font-inter text-text-muted">
          {formatTime(s.scheduledStartTime)}
        </span>
      ),
    },
    {
      header: "نوع الحصة",
      render: (s) => (
        <span className="text-[12px] text-text-muted">
          {sessionTypeLabels[s.sessionType] || s.sessionType}
        </span>
      ),
    },
    {
      header: "الحالة",
      render: (s) => (
        <Badge variant={statusVariant(sessionStatus(s))}>
          {statusLabels[sessionStatus(s)]}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DataTable
        title="الحصص القادمة"
        description="الجدول الزمني للحصص التي لم تكتمل بعد."
        tableActions={
          <Button type="button" size="sm" onClick={onCreateSession}>
            <Plus />
            إضافة حصة
          </Button>
        }
        data={upcomingSessions}
        columns={sessionColumns}
        getRowId={(s) => String(s.id)}
        emptyMessage={
          <EmptyState
            icon={<CalendarDays size={24} />}
            title="لا توجد حصص قادمة"
            description="لا يوجد أي حصص مجدولة لهذه المجموعة في الوقت الحالي."
          />
        }
      />
    </div>
  );
}

function StudentsTab({ enrollments }: { enrollments: GroupEnrollment[] }) {
  const columns: DataTableColumn<GroupEnrollment>[] = [
    {
      header: "اسم الطالب",
      render: ({ student }) => (
        <span>
          <Link
            to={`/students/${student.id}`}
            className="text-[13px] font-bold text-primary hover:underline"
          >
            {student.fullName}
          </Link>{" "}
          <span className="font-inter text-[11px] text-text-muted">
            ({student.studentCode || "بدون كود"})
          </span>
        </span>
      ),
    },
    {
      header: "رقم الهاتف",
      render: ({ student }) =>
        student.phoneNumber ? (
          <span className="text-[13px] font-inter text-text">
            {student.phoneNumber}
          </span>
        ) : (
          <span className="text-[11px] text-text-faint">غير متاح</span>
        ),
    },
    {
      header: "حالة الاشتراك",
      render: ({ status }) => (
        <Badge variant={status === "active" ? "secondary" : "destructive"}>
          {status === "active" ? "مستمر" : "منقطع"}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      title="سجل الطلاب"
      description="قائمة بجميع الطلاب المنضمين لهذه المجموعة."
      data={enrollments}
      columns={columns}
      getRowId={(e) => String(e.student.id)}
      emptyMessage={
        <EmptyState
          icon={<GraduationCap size={24} />}
          title="المجموعة فارغة"
          description="لم يتم تسجيل أي طلاب في هذه المجموعة حتى الآن."
        />
      }
    />
  );
}

function SessionsTab({ classId, sessions }: { classId: number; sessions: GroupSession[] }) {
  return <SessionHistoryAccordion classId={classId} sessions={sessions} />;
  /*
   * Keep this table implementation available while the accordion becomes the
   * default group-hub view. It remains useful as a compact fallback when the
   * data table is reused elsewhere.
  const columns: DataTableColumn<GroupSession>[] = [
    {
      header: "تاريخ الحصة",
      render: (s) => (
        <span className="font-bold text-[13px] text-text">
          {formatDate(s.sessionDate)}
        </span>
      ),
    },
    {
      header: "الموضوع",
      render: (s) => (
        <span className="text-[13px] text-text-muted">
          {s.topic || "حصة عامة"}
        </span>
      ),
    },
    {
      header: "حالة الحصة",
      render: (s) => (
        <Badge variant={statusVariant(sessionStatus(s))}>
          {statusLabels[sessionStatus(s)]}
        </Badge>
      ),
    },
    {
      header: "حضور الطلاب",
      render: (s) => {
        const total = s.attendance.length;
        const present = s.attendance.filter(
          (a) => a.status === "present" || a.status === "late",
        ).length;
        return total > 0 ? (
          <span className="text-[13px] font-bold text-success font-inter">
            {present}{" "}
            <span className="text-text-muted font-normal text-[11px]">
              / {total}
            </span>
          </span>
        ) : (
          <span className="text-[12px] text-text-faint">--</span>
        );
      },
    },
  ];

  return (
    <DataTable
      title="السجل الزمني للحصص"
      description="جميع الحصص المجدولة والمكتملة الخاصة بالمجموعة."
      data={sessions}
      columns={columns}
      getRowId={(s) => String(s.id)}
      emptyMessage={
        <EmptyState
          icon={<CalendarDays size={24} />}
          title="سجل الحصص فارغ"
          description="ابدأ بإنشاء حصص جديدة لجدولتها للطلاب."
        />
      }
    />
  );
}

  */
}

function SessionHistoryAccordion({ classId, sessions }: { classId: number; sessions: GroupSession[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-bold text-text">السجل الكامل للحصص</h2>
        <p className="mt-1 text-xs text-text-muted">الحصص السابقة والحالية والقادمة مع إجراءات المحتوى والتقارير.</p>
      </div>
      {sessions.length ? (
        <Accordion className="rounded-lg border border-border-subtle bg-surface">
          {sessions.map((session, index) => {
            const present = session.attendance.filter((entry) => entry.status === 'present' || entry.status === 'late').length
            const title = session.topic || `حصة بدون عنوان${index + 1}`
            return (
              <AccordionItem key={session.id} value={String(session.id)} className="px-4">
                <AccordionTrigger className="gap-3 no-underline hover:no-underline">
                  <div className="flex min-w-0 flex-1 items-center gap-3 text-start">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary"><CalendarDays className="size-4" /></span>
                    <span className="min-w-0"><span className="block truncate text-xs font-bold text-text">{title}</span><span className="mt-1 block text-[10px] text-text-muted">{formatDate(session.sessionDate)} · {formatTime(session.scheduledStartTime)}</span></span>
                  </div>
                  <Badge variant={session.isCompleted ? 'secondary' : 'outline'}>{session.isCompleted ? 'مكتملة' : session.status === 'live' ? 'مباشرة' : 'مجدولة'}</Badge>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-3 rounded-md bg-surface-secondary p-3">
                    <div className="grid gap-2 text-xs sm:grid-cols-3"><InfoItem label="نوع الحصة" value={sessionTypeLabels[session.sessionType] || session.sessionType} /><InfoItem label="الحضور" value={`${present} / ${session.attendance.length}`} /><InfoItem label="المدة" value={`${session.durationMinutes} دقيقة${session.isMandatory ? ' · إلزامية' : ''}`} /></div>
                    <div className="flex flex-wrap gap-2 border-t border-border-subtle pt-3">
                      <Button type="button" size="xs" variant="neutral" disabled title="سيتم ربط الاختبارات عند تفعيل وحدة الاختبارات"><ClipboardList />ربط اختبار</Button>
                      <Button type="button" size="xs" variant="neutral" disabled title="سيتم تفعيل الواجبات مع وحدة المحتوى"><FileText />إرفاق واجب PDF</Button>
                      <Button type="button" size="xs" variant="neutral" disabled title="سيتم تفعيل الفيديوهات مع وحدة المحتوى"><Video />إضافة فيديو آمن</Button>
                      <span className="mx-1 hidden h-5 w-px bg-border-subtle sm:block" />
                      <Button type="button" size="xs" variant="neutral" disabled title="لا توجد وحدة درجات مرتبطة بالحصة حالياً"><ClipboardList />تقرير الدرجات</Button>
                      <Button type="button" size="xs" variant="neutral" disabled title="لا توجد وحدة تحصيل يومي مرتبطة بالحصة حالياً"><ReceiptText />التحصيل المالي</Button>
                      <Button type="button" size="xs" render={<Link to={`/classes/${classId}/sessions/${session.id}/live`} />}><UserCheck />مكتب الحضور</Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      ) : <EmptyState icon={<CalendarDays size={24} />} title="سجل الحصص فارغ" description="ابدأ بإضافة حصة من تبويب الجدول الزمني." />}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-surface p-2"><p className="text-[10px] text-text-muted">{label}</p><p className="mt-1 font-semibold text-text">{value}</p></div>
}

function AttendanceTab({
  enrollments,
  sessions,
}: {
  enrollments: GroupEnrollment[];
  sessions: GroupSession[];
}) {
  const summary = useMemo(
    () =>
      enrollments.map((enrollment) => {
        const records = sessions.flatMap((session) =>
          session.attendance.filter(
            (entry) => entry.studentId === enrollment.student.id,
          ),
        );
        const present = records.filter(
          (entry) => entry.status === "present" || entry.status === "late",
        ).length;
        const absent = records.filter(
          (entry) => entry.status === "absent",
        ).length;
        return { enrollment, records: records.length, present, absent };
      }),
    [enrollments, sessions],
  );

  const columns: DataTableColumn<(typeof summary)[number]>[] = [
    {
      header: "الطالب",
      render: ({ enrollment }) => (
        <span className="font-bold text-[13px] text-text">
          {enrollment.student.fullName}
        </span>
      ),
    },
    {
      header: "إجمالي الحصص",
      accessor: "records",
      cellClassName: "text-[13px] font-inter text-text-muted",
    },
    {
      header: "حاضر",
      accessor: "present",
      cellClassName: "text-[13px] font-bold font-inter text-success",
    },
    {
      header: "غائب",
      accessor: "absent",
      cellClassName: "text-[13px] font-bold font-inter text-destructive",
    },
    {
      header: "نسبة الحضور",
      render: ({ records, present }) => {
        if (!records) return <span className="text-text-faint">--</span>;
        const percentage = Math.round((present / records) * 100);
        return (
          <span
            className={
              percentage >= 50
                ? "text-success font-bold font-inter text-[13px]"
                : "text-destructive font-bold font-inter text-[13px]"
            }
          >
            {percentage}%
          </span>
        );
      },
    },
  ];

  return (
    <DataTable
      title="تقارير الالتزام بالحضور"
      description="نظرة شاملة على مدى التزام كل طالب مسجل في المجموعة."
      data={summary}
      columns={columns}
      getRowId={({ enrollment }) => String(enrollment.student.id)}
      emptyMessage={
        <EmptyState
          icon={<CheckCircle2 size={24} />}
          title="لا توجد بيانات حضور"
          description="سيتم تجميع بيانات الحضور تلقائياً بمجرد تسجيلها في الحصص."
        />
      }
    />
  );
}

type SessionFormState = {
  sessionDate: string;
  sessionType: SessionType;
  scheduledStartTime: string;
  durationMinutes: string;
  isMandatory: boolean;
  topic: string;
};

function CreateClassSessionDialog({
  classId,
  open,
  onOpenChange,
}: {
  classId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { notify } = useNotification();
  const createMutation = useCreateClassSession(classId);
  const [form, setForm] = useState<SessionFormState>(() => ({
    sessionDate: new Date().toISOString().slice(0, 10),
    sessionType: "regular",
    scheduledStartTime: "",
    durationMinutes: "60",
    isMandatory: true,
    topic: "",
  }));

  const resetForm = () => {
    setForm({
      sessionDate: new Date().toISOString().slice(0, 10),
      sessionType: "regular",
      scheduledStartTime: "",
      durationMinutes: "60",
      isMandatory: true,
      topic: "",
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createMutation.mutateAsync({
        sessionDate: form.sessionDate,
        sessionType: form.sessionType,
        scheduledStartTime: form.scheduledStartTime || null,
        durationMinutes: Number(form.durationMinutes),
        isMandatory: form.isMandatory,
        topic: form.topic.trim() || null,
      });
      notify.success("تمت إضافة الحصة إلى الجدول الزمني");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "تعذر إضافة الحصة");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إضافة حصة جديدة</DialogTitle>
          <DialogDescription>أضف الحصة إلى جدول المجموعة وحدد نوعها ومدة تنفيذها.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="session-date">تاريخ الحصة</FieldLabel>
              <Input id="session-date" type="date" required value={form.sessionDate} onChange={(event) => setForm((current) => ({ ...current, sessionDate: event.currentTarget.value }))} />
            </Field>
            <Field>
              <FieldLabel htmlFor="session-type">نوع الحصة</FieldLabel>
              <Select value={form.sessionType} onValueChange={(value) => setForm((current) => ({ ...current, sessionType: (value || "regular") as SessionType }))}>
                <SelectTrigger id="session-type" className="w-full"><SelectValue>{sessionTypeLabels[form.sessionType]}</SelectValue></SelectTrigger>
                <SelectContent>
                  {(Object.entries(sessionTypeLabels) as Array<[SessionType, string]>).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="scheduled-start-time">وقت البداية</FieldLabel>
              <Input id="scheduled-start-time" type="time" value={form.scheduledStartTime} onChange={(event) => setForm((current) => ({ ...current, scheduledStartTime: event.currentTarget.value }))} />
            </Field>
            <Field>
              <FieldLabel htmlFor="duration-minutes">المدة بالدقائق</FieldLabel>
              <Input id="duration-minutes" type="number" min="1" max="600" required value={form.durationMinutes} onChange={(event) => setForm((current) => ({ ...current, durationMinutes: event.currentTarget.value }))} />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="session-topic">موضوع الحصة</FieldLabel>
            <Input id="session-topic" placeholder="مثال: مراجعة الوحدة الأولى" value={form.topic} onChange={(event) => setForm((current) => ({ ...current, topic: event.currentTarget.value }))} />
          </Field>
          <label className="flex items-center gap-2 text-xs text-text">
            <Checkbox checked={form.isMandatory} onCheckedChange={(checked) => setForm((current) => ({ ...current, isMandatory: checked === true }))} />
            حصة إلزامية للطلاب
          </label>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="neutral" />}>إلغاء</DialogClose>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "جارٍ الحفظ..." : "إضافة الحصة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
