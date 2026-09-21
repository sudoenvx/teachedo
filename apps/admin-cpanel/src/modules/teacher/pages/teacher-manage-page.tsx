import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Globe2,
  History,
  KeyRound,
  LogIn,
  Phone,
  Plus,
  ReceiptText,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  SlidersHorizontal,
  Users,
  GraduationCap,
  UserCheck,
  Clock,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Badge, Breadcrumb, StatisticCard, Typography } from "@teachedo/ui/legacy";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CopyButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@teachedo/ui/components";
import { useTeacherProfile } from "@/modules/teacher/api/teacher-profiles.queries";
import { AVATAR_PLACEHOLDER } from "@/core/assets";
import { useNotification } from "@/core/hooks/use_notification";
import { useDeleteTeacher, useUpdateTeacher, useUpdateTeacherStatus } from "../api/teachers.mutations";
import { TeacherAccountTab } from "../tabs/teacher-account-tab";
import { TeacherBillingTab } from "../tabs/teacher-billing-tab";

type TeacherTab = "overview" | "invoices" | "account" | "activities";
type ActivityFilter = "all" | "billing" | "access" | "system";
type TeacherActivity = {
  id: string;
  type: Exclude<ActivityFilter, "all">;
  title: string;
  meta: string;
  date: string;
};

const ACTIVITY_TYPE_META: Record<
  Exclude<ActivityFilter, "all">,
  { label: string; icon: LucideIcon; iconTone: string; badgeTone: string }
> = {
  billing: {
    label: "الفوترة",
    icon: ReceiptText,
    iconTone: "bg-warning/15 text-warning",
    badgeTone: "bg-warning/10 text-warning",
  },
  access: {
    label: "الوصول",
    icon: KeyRound,
    iconTone: "bg-info/15 text-info",
    badgeTone: "bg-info/10 text-info",
  },
  system: {
    label: "النظام",
    icon: SlidersHorizontal,
    iconTone: "bg-secondary/15 text-secondary-hover",
    badgeTone: "bg-secondary/10 text-secondary-hover",
  },
};

const STATUS_MAP: Record<
  string,
  { label: string; variant: "success" | "warning" | "danger" | "primary" }
> = {
  active: { label: "نشط", variant: "success" },
  trial: { label: "تجريبي", variant: "warning" },
  suspended_payment: { label: "موقوف (فواتير)", variant: "danger" },
  inactive: { label: "غير نشط", variant: "danger" },
};

export default function TeacherManagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState<TeacherTab>("overview");
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const teacherId = Number(id);
  const { data: teacher, isLoading } = useTeacherProfile(teacherId);
  const updateMutation = useUpdateTeacher(teacherId);
  const statusMutation = useUpdateTeacherStatus(teacherId);
  const deleteMutation = useDeleteTeacher();

  if (isLoading || !teacher)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-text-muted animate-pulse">
          <Users size={32} />
          <Typography variant="body-small">جاري تحميل ملف المدرس...</Typography>
        </div>
      </div>
    );

  const status = STATUS_MAP[
    (teacher.accountStatus || teacher.status || "active").toLowerCase()
  ] || { label: teacher.accountStatus, variant: "primary" as const };
  const teacherName = teacher.fullName || teacher.name;
  const initials = teacherName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const teacherSlug = teacherName.toLowerCase().trim().replace(/\s+/g, "-");
  const joinedAt = teacher.joinDate || teacher.createdAt?.split("T")[0] || "—";
  const isHealthy = status.label === "نشط" || status.label === "تجريبي";
  const latestPayment = teacher.recentPayments?.[0];
  const invoices = teacher.recentInvoices || [];
  const invoiceTotals = invoices.reduce(
    (totals, invoice) => ({
      amount: totals.amount + invoice.amount,
      paid: totals.paid + invoice.amountPaid,
    }),
    { amount: 0, paid: 0 },
  );
  const outstandingAmount = Math.max(invoiceTotals.amount - invoiceTotals.paid, 0);
  const activities: TeacherActivity[] = [
    ...invoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      type: "billing" as const,
      title: `تم إصدار فاتورة شهر ${invoice.month}`,
      meta: `${invoice.amount.toLocaleString()} ج.م · ${invoice.isPaid || invoice.status === "paid" ? "مسددة بالكامل" : "مستحقة"}`,
      date: invoice.month,
    })),
    ...(teacher.recentPayments || []).map((payment) => ({
      id: `payment-${payment.id}`,
      type: "billing" as const,
      title: `تم تسجيل دفعة بقيمة ${payment.amount.toLocaleString()} ج.م`,
      meta: payment.paymentMethod || "دفعة مالية",
      date: payment.paidAt,
    })),
    {
      id: "account-created",
      type: "system",
      title: "تم إنشاء حساب المدرس وإرسال الدعوة",
      meta: teacherName,
      date: teacher.createdAt || joinedAt,
    },
  ];
  const visibleActivities = activityFilter === "all"
    ? activities
    : activities.filter((activity) => activity.type === activityFilter);
  const updateProfile = async (values: {
    fullName: string;
    subjectSpecialization: string;
    phoneNumber: string;
    email: string;
    password: string;
  }) => {
    await updateMutation.mutateAsync(
      {
        fullName: values.fullName,
        ...(values.password ? { password: values.password } : {}),
      },
      {
        onSuccess: () => notify.success("تم تحديث بيانات المدرس بنجاح"),
        onError: (error) => notify.error(error.message),
      },
    );
  };
  const deleteTeacher = async () => {
    if (!window.confirm("هل أنت متأكد من حذف حساب المدرس؟")) return;
    await deleteMutation.mutateAsync(
      { id: teacherId },
      {
        onSuccess: () => {
          notify.success("تم حذف حساب المدرس");
          navigate("/teachers");
        },
        onError: (error) => notify.error(error.message),
      },
    );
  };
  const suspendTeacher = async () => {
    await statusMutation.mutateAsync(
      { accountStatus: "inactive" },
      {
        onSuccess: () => notify.success("تم تعليق حساب المدرس"),
        onError: (error) => notify.error(error.message),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-10 animate-in fade-in duration-300">
      <Breadcrumb
        showHome
        items={[
          { label: "المدرسون", href: "/teachers" },
          { label: teacher.fullName || teacher.name },
        ]}
      />
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TeacherTab)}
        className="flex flex-col gap-4"
      >
      <section className="flex flex-col rounded-md overflow-hidden  bg-surface">
        <div className="flex flex-col gap-5 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
                {!teacher.profilePictureUrl && (
                <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                  {initials}
                </span>
              )}
              <img
                alt="صورة المدرس"
                src={teacher.profilePictureUrl || AVATAR_PLACEHOLDER}
                className="h-16 w-16 rounded-lg bg-accent-subtle object-cover"
              />
              
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Typography
                  variant="title-large"
                  element="h1"
                  className="truncate font-bold text-text"
                >
                  {teacherName}
                </Typography>
                <Badge variant={status.variant} size="sm">
                  {status.label}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.75"
                  dir="ltr"
                >
                  <Sparkles size={13} />{" "}
                  {teacher.subjectSpecialization ||
                    teacher.subject ||
                    "خطة المدرس"}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.75"
                  dir="ltr"
                >
                  <Globe2 size={13} /> {teacherSlug}.teachedo.com
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.75"
                  dir="ltr"
                >
                  <CalendarDays size={13} /> انضم {joinedAt}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.75">
                  <Clock3 size={13} /> منذ فترة قصيرة
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/teachers/${teacherId}?invoice=new`)}
            >
              <Plus size={15} /> فاتورة جديدة
            </Button>
            <Button
              type="button"
              onClick={() => navigate(`/teachers/${teacherId}?login=teacher`)}
            >
              الدخول كمدرس <LogIn size={15} />
            </Button>
          </div>
        </div>
        <TabsList  className="flex gap-1 justify-start overflow-x-auto border-t border-border-subtle">
          <TabsTrigger value="overview" className="shrink-0 gap-1.5">
            <Activity size={14} /> نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="invoices" className="shrink-0 gap-1.5">
            <FileText size={14} /> الفواتير
          </TabsTrigger>
          <TabsTrigger value="account" className="shrink-0 gap-1.5">
            <KeyRound size={14} /> الحساب والوصول
          </TabsTrigger>
          <TabsTrigger value="activities" className="shrink-0 gap-1.5">
            <History size={14} /> سجل الأنشطة
          </TabsTrigger>
        </TabsList>
      </section>
        <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-4">
            <Card size="sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ShieldCheck size={15} /> صحة الحساب
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                  <span className="text-text-muted">الحالة</span>
                  <span className="flex items-center gap-1.5 font-medium text-success">
                    {isHealthy ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                  <span className="text-text-muted">آخر دخول</span>
                  <span className="flex items-center gap-1.5 text-text font-medium">
                    <Clock3 size={13} /> منذ فترة قصيرة
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                  <span className="text-text-muted">نظام الدفع</span>
                  <span className="flex items-center gap-1.5 text-text font-medium">
                    <BadgeCheck size={13} className="text-success" /> منتظم
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-text-muted">استخدام الحدود</span>
                  <span className="text-text font-medium">أقل من 60%</span>
                </div>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Phone size={15} /> بيانات التواصل
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-xs">
                {[
                  { label: "البريد الإلكتروني", value: teacher.email || "" },
                  { label: "رقم الهاتف", value: teacher.phoneNumber || teacher.phone || "" },
                  { label: "عنوان المدرس", value: `${teacherSlug}.teachedo.com` },
                ].map(({ label, value }, index) => (
                  <div key={label} dir="ltr" className={`flex items-center gap-2 ${index > 0 ? "border-t border-border-subtle pt-2" : ""}`}>
                    <CopyButton value={value} disabled={!value}/>
                    <div className="min-w-0 flex-1 text-end" >
                      <p className="m-0 text-[12px] text-text-muted">{label}</p>
                      <p className="m-0 mt-1 truncate text-[11px] font-medium text-text" dir="ltr">{value || "—"}</p>
                    </div>
                    {/* <Icon size={17} className="shrink-0 text-text-muted" /> */}
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          <main className="min-w-0">
            <TabsContent value="overview" className="mt-0">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatisticCard label="الطلاب المسجلون" value={teacher.stats?.totalStudents?.toLocaleString() || "0"} icon={GraduationCap} iconClassName="bg-primary/10 text-primary" description={() => <span className="text-[11px] text-text-muted">إجمالي الطلاب</span>} />
                  <StatisticCard label="المجموعات الدراسية" value={String(teacher.stats?.activeGroups || 0)} icon={Users} iconClassName="bg-accent/20 text-accent-hover" description={() => <span className="text-[11px] text-text-muted">مجموعات نشطة</span>} />
                  <StatisticCard label="المساعدين" value={String(teacher.stats?.totalAssistants || 0)} icon={UserCheck} iconClassName="bg-success/20 text-success" description={() => <span className="text-[11px] text-text-muted">مساعد نشط</span>} />
                  <StatisticCard label="إجمالي الحصص" value={String(teacher.stats?.totalSessions || 0)} icon={Clock} iconClassName="bg-secondary/15 text-secondary-hover" description={() => <span className="text-[11px] text-text-muted">حصص مسجلة</span>} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card size="sm">
                    <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><CreditCard size={15} /> آخر دفعة</CardTitle></CardHeader>
                    <CardContent className="flex items-end justify-between gap-3">
                      <div><p className="m-0 text-xl font-bold tabular-nums text-text">{latestPayment ? `${latestPayment.amount.toLocaleString()} ج.م` : "—"}</p><p className="m-0 mt-1 text-xs text-text-muted">{latestPayment?.paidAt?.split("T")[0] || "لا توجد دفعات مسجلة"}</p></div>
                      <Badge variant={latestPayment?.status === "paid" ? "success" : "neutral"} size="sm">{latestPayment ? "مكتملة" : "غير متاح"}</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="invoices" className="mt-0">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatisticCard
                    label="إجمالي الفواتير"
                    value={`${invoiceTotals.amount.toLocaleString()} ج.م`}
                    icon={FileText}
                    iconClassName="bg-primary/10 text-primary"
                    description={() => <span className="text-[11px] text-text-muted">كل الفترات</span>}
                  />
                  <StatisticCard
                    label="إجمالي المدفوع"
                    value={`${invoiceTotals.paid.toLocaleString()} ج.م`}
                    icon={CheckCircle2}
                    iconClassName="bg-success/10 text-success"
                    description={() => <span className="text-[11px] text-text-muted">تم تحصيله</span>}
                  />
                  <StatisticCard
                    label="المبلغ المتبقي"
                    value={`${outstandingAmount.toLocaleString()} ج.م`}
                    icon={Clock3}
                    iconClassName="bg-warning/10 text-warning"
                    description={() => <span className="text-[11px] text-text-muted">قيد التحصيل</span>}
                  />
                  <StatisticCard
                    label="عدد الفواتير"
                    value={String(invoices.length)}
                    icon={CreditCard}
                    iconClassName="bg-secondary/15 text-secondary-hover"
                    description={() => <span className="text-[11px] text-text-muted">دورات فوترة</span>}
                  />
                </div>
                <TeacherBillingTab invoices={invoices} />
              </div>
            </TabsContent>
            <TabsContent value="account" className="mt-0">
              <div className="flex flex-col gap-4">
                <TeacherAccountTab
                  teacher={teacher}
                  isPending={updateMutation.isPending}
                  onSubmit={updateProfile}
                />
                <Card size="xs">
                  <CardContent className="grid gap-6 p-3 lg:grid-cols-[220px_minmax(0,1fr)]" dir="rtl">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-sm text-destructive">
                        <ShieldAlert size={15} /> منطقة حساسة
                      </CardTitle>
                      <p className="m-0 mt-2 text-xs leading-relaxed text-text-muted">إجراءات تؤثر على وصول المدرس وبياناته وطلابه.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col justify-between gap-3 border-b border-border-subtle pb-3 sm:flex-row sm:items-center">
                        <div><p className="m-0 text-xs font-semibold text-text">تعليق الحساب</p><p className="m-0 mt-1 text-[11px] text-text-muted">يوقف دخول المدرس فوراً مع الاحتفاظ بالبيانات والفواتير.</p></div>
                        <Button type="button" variant="destructive" size="sm" disabled={statusMutation.isPending} onClick={suspendTeacher}>تعليق الحساب</Button>
                      </div>
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div><p className="m-0 text-xs font-semibold text-text">حذف المدرس نهائياً</p><p className="m-0 mt-1 text-[11px] text-text-muted">يحذف الحساب وكل بياناته. لا يمكن التراجع بعد التنفيذ.</p></div>
                        <Button type="button" variant="destructive" size="sm" disabled={deleteMutation.isPending} onClick={deleteTeacher}>حذف المدرس</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="activities" className="mt-0">
              <Card size="sm" className="overflow-hidden">
                <CardHeader className="gap-4 border-b border-border-subtle bg-surface-secondary/40 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <History size={15} /> سجل النشاط
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-normal text-text-muted">
                        {activities.length} أحداث
                      </span>
                    </CardTitle>
                    <p className="m-0 mt-1 text-[11px] text-text-muted">آخر التغييرات والأحداث المرتبطة بحساب المدرس.</p>
                  </div>
                  <div className="flex w-fit items-center gap-1 rounded-md bg-neutral-100 p-1" dir="rtl">
                    {[
                      { value: "all" as const, label: "الكل" },
                      { value: "billing" as const, label: "الفوترة" },
                      { value: "access" as const, label: "الوصول" },
                      { value: "system" as const, label: "النظام" },
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setActivityFilter(filter.value)}
                        aria-pressed={activityFilter === filter.value}
                        className={`rounded-sm px-3 py-1.5 text-[11px] font-medium transition-colors ${activityFilter === filter.value ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text"}`}
                      >
                        {filter.label}
                        {filter.value !== "all" && (
                          <span className="ms-1 text-[10px] text-text-faint">
                            {activities.filter((activity) => activity.type === filter.value).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {visibleActivities.length > 0 ? (
                    <div className="flex flex-col px-1" dir="rtl">
                      {visibleActivities.map((activity, index) => {
                        const activityMeta = ACTIVITY_TYPE_META[activity.type];
                        const Icon = activityMeta.icon;
                        return (
                          <div
                            key={activity.id}
                            className={`group flex items-start gap-3 px-2 py-4 transition-colors hover:bg-surface-secondary/60 ${index > 0 ? "border-t border-border-subtle" : ""}`}
                          >
                            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${activityMeta.iconTone}`}>
                              <Icon size={17} strokeWidth={1.8} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="m-0 text-sm font-medium text-text">{activity.title}</p>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${activityMeta.badgeTone}`}>
                                  {activityMeta.label}
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-muted">
                                <span>{activity.meta}</span>
                                <span aria-hidden="true">·</span>
                                <span>{activity.type === "billing" ? "النظام" : "حساب المدرس"}</span>
                              </div>
                            </div>
                            <time className="shrink-0 pt-1 text-[11px] text-text-muted" dir="ltr">
                              {activity.date ? activity.date.split("T")[0] : "—"}
                            </time>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-12 text-center text-text-muted">
                      <span className="flex size-10 items-center justify-center rounded-full bg-neutral-100">
                        {activityFilter === "all" ? <History size={20} /> : (() => {
                          const Icon = ACTIVITY_TYPE_META[activityFilter].icon;
                          return <Icon size={20} />;
                        })()}
                      </span>
                      <p className="m-0 text-sm">لا توجد أنشطة ضمن هذا التصنيف.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </main>
        </div>
      </Tabs>
    </div>
  );
}
