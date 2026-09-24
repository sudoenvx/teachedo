import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  UserCheck,
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
  CardDescription,
  CardHeader,
  CardTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Input,
  PageHeader,
} from "@teachedo/ui/components";
import { useNotification } from "@/core/hooks/use_notification";
import { useLiveClassSession } from "@/modules/groups/api/groups.queries";
import {
  useRecordClassSessionAttendance,
  useStartClassSession,
} from "@/modules/groups/api/groups.mutations";

const formatTime = (value?: string | null) => {
  if (!value) return "وقت غير محدد";
  const time = value.includes("T") ? value.slice(11, 16) : value.slice(0, 5);
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(1970, 0, 1, hours, minutes));
};

const typeLabels: Record<string, string> = {
  regular: "حصة عادية",
  extra_revision: "مراجعة إضافية",
  final_revision: "مراجعة نهائية",
  quiz_only: "اختبار قصير",
  mock_exam: "اختبار تجريبي",
  assessment: "تقييم",
  other: "أخرى",
};

export default function LiveDeskPage() {
  const { classId, sessionId } = useParams<{
    classId: string;
    sessionId: string;
  }>();
  const parsedClassId = Number(classId);
  const parsedSessionId = Number(sessionId);
  const { notify } = useNotification();
  const {
    data: session,
    isLoading,
    isError,
  } = useLiveClassSession(parsedClassId, parsedSessionId);
  const startMutation = useStartClassSession(parsedClassId, parsedSessionId);
  const attendanceMutation = useRecordClassSessionAttendance(
    parsedClassId,
    parsedSessionId,
  );
  const startedRef = useRef(false);
  const [studentCode, setStudentCode] = useState("");

  useEffect(() => {
    if (
      !session ||
      startedRef.current ||
      ["live", "completed", "cancelled"].includes(session.status || "")
    )
      return;
    startedRef.current = true;
    startMutation
      .mutateAsync()
      .catch((error) =>
        notify.error(error instanceof Error ? error.message : "تعذر بدء الحصة"),
      );
  }, [notify, session, startMutation]);

  const attendanceByStudent = useMemo(
    () =>
      new Map(
        (session?.attendance || []).map((entry) => [entry.studentId, entry]),
      ),
    [session?.attendance],
  );
  const checkedInCount =
    session?.attendance.filter(
      (entry) => entry.status === "present" || entry.status === "late",
    ).length || 0;
  const totalExpected = session?.studentClass.enrollments.length || 0;

  const recordByCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = studentCode.trim();
    if (!code) return;
    try {
      await attendanceMutation.mutateAsync({
        studentCode: code,
        status: "present",
      });
      setStudentCode("");
      notify.success("تم تسجيل حضور الطالب");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "تعذر تسجيل الحضور",
      );
    }
  };

  const recordByStudent = async (studentId: number) => {
    try {
      await attendanceMutation.mutateAsync({ studentId, status: "present" });
      notify.success("تم تسجيل الحضور يدوياً");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "تعذر تسجيل الحضور",
      );
    }
  };

  if (isLoading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-text-muted">
        جارٍ فتح مكتب الحصة...
      </div>
    );
  if (isError || !session) {
    return (
      <Empty className="min-h-[50vh]">
        <EmptyMedia variant="icon">
          <Video />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>الحصة غير موجودة</EmptyTitle>
          <EmptyDescription>تعذر فتح مكتب الحضور لهذه الحصة.</EmptyDescription>
        </EmptyHeader>
        <Button render={<Link to="/schedules" />}>العودة للمواعيد</Button>
      </Empty>
    );
  }

  const group = session.studentClass;
  const isOnline = group.deliveryMode === "online";
  return (
    <div className="flex flex-col gap-5 pb-12 animate-in fade-in duration-300">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/schedules">المواعيد الأسبوعية</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>مكتب الحصة</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        title={`مكتب الحصة · ${group.className}`}
        description="QR هو المسار الأساسي لتسجيل الحضور، ويمكنك استخدام التسجيل اليدوي كخيار احتياطي."
        actions={
          <Button
            type="button"
            variant="neutral-muted"
            render={<Link to={`/groups/${classId}`} />}
          >
            <ArrowRight />
            إدارة المجموعة
          </Button>
        }
      />

      <Card className="bg-accent-subtle-light">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Video className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-text">
                  {session.topic || "حصة بدون عنوان"}
                </h2>
                <Badge
                  variant={session.status === "live" ? "default" : "neutral"}
                >
                  {session.status === "live" ? "مباشرة الآن" : "مجدولة"}
                </Badge>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                <span>
                  {typeLabels[session.sessionType] || session.sessionType}
                </span>
                <span>·</span>
                <span>{group.gradeLevel}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  {isOnline ? (
                    <Video className="size-3" />
                  ) : (
                    <MapPin className="size-3" />
                  )}
                  {isOnline ? "أونلاين" : group.center?.name || "حضوري"}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg bg-surface px-4 py-3">
            <div>
              <p className="text-[11px] text-text-muted">تم تسجيل الحضور</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
                {checkedInCount}{" "}
                <span className="text-sm font-medium text-text-muted">
                  / {totalExpected}
                </span>
              </p>
            </div>
            <div className="h-10 w-px bg-border-subtle" />
            <div className="text-end">
              <p className="text-[11px] text-text-muted">بداية الحصة</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-bold text-text">
                <Clock3 className="size-3.5 text-primary" />
                {formatTime(session.scheduledStartTime)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(360px,0.75fr)_minmax(0,1.15fr)]">
        <Card className="">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2">
              <QrCode className="size-5 text-primary" />
              تسجيل الحضور عبر QR
            </CardTitle>
            <CardDescription>
              مرر بطاقة الطالب أمام قارئ QR أو اكتب رمز الطالب ثم اضغط تسجيل.
            </CardDescription>
          </CardHeader>
          <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-primary-subtle/20 p-6 text-center">
            <QrCode className="size-20 text-primary" strokeWidth={1.2} />
            <p className="mt-4 text-sm font-semibold text-text">
              جاهز لاستقبال بطاقة الطالب
            </p>
            <p className="mt-1 text-xs text-text-muted">
              سيتم تسجيل الحضور فور قراءة الرمز.
            </p>
          </div>
          <form onSubmit={recordByCode} className="flex gap-2">
            <Input
              autoFocus
              value={studentCode}
              onChange={(event) => setStudentCode(event.currentTarget.value)}
              placeholder="رمز الطالب من بطاقة QR"
              dir="ltr"
            />
            <Button
              type="submit"
              disabled={!studentCode.trim() || attendanceMutation.isPending}
            >
              <CheckCircle2 />
              تسجيل الحضور
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="size-5 text-primary" />
              التسجيل اليدوي
            </CardTitle>
            <CardDescription>
              استخدمه عند تعذر قراءة بطاقة الطالب.
            </CardDescription>
          </CardHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-2.5 size-3.5 text-text-muted" />
            <Input className="ps-8" placeholder="ابحث عن طالب" />
          </div>
          <div className="max-h-[26rem] overflow-y-auto rounded-lg border border-border-subtle">
            {group.enrollments.length ? (
              group.enrollments.map(({ student }) => {
                const record = attendanceByStudent.get(student.id);
                const isChecked =
                  record?.status === "present" || record?.status === "late";
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between gap-3 border-b border-border-subtle p-2.5 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
                        <GraduationCap className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-text">
                          {student.fullName}
                        </p>
                        <p className="text-[10px] text-text-muted" dir="ltr">
                          {student.studentCode || "بدون رمز"}
                        </p>
                      </div>
                    </div>
                    {isChecked ? (
                      <Badge variant="default">
                        <CheckCircle2 />
                        حاضر
                      </Badge>
                    ) : (
                      <Button
                        type="button"
                        size="xs"
                        variant="neutral"
                        disabled={attendanceMutation.isPending}
                        onClick={() => recordByStudent(student.id)}
                      >
                        تسجيل
                      </Button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="p-6 text-center text-xs text-text-muted">
                لا يوجد طلاب نشطون في هذه المجموعة.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
