// today-live-desk-feed.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Globe2, MapPin, PlayCircle, CheckCircle2 } from "lucide-react";
import { Badge, Button, Card, CardContent } from "@teachedo/ui/components";
import { cn } from "cn"; // adjust import path if different in this package
import type { ScheduledSession } from "@/modules/groups/types/group.types";

const DEFAULT_DURATION_MINUTES = 90; // fallback only — swap for a real field if ScheduledSession has one
const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

type SessionStatus = "live" | "upcoming" | "ended";

const dateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

function parseTimeOn(day: Date, value?: string | null): Date | null {
  if (!value) return null;
  const time = value.includes("T") ? value.slice(11, 16) : value.slice(0, 5);
  const [hourText = "", minuteText = ""] = time.split(":");
  const h = Number(hourText);
  const m = Number(minuteText);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}

function getStatus(session: ScheduledSession, day: Date, now: Date): SessionStatus {
  const start = parseTimeOn(day, session.scheduledStartTime);
  if (!start) return "upcoming";
  const end = new Date(start.getTime() + (session.durationMinutes || DEFAULT_DURATION_MINUTES) * 60_000);
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "ended";
}

const formatSessionTime = (value?: string | null) => {
  if (!value) return "وقت غير محدد";
  const time = value.includes("T") ? value.slice(11, 16) : value.slice(0, 5);
  const [hourText = "", minuteText = ""] = time.split(":");
  const hours = Number(hourText);
  const minutes = Number(minuteText);
  return new Intl.DateTimeFormat("ar-EG", { hour: "numeric", minute: "2-digit" }).format(
    new Date(1970, 0, 1, hours, minutes),
  );
};

export function TodayLiveDeskFeed({ sessions, isLoading }: { sessions: ScheduledSession[]; isLoading: boolean }) {
  // 7-day strip starting today — sessions are grouped client-side by
  // date, so the parent just needs to fetch this same range.
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return { date, key: dateKey(date), label: dayNames[date.getDay()] };
    });
  }, []);

  const firstDay = days[0]!;
  const [selectedKey, setSelectedKey] = useState(firstDay.key);
  const selectedDay = days.find((d) => d.key === selectedKey) ?? firstDay;
  const isToday = selectedKey === firstDay.key;

  const grouped = useMemo(() => {
    const map = new Map<string, ScheduledSession[]>();
    sessions.forEach((s) => {
      const key = s.sessionDate.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [sessions]);

  const now = new Date();
  const daySessions = (grouped.get(selectedKey) ?? [])
    .map((s) => ({ session: s, status: getStatus(s, selectedDay.date, now), start: parseTimeOn(selectedDay.date, s.scheduledStartTime) }))
    .sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));

  return (
    <div className="flex flex-col ">

              {/* Day tabs — day name + day number, current day highlighted by default */}
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="اختر اليوم">
        {days.map((day) => {
          const active = day.key === selectedKey;
        //   const isTodayTab = day.key === firstDay.key;
          return (
            <button
              key={day.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedKey(day.key)}
              className={cn(
                "flex min-w-18 shrink-0 flex-col items-center gap-0.5 rounded-md px-2.5 py-1.5 transition-colors",
                active ? "bg-secondary text-secondary-foreground" : "bg-surface text-text",
              )}
            >
              <span className={cn("text-[10px] font-medium", active ? "text-primary-foreground/80" : "text-text-muted")}>
                {day.label}
              </span>
              <span className="text-base font-bold tabular-nums">{day.date.getDate()}</span>
              {/* {isTodayTab && (
                <span className={cn("size-1 rounded-full", active ? "bg-primary-foreground" : "bg-primary")} />
              )} */}
            </button>
          );
        })}
      </div>
        <section className="rounded-lg bg-accent-subtle-light p-3" aria-labelledby="today-live-desk">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="today-live-desk" className="text-base font-bold text-text">حصص الأسبوع · مكتب الحضور</h2>
          <p className="mt-1 text-xs text-text-muted">اختر يوماً لعرض حصصه، وابدأ الحصة لفتح شاشة QR لتسجيل الحضور.</p>
        </div>
        <Link to="/schedules"><Button type="button" variant="accent">عرض الجدول الكامل</Button></Link>
      </div>



      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => <div key={i} className="h-40 animate-pulse rounded-lg bg-surface" />)}
        </div>
      ) : daySessions.length === 0 ? (
        <div className="rounded-[calc(var(--radius-lg)-0.2rem)] bg-surface p-3 text-center text-xs text-text-muted">
          {isToday ? "لا توجد حصص مجدولة اليوم." : "لا توجد حصص مجدولة في هذا اليوم."}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {daySessions.map(({ session, status }) => (
            <SessionCard key={session.id} session={session} status={status} />
          ))}
        </div>
      )}
    </section>
    </div>
  );
}

function SessionCard({ session, status }: { session: ScheduledSession; status: SessionStatus }) {
  const isOnline = session.studentClass.deliveryMode === "online";
  const location = isOnline ? "أونلاين" : session.studentClass.center?.name || (session.studentClass.deliveryMode === "hybrid" ? "حضوري + أونلاين" : "بدون سنتر محدد");
  const attendancePct = session.totalExpected > 0 ? Math.round((session.checkedInCount / session.totalExpected) * 100) : 0;
  const isLive = status === "live";
  const isEnded = status === "ended";

  return (
    <Card
      className={cn(
        "overflow-hidden bg-surface rounded-md ",
        isLive && "ring-1 ring-success/40",
        isEnded && "opacity-70",
      )}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-text">{session.studentClass.className}</p>
            <p className="mt-0.5 truncate text-xs text-text-muted">{session.studentClass.gradeLevel}</p>
          </div>
          <Badge variant={session.studentClass.groupTier === "vip" ? "accent" : "neutral"}>
            {session.studentClass.groupTier === "vip" ? "VIP" : "عادية"}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
          <span className="flex items-center gap-1 font-semibold text-primary">
            {isLive && (
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-success" />
              </span>
            )}
            {formatSessionTime(session.scheduledStartTime)}
          </span>
          <span className="flex items-center gap-1">{isOnline ? <Globe2 className="size-3" /> : <MapPin className="size-3" />}{location}</span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-text-muted">الحضور</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className={cn("h-full rounded-full transition-all", isLive ? "bg-success" : "bg-primary")}
                  style={{ width: `${attendancePct}%` }}
                />
              </div>
              <span className="text-[12px] font-bold tabular-nums text-text">
                {session.checkedInCount}<span className="font-medium text-text-muted">/{session.totalExpected}</span>
              </span>
            </div>
          </div>

          {isEnded ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-text-muted">
              <CheckCircle2 className="size-3.5" /> انتهت
            </span>
          ) : (
            <Button
              type="button"
              size="sm"
              variant={isLive ? "default" : "neutral"}
              render={<Link to={`/classes/${session.classId}/sessions/${session.id}/live`} />}
            >
              <PlayCircle />{isLive ? "متابعة" : "ابدأ"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
