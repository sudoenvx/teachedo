import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  MapPin,
  Plus,
  RefreshCw,
  Video,
} from "lucide-react";
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldLabel,
  Input,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@teachedo/ui/components";
import { MiniCalendar } from "@teachedo/ui/legacy";
import { useNotification } from "@/core/hooks/use_notification";
import {
  useClassSessions,
  useGroups,
} from "@/modules/groups/api/groups.queries";
import {
  useCreateClassSession,
  useRescheduleClassSession,
} from "@/modules/groups/api/groups.mutations";
import type {
  ScheduledSession,
  SessionType,
} from "@/modules/groups/types/group.types";

const dayNames = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const sessionTypeLabels: Record<SessionType, string> = {
  regular: "حصة عادية",
  extra_revision: "مراجعة إضافية",
  final_revision: "مراجعة نهائية",
  quiz_only: "اختبار قصير",
  mock_exam: "اختبار تجريبي",
  assessment: "تقييم",
  other: "أخرى",
};

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const parseDateKey = (value?: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date();
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const formatTime = (value?: string | null) => {
  if (!value) return "وقت غير محدد";
  const time = value.includes("T") ? value.slice(11, 16) : value.slice(0, 5);
  const [hourText = "", minuteText = ""] = time.split(":");
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(1970, 0, 1, Number(hourText), Number(minuteText)));
};

const startOfSaturdayWeek = (anchor: Date) => {
  const start = new Date(anchor);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 1) % 7));
  return start;
};

const buildWeek = (anchor: Date) => {
  const start = startOfSaturdayWeek(anchor);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date, key: dateKey(date), label: dayNames[date.getDay()] };
  });
};

export default function SchedulesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(
    () => searchParams.get("date") || dateKey(new Date()),
  );
  const selectedDateObject = useMemo(
    () => parseDateKey(selectedDate),
    [selectedDate],
  );
  const weekDays = useMemo(
    () => buildWeek(selectedDateObject),
    [selectedDateObject],
  );
  const {
    data: sessions = [],
    isLoading,
    isError,
  } = useClassSessions(selectedDate, selectedDate);
  const [addSessionOpen, setAddSessionOpen] = useState(false);

  useEffect(() => {
    const dateFromUrl = searchParams.get("date");
    if (dateFromUrl && dateFromUrl !== selectedDate)
      setSelectedDate(dateFromUrl);
  }, [searchParams, selectedDate]);

  const selectDate = (date: Date) => {
    const nextDate = dateKey(date);
    setSelectedDate(nextDate);
    setSearchParams({ date: nextDate }, { replace: true });
  };

  const moveSelectedDate = (days: number) => {
    const nextDate = new Date(selectedDateObject);
    nextDate.setDate(nextDate.getDate() + days);
    selectDate(nextDate);
  };

  const selectedDayLabel = selectedDateObject.toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-5 pb-12 animate-in fade-in duration-300">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/">لوحة المتابعة</Link>
          </BreadcrumbItem>
          <BreadcrumbPage>المواعيد الأسبوعية</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        title="المواعيد الأسبوعية"
        description="اختر يوماً لمراجعة حصصه أو أضف حصة جديدة مباشرة إلى مجموعة محددة."
        actions={
          <Button type="button" onClick={() => setAddSessionOpen(true)}>
            <Plus />
            إضافة حصة
          </Button>
        }
      />

      <div className="grid items-start gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="overflow-hidden">

          <CardContent className="flex flex-col gap-4">
            <MiniCalendar
              value={selectedDateObject}
              onChange={selectDate}
              weekStartsOn={6}
              className="max-w-none"
            />
            <Button
              type="button"
              variant="neutral"
              onClick={() => selectDate(new Date())}
            >
              العودة إلى اليوم
            </Button>
            <div className="rounded-lg bg-primary-subtle p-3">
              <p className="text-[11px] font-medium text-primary">
                اليوم المحدد
              </p>
              <p className="mt-1 text-sm font-bold text-text">
                {selectedDayLabel}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {sessions.length} {sessions.length === 1 ? "حصة" : "حصص"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden " >
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="اليوم السابق"
                    onClick={() => moveSelectedDate(-1)}
                  >
                    <ChevronRight />
                  </Button>
                  <CardTitle className="text-base">
                    حصص {selectedDayLabel}
                  </CardTitle>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="اليوم التالي"
                    onClick={() => moveSelectedDate(1)}
                  >
                    <ChevronLeft />
                  </Button>
                </div>
                <CardDescription className="mt-1">
                  التنقل بين أيام الأسبوع لا يغير إعدادات المجموعة.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAddSessionOpen(true)}
              >
                <Plus />
                إضافة في هذا اليوم
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DayTabs
              days={weekDays}
              selectedDate={selectedDate}
              onSelect={(key) => selectDate(parseDateKey(key))}
            />
            <div className="mt-5">
              {isLoading ? (
                <ScheduleLoading />
              ) : isError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive-subtle p-5 text-sm text-destructive">
                  تعذر تحميل حصص هذا اليوم.
                </div>
              ) : sessions.length === 0 ? (
                <EmptyDay onAdd={() => setAddSessionOpen(true)} />
              ) : (
                <div className="flex flex-col gap-3">
                  {sessions.map((session) => (
                    <SessionScheduleCard
                      key={session.id}
                      session={session}
                      weekDays={weekDays}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddSessionDialog
        open={addSessionOpen}
        onOpenChange={setAddSessionOpen}
        defaultDate={selectedDate}
      />
    </div>
  );
}

function DayTabs({
  days,
  selectedDate,
  onSelect,
}: {
  days: Array<{ date: Date; key: string; label: string | undefined }>;
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7"
      role="tablist"
      aria-label="أيام الأسبوع"
    >
      {days.map((day) => {
        const selected = day.key === selectedDate;
        return (
          <button
            key={day.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(day.key)}
            className={`rounded-md bg-neutral-100 p-2 text-start transition-colors ${selected ? "border-primary bg-secondary text-secondary-foreground shadow-sm" : "hover:bg-neutral-200"}`}
          >
            <span
              className={`block text-[11px] font-medium ${selected ? "text-primary-foreground/80" : "text-text-muted"}`}
            >
              {day.label}
            </span>
            <span className="mt-1 block text-sm font-bold tabular-nums">
              {day.date.getDate()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SessionScheduleCard({
  session,
  weekDays,
}: {
  session: ScheduledSession;
  weekDays: Array<{ label: string | undefined; key: string; date: Date }>;
}) {
  const { notify } = useNotification();
  const reschedule = useRescheduleClassSession();
  const [selectedDate, setSelectedDate] = useState(
    session.sessionDate.slice(0, 10),
  );
  const scheduledStartTime = session.scheduledStartTime
    ? session.scheduledStartTime.includes("T")
      ? session.scheduledStartTime.slice(11, 16)
      : session.scheduledStartTime.slice(0, 5)
    : null;
  const isOnline = session.studentClass.deliveryMode === "online";
  const deliveryLabel = isOnline
    ? "أونلاين"
    : session.studentClass.deliveryMode === "hybrid"
      ? "حضوري + أونلاين"
      : "حضوري";


  const rescheduleSession = async (value: string) => {
    try {
      await reschedule.mutateAsync({ classId: session.classId, sessionId: session.id, sessionDate: value, scheduledStartTime });
      setSelectedDate(value);
      notify.success("تم نقل الحصة لهذا الأسبوع فقط");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "تعذر إعادة جدولة الحصة");
    }
  };

  return (
    <Card className="bg-neutral-100">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary-subtle-foreground">
            <Clock3 className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-bold text-text">
                {session.topic || "حصة بدون عنوان"}
              </h3>
              <Badge
                variant={
                  session.studentClass.groupTier === "vip"
                    ? "accent"
                    : "neutral"
                }
              >
                {session.studentClass.groupTier === "vip" ? "VIP" : "عادية"}
              </Badge>
              <Badge
                variant={
                  session.status === "live"
                    ? "default"
                    : session.isCompleted
                      ? "secondary"
                      : "outline"
                }
              >
                {session.status === "live"
                  ? "مباشرة"
                  : session.isCompleted
                    ? "مكتملة"
                    : "مجدولة"}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
              <span className="font-bold text-primary">
                {formatTime(session.scheduledStartTime)}
              </span>
              <span>
                {sessionTypeLabels[session.sessionType] || session.sessionType}
              </span>
              <span className="flex items-center gap-1">
                {isOnline ? (
                  <Globe2 className="size-3.5" />
                ) : (
                  <MapPin className="size-3.5" />
                )}
                {session.studentClass.center?.name || deliveryLabel}
              </span>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              {session.studentClass.className} ·{" "}
              {session.studentClass.gradeLevel} · {session.durationMinutes}{" "}
              دقيقة
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <div className="flex items-center gap-1.5 rounded-md border border-border-subtle px-2 py-1.5">
            <RefreshCw className="size-3.5 text-text-muted" />
            <Select value={selectedDate} onValueChange={(value) => { if (value && value !== selectedDate) void rescheduleSession(value); }}>
              <SelectTrigger size="sm" className="min-w-32 border-0 bg-transparent p-0 shadow-none"><SelectValue>نقل هذا الأسبوع</SelectValue></SelectTrigger>
              <SelectContent>{weekDays.map((day) => <SelectItem key={day.key} value={day.key}>{day.label} · {day.date.getDate()}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            render={
              <Link
                to={`/classes/${session.classId}/sessions/${session.id}/live`}
              />
            }
          >
            <Video />
            فتح الحضور
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyDay({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-surface-secondary/60 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
        <CalendarDays className="size-6" />
      </span>
      <h3 className="mt-4 text-sm font-bold text-text">
        لا توجد حصص في هذا اليوم
      </h3>
      <p className="mt-1 max-w-sm text-xs text-text-muted">
        أضف حصة جديدة واختر المجموعة والموضوع والوقت لتظهر هنا.
      </p>
      <Button type="button" className="mt-4" onClick={onAdd}>
        <Plus />
        إضافة حصة
      </Button>
    </div>
  );
}

function ScheduleLoading() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-lg bg-neutral-100"
        />
      ))}
    </div>
  );
}

function AddSessionDialog({
  open,
  onOpenChange,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: string;
}) {
  const { notify } = useNotification();
  const { data: groups = [] } = useGroups();
  const [classId, setClassId] = useState("");
  const createSession = useCreateClassSession(Number(classId) || 0);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("16:00");
  const [sessionType, setSessionType] = useState<SessionType>("regular");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [topic, setTopic] = useState("");
  const [isMandatory, setIsMandatory] = useState(true);

  useEffect(() => {
    if (open) setDate(defaultDate);
  }, [defaultDate, open]);

  const reset = () => {
    setClassId("");
    setDate(defaultDate);
    setTime("16:00");
    setSessionType("regular");
    setDurationMinutes("60");
    setTopic("");
    setIsMandatory(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!classId) {
      notify.error("اختر المجموعة أولاً");
      return;
    }
    try {
      await createSession.mutateAsync({
        sessionDate: date,
        sessionType,
        scheduledStartTime: time || null,
        durationMinutes: Number(durationMinutes),
        isMandatory,
        topic: topic.trim() || null,
      });
      notify.success("تمت إضافة الحصة بنجاح");
      onOpenChange(false);
      reset();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "تعذر إضافة الحصة");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إضافة حصة جديدة</DialogTitle>
          <DialogDescription>
            حدد المجموعة وبيانات الحصة. الموضوع اختياري ويمكن تركه فارغاً.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="schedule-session-group">المجموعة</FieldLabel>
            <Select
              value={classId}
              onValueChange={(value) => setClassId(value || "")}
            >
              <SelectTrigger id="schedule-session-group">
                <SelectValue placeholder="اختر مجموعة" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={String(group.id)}>
                    {group.className} · {group.gradeLevel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="schedule-session-date">التاريخ</FieldLabel>
              <Input
                id="schedule-session-date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.currentTarget.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="schedule-session-time">
                وقت البداية
              </FieldLabel>
              <Input
                id="schedule-session-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.currentTarget.value)}
              />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="schedule-session-type">نوع الحصة</FieldLabel>
              <Select
                value={sessionType}
                onValueChange={(value) => {
                  if (value) setSessionType(value as SessionType);
                }}
              >
                <SelectTrigger id="schedule-session-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sessionTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="schedule-session-duration">
                المدة بالدقائق
              </FieldLabel>
              <Input
                id="schedule-session-duration"
                type="number"
                min="1"
                max="600"
                required
                value={durationMinutes}
                onChange={(event) =>
                  setDurationMinutes(event.currentTarget.value)
                }
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="schedule-session-topic">
              موضوع الحصة{" "}
              <span className="font-normal text-text-muted">(اختياري)</span>
            </FieldLabel>
            <Input
              id="schedule-session-topic"
              placeholder="مثال: قوانين كيرشوف"
              value={topic}
              onChange={(event) => setTopic(event.currentTarget.value)}
            />
          </Field>
          <label className="flex items-center gap-2 text-xs text-text">
            <Checkbox
              checked={isMandatory}
              onCheckedChange={(checked) => setIsMandatory(checked === true)}
            />
            حصة إلزامية للطلاب
          </label>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="neutral" />}>
              إلغاء
            </DialogClose>
            <Button
              type="submit"
              disabled={createSession.isPending || !classId}
            >
              {createSession.isPending ? "جارٍ الحفظ..." : "إضافة الحصة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
