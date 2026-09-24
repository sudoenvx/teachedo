import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Download,
  Edit3,
  GraduationCap,
  KeyRound,
  MessageCircle,
  Phone,
  ReceiptText,
  UserRound,
  Users,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CopyButton,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@teachedo/ui/components";

import { useNotification } from "@/core/hooks/use_notification";
import { BASE_URL } from "@/core/config";
import { useRegenerateStudentCredentials } from "../api/students.mutations";
import { useStudent } from "../api/students.queries";
import type { StudentDetails } from "../types/student.types";
import { cn } from "cn"; // تأكد من استيراد دالة الدمج الخاصة بك

type ProfileTab = "overview" | "grades" | "payments" | "attendance" | "groups";

const tabs: Array<{ value: ProfileTab; label: string; icon: LucideIcon }> = [
  { value: "overview", label: "نظرة عامة", icon: UserRound },
  { value: "grades", label: "الدرجات", icon: GraduationCap },
  { value: "payments", label: "المدفوعات", icon: CreditCard },
  { value: "attendance", label: "الحضور", icon: CalendarCheck },
  { value: "groups", label: "المجموعات", icon: Users },
];

/* ---------- Helpers ---------- */

function imageUrl(path?: string | null) {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${BASE_URL}${path}`;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");
}

function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "غير محدد";
  return `${Number(value).toLocaleString("ar-EG")} ج.م`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    active: "نشط",
    inactive: "غير نشط",
    paid: "مدفوعة",
    pending: "معلّقة",
    overdue: "متأخرة",
    present: "حاضر",
    late: "متأخر",
    absent: "غائب",
  };
  return labels[status] ?? status;
}

function activeEnrollments(student: StudentDetails) {
  return (
    student.classEnrollments?.filter((item) => item.status === "active") || []
  );
}

function outstandingAmount(student: StudentDetails) {
  return (student.invoices || []).reduce((sum, invoice) => {
    if (invoice.status === "paid") return sum;
    const due = Number(invoice.amountDue) || 0;
    const paid = Number(invoice.amountPaid) || 0;
    return sum + Math.max(0, due - paid);
  }, 0);
}

function overdueInvoicesCount(student: StudentDetails) {
  return (student.invoices || []).filter(
    (invoice) => invoice.status === "overdue",
  ).length;
}

function attendanceBreakdown(student: StudentDetails) {
  const records = student.attendance || [];
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const rate = records.length
    ? Math.round(((present + late) / records.length) * 100)
    : null;
  return { rate, late, absent, total: records.length };
}

function parentPhoneOf(student: StudentDetails) {
  return student.parent?.phoneNumber || student.parentPhone || null;
}
function parentWhatsappOf(student: StudentDetails) {
  return (
    student.parent?.whatsappNumber ||
    student.parentWhatsapp ||
    parentPhoneOf(student)
  );
}
function parentNameOf(student: StudentDetails) {
  return student.parent?.fullName || student.parentName || null;
}
function waLink(phone?: string | null, message?: string) {
  if (!phone) return undefined;
  const digits = phone.replace(/[^\d]/g, "").replace(/^0/, "20");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/* ---------- Attention Items ---------- */
type AttentionItem = {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  type: "danger" | "warning";
};

function buildAttentionItems(
  student: StudentDetails,
  goTo: (tab: ProfileTab) => void,
): AttentionItem[] {
  const items: AttentionItem[] = [];
  const outstanding = outstandingAmount(student);
  const overdue = overdueInvoicesCount(student);

  if (overdue > 0) {
    items.push({
      id: "overdue",
      message: `توجد ${overdue} فواتير متأخرة بقيمة ${formatCurrency(outstanding)}`,
      actionLabel: "تسوية",
      onAction: () => goTo("payments"),
      type: "danger",
    });
  } else if (outstanding > 0) {
    items.push({
      id: "pending",
      message: `مستحق حاليًا ${formatCurrency(outstanding)}`,
      actionLabel: "عرض",
      onAction: () => goTo("payments"),
      type: "warning",
    });
  }

  const { absent } = attendanceBreakdown(student);
  if (absent >= 3) {
    items.push({
      id: "absences",
      message: `غاب الطالب ${absent} مرات متكررة`,
      actionLabel: "مراجعة",
      onAction: () => goTo("attendance"),
      type: "danger",
    });
  }

  if (!student.phoneNumber && !parentPhoneOf(student)) {
    items.push({
      id: "contact",
      message: "بيانات تواصل الطالب وولي الأمر مفقودة",
      type: "warning",
    });
  }

  return items;
}

// ============================================================================
// Main Component
// ============================================================================

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const studentId = Number(id);
  const { data: student, isLoading } = useStudent(studentId);
  const credentialsMutation = useRegenerateStudentCredentials();

  const credentials = newPassword || student?.plainPassword || "";
  const qrUrl = student?.studentCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(student.studentCode)}`
    : "";

  const attentionItems = useMemo(
    () => (student ? buildAttentionItems(student, setActiveTab) : []),
    [student],
  );

  if (isLoading) return <StudentProfileLoading />;

  if (!student) {
    return (
      <Empty className="min-h-[50vh]">
        <EmptyMedia variant="icon">
          <UserRound />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>الطالب غير موجود</EmptyTitle>
          <EmptyDescription>
            تعذر تحميل بيانات الطالب المطلوبة.
          </EmptyDescription>
        </EmptyHeader>
        <Button onClick={() => navigate("/students")}>العودة إلى الطلاب</Button>
      </Empty>
    );
  }

  const parentPhone = parentPhoneOf(student);
  const parentWhatsapp = parentWhatsappOf(student);
  const outstanding = outstandingAmount(student);
  const { rate } = attendanceBreakdown(student);

  const regenerateCredentials = async () => {
    if (
      !window.confirm("سيتم إبطال كلمة المرور الحالية فورًا. هل تريد المتابعة؟")
    )
      return;
    try {
      const result = await credentialsMutation.mutateAsync({ id: student.id });
      setNewPassword(result.newPassword);
      notify.success("تم إصدار بيانات دخول جديدة للطالب");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "تعذر إصدار بيانات الدخول",
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-300">
      {/* --- 1. Header --- */}
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/students">الطلاب</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{student.fullName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <PageHeader
          title="ملف الطالب"
          description="إدارة شاملة لبيانات الطالب الأكاديمية والمالية وطرق التواصل."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/students")}>
                <ArrowRight className="ml-2 h-4 w-4" /> العودة
              </Button>
              <Button render={<Link to={`/students/${student.id}/edit`} />}>
                <Edit3 className="ml-2 h-4 w-4" /> تعديل البيانات
              </Button>
            </div>
          }
        />
      </div>

      {/* --- 2. Advanced Grid Layout --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* === Right Sidebar (Visual Left in LTR, Right in RTL) -> Takes 4 cols === */}
        <aside className="xl:col-span-4 flex flex-col gap-6 xl:sticky xl:top-6">
          {/* Attention Banner (Top of sidebar to catch eyes) */}
          {attentionItems.length > 0 && (
            <AttentionBanner items={attentionItems} />
          )}

          {/* Contact Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="size-5 text-primary" />
                طرق التواصل
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ContactRow
                icon={UserRound}
                label="ولي الأمر"
                value={parentNameOf(student) || "غير مرتبط"}
              />
              <ContactRow
                icon={Phone}
                label="هاتف ولي الأمر"
                value={parentPhone || "غير محدد"}
                phone={parentPhone}
                whatsapp={parentWhatsapp}
              />
              <ContactRow
                icon={Phone}
                label="هاتف الطالب"
                value={student.phoneNumber || "غير محدد"}
                phone={student.phoneNumber}
              />
            </CardContent>
          </Card>

          {/* ID Card / Credentials */}
          <Card>
            <CardHeader className="pb-4 border-b border-border/50 mb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="size-5 text-primary" />
                بطاقة الدخول (ID)
              </CardTitle>
              <CardDescription>
                رمز الـ QR وبيانات الولوج الخاصة بالطالب.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center justify-center rounded-xl bg-muted/50 py-6">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={`QR Code`}
                    className="size-40 rounded-lg bg-white p-2 shadow-sm"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ReceiptText className="size-8 opacity-50" />
                    <span className="text-xs">لا يوجد رمز لإنشاء QR</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Credential
                  label="كود الطالب"
                  value={student.studentCode || "غير محدد"}
                />
                <Credential
                  label="كلمة المرور"
                  value={credentials || "غير متاحة"}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  disabled={credentialsMutation.isPending}
                  onClick={regenerateCredentials}
                >
                  {credentialsMutation.isPending
                    ? "جارٍ الإصدار..."
                    : "إعادة إصدار"}
                </Button>
                {qrUrl && (
                  <Button
                    variant="default"
                    className="flex-1 text-xs"
                    render={
                      <a
                        href={qrUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                  >
                    <Download className="mr-2 h-3 w-3" /> تحميل الرمز
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* === Left Main Area -> Takes 8 cols === */}
        <main className="xl:col-span-8 flex flex-col gap-6">
          {/* Identity & Global Stats Hero */}
          <Card className="overflow-hidden">
            <div className=" flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/50 pb-4">
              <div className="flex items-center gap-5">
                <Avatar className="size-16 sm:size-20 rounded-md ">
                  <AvatarImage src={imageUrl(student.profilePictureUrl)} />
                  <AvatarFallback className="rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
                    {getInitials(student.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-foreground">
                      {student.fullName}
                    </h2>
                    <Badge
                      variant={
                        student.status === "active" ? "default" : "secondary"
                      }
                      className="px-2.5 py-0.5"
                    >
                      {statusLabel(student.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
                    <BookOpen className="size-4" />{" "}
                    {student.stageName || "مرحلة غير محددة"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricBox
                label="المجموعات"
                value={String(activeEnrollments(student).length)}
                icon={Users}
              />
              <MetricBox
                label="نسبة الحضور"
                value={rate ? `${rate}%` : "0%"}
                icon={CalendarCheck}
              />
              <MetricBox
                label="إجمالي الفواتير"
                value={String(student.invoices?.length || 0)}
                icon={ReceiptText}
              />
              <MetricBox
                label="المستحق"
                value={formatCurrency(outstanding)}
                icon={CreditCard}
                alert={outstanding > 0}
              />
            </div>
          </Card>

          {/* Deep Dive Tabs */}
          <Card className="flex flex-col min-h-[500px]">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as ProfileTab)}
              className="w-full flex flex-col gap-4"
            >
              <div className="border-b border-border overflow-x-auto">
                <TabsList className="bg-transparent h-10 w-full justify-start gap-2">
                  {tabs.map(({ value, label, icon: Icon }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="font-semibold hover:bg-neutral-200"
                    >
                      <Icon className="ml-1 size-4" />
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="">
                <TabsContent
                  value="overview"
                  className="m-0 focus-visible:outline-none"
                >
                  <Overview student={student} />
                </TabsContent>
                <TabsContent
                  value="grades"
                  className="m-0 focus-visible:outline-none"
                >
                  <Empty className="min-h-64  rounded-lg bg-surface-secondary">
                    <EmptyMedia variant="icon">
                      <GraduationCap />
                    </EmptyMedia>
                    <EmptyHeader>
                      <EmptyTitle>الدرجات قريباً</EmptyTitle>
                      <EmptyDescription>
                        ستظهر نتائج الامتحانات هنا بمجرد التفعيل.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TabsContent>
                <TabsContent
                  value="payments"
                  className="m-0 focus-visible:outline-none"
                >
                  <Payments student={student} />
                </TabsContent>
                <TabsContent
                  value="attendance"
                  className="m-0 focus-visible:outline-none"
                >
                  <Attendance student={student} />
                </TabsContent>
                <TabsContent
                  value="groups"
                  className="m-0 focus-visible:outline-none"
                >
                  <Groups student={student} />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function MetricBox({
  label,
  value,
  icon: Icon,
  alert,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  alert?: boolean;
}) {
  return (
    <div className="p-2 rounded-md sm:p-3 flex flex-col justify-center bg-surface-secondary transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Icon
          className={cn(
            "size-4",
            alert ? "text-destructive" : "text-muted-foreground",
          )}
        />
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <span
        className={cn(
          "text-xl font-bold tracking-tight",
          alert ? "text-destructive" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Credential({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3 flex flex-col justify-between">
      <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">
        {label}
      </p>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-bold text-foreground" dir="ltr">
          {value}
        </p>
        {value !== "غير محدد" && value !== "غير متاحة" && (
          <CopyButton value={value} size="icon-xs" variant="ghost" />
        )}
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  phone,
  whatsapp,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  phone?: string | null;
  whatsapp?: string | null;
}) {
  const canAct = Boolean(phone);
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="size-4 text-primary" />
        </div>
        <div className="min-w-0 flex flex-col">
          <p className="text-[11px] text-muted-foreground font-medium">
            {label}
          </p>
          <p
            className="truncate text-sm font-bold text-foreground mt-0.5"
            dir={canAct ? "ltr" : undefined}
          >
            {value}
          </p>
        </div>
      </div>
      {canAct && (
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="secondary"
            size="icon-sm"
            className="size-8 rounded-full"
            render={<a href={`tel:${phone}`} title="اتصال" />}
          >
            <Phone className="size-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon-sm"
            className="size-8 rounded-full bg-success/20 text-text hover:bg-success/30"
            render={
              <a
                href={waLink(whatsapp || phone)}
                target="_blank"
                rel="noreferrer"
                title="واتساب"
              />
            }
          >
            <MessageCircle className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

function AttentionBanner({ items }: { items: AttentionItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border",
            item.type === "danger"
              ? "bg-destructive/10 border-destructive/20"
              : "bg-warning/10 border-warning/20",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2 text-sm font-bold",
              item.type === "danger" ? "text-destructive" : "text-warning",
            )}
          >
            {item.type === "danger" ? (
              <AlertTriangle className="size-5 shrink-0" />
            ) : (
              <AlertCircle className="size-5 shrink-0" />
            )}
            {item.message}
          </div>
          {item.actionLabel && item.onAction && (
            <Button
              size="sm"
              variant={item.type === "danger" ? "destructive" : "outline"}
              className="h-8 text-xs"
              onClick={item.onAction}
            >
              {item.actionLabel}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Tab Contents (Cleaned up DataTables) ---

function Overview({ student }: { student: StudentDetails }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SectionCard
        title="المجموعات النشطة"
        icon={Users}
        items={activeEnrollments(student)}
        empty="لا يوجد"
        render={(c) => (
          <div className="flex items-center gap-3">
            <BookOpen className="size-4 text-primary" />
            <span className="font-semibold text-sm">
              {c.studentClass.className}
            </span>
          </div>
        )}
      />
      <SectionCard
        title="آخر الحضور"
        icon={CalendarCheck}
        items={(student.attendance || []).slice(0, 3)}
        empty="لا يوجد"
        render={(a) => (
          <div className="flex justify-between items-center w-full">
            <span className="text-sm font-medium">
              {a.session?.topic || "حصة"} -{" "}
              {formatDate(a.session?.sessionDate || a.recordedAt)}
            </span>
            <Badge variant="outline">{statusLabel(a.status)}</Badge>
          </div>
        )}
      />
    </div>
  );
}

function Payments({ student }: { student: StudentDetails }) {
  return (
    <div className="flex flex-col gap-6">
      <CustomDataTable
        headers={["الشهر", "المجموعة", "المستحق", "المدفوع", "الحالة"]}
        rows={(student.invoices || []).map((i) => [
          i.billingMonth,
          i.studentClass?.className || "—",
          formatCurrency(i.amountDue),
          formatCurrency(i.amountPaid),
          <Badge
            key={i.id}
            variant={i.status === "paid" ? "default" : "destructive"}
          >
            {statusLabel(i.status)}
          </Badge>,
        ])}
        empty="لا توجد فواتير"
      />
    </div>
  );
}

function Attendance({ student }: { student: StudentDetails }) {
  return (
    <CustomDataTable
      headers={["التاريخ", "الحصة", "المجموعة", "الحالة"]}
      rows={(student.attendance || []).map((a) => [
        formatDate(a.session?.sessionDate || a.recordedAt),
        a.session?.topic || "حصة",
        a.session?.studentClass?.className || "—",
        <Badge
          key={a.id}
          variant={
            a.status === "present"
              ? "default"
              : a.status === "late"
                ? "warning"
                : "destructive"
          }
        >
          {statusLabel(a.status)}
        </Badge>,
      ])}
      empty="لا توجد سجلات حضور"
    />
  );
}

function Groups({ student }: { student: StudentDetails }) {
  return (
    <CustomDataTable
      headers={["المجموعة", "الحالة", "السعر الشهري"]}
      rows={(student.classEnrollments || []).map((e) => [
        <span key={e.studentClass.id} className="font-bold">
          {e.studentClass.className}
        </span>,
        <Badge
          key={`s-${e.studentClass.id}`}
          variant={e.status === "active" ? "default" : "secondary"}
        >
          {statusLabel(e.status)}
        </Badge>,
        formatCurrency(e.customPrice ?? e.studentClass.monthlyPrice),
      ])}
      empty="لا توجد مجموعات"
    />
  );
}

// --- Reusable Internal UI ---

function SectionCard<T>({
  title,
  icon: Icon,
  items,
  render,
  empty,
}: {
  title: string;
  icon: LucideIcon;
  items: T[];
  render: (i: T) => ReactNode;
  empty: string;
}) {
  return (
    <Card>
      <CardHeader className="py-4 border-b border-border/50">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="size-4 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!items.length ? (
          <p className="p-4 text-sm text-muted-foreground text-center">
            {empty}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 hover:bg-muted/20 transition-colors"
              >
                {render(item)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CustomDataTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: ReactNode[][];
  empty: string;
}) {
  if (!rows.length)
    return (
      <div className="p-10 text-center text-muted-foreground rounded-lg bg-surface-secondary">
        {empty}
      </div>
    );
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {headers.map((h) => (
              <TableHead key={h} className="font-bold">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j} className="py-3">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StudentProfileLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-muted-foreground animate-pulse">
      <UserRound className="size-10 opacity-20" />
      <p className="text-sm font-medium">جارٍ تحميل بيانات الطالب...</p>
    </div>
  );
}
