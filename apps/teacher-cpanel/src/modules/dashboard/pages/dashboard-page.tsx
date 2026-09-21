import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpLeft,
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  Clock3,
  GraduationCap,
  Users,
  Wallet,
  Plus,
} from 'lucide-react'
import { Button, Card, StatisticCard, Title } from '@teachedo/ui/legacy'
import { useTeacherDashboardStats, useUpcomingTeacherSessions } from '../api/dashboard.queries'
import { useGroups } from '@/modules/groups/api/groups.queries'
import type { UpcomingSession } from '../types/dashboard.types'

const formatNumber = (value = 0) => value.toLocaleString('en')

function sessionStart(session: UpcomingSession) {
  const date = new Date(session.sessionDate)
  if (!session.startTime) return date

  const time = new Date(session.startTime)
  date.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0)
  return date
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function startOfSaturdayWeek(date = new Date()) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  const daysSinceSaturday = (result.getDay() + 1) % 7
  result.setDate(result.getDate() - daysSinceSaturday)
  return result
}

function weekDays() {
  const saturday = startOfSaturdayWeek()
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(saturday)
    date.setDate(saturday.getDate() + index)
    return date
  })
}

function sessionTime(session: UpcomingSession) {
  if (!session.startTime) return 'الوقت غير محدد'
  return new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit' }).format(
    sessionStart(session)
  )
}

function sessionState(session: UpcomingSession, index: number, sessions: UpcomingSession[]) {
  const now = Date.now()
  const start = sessionStart(session).getTime()
  const end = start + 60 * 60 * 1000
  if (now >= start && now < end) return 'current'
  const nextIndex = sessions.findIndex((item) => sessionStart(item).getTime() > now)
  return index === nextIndex ? 'next' : 'upcoming'
}

export default function TeacherDashboardPage() {
  // const navigate = useNavigate()
  const { data: stats, isLoading, isError } = useTeacherDashboardStats()
  const { data: sessions = [], isLoading: sessionsLoading } = useUpcomingTeacherSessions()
  const { data: groups = [], isLoading: groupsLoading } = useGroups()
  const days = useMemo(() => weekDays(), [])
  const todayKey = dateKey(new Date())
  const [selectedDay, setSelectedDay] = useState(todayKey)
  const selectedSessions = sessions.filter(
    (session) => dateKey(new Date(session.sessionDate)) === selectedDay
  )
  const value = (number: number | undefined) => (isLoading ? '...' : formatNumber(number))

  return (
    <div className="pb-10 animate-in fade-in duration-300">
      {/* 
        GRID LAYOUT 
        Since Arabic is RTL, col-span-8 will naturally render on the right, 
        and col-span-4 (Aside) will render on the left. 
      */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
        {/* MAIN CONTENT (70% Width) */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full">
          <TeacherWelcomeHeader />

          {isError && (
            <div className="bg-destructive-subtle p-2 rounded-sm text-[13px] font-medium text-destructive">
              تعذر تحميل إحصائيات المنصة حالياً.
            </div>
          )}

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatisticCard
              label="إجمالي الطلاب"
              value={value(stats?.totalStudents)}
              icon={GraduationCap}
              iconClassName="bg-primary-subtle text-primary"
            />
            <StatisticCard
              label="المجموعات النشطة"
              value={value(stats?.activeGroups)}
              icon={Users}
              iconClassName="bg-accent-subtle text-accent"
            />
            <StatisticCard
              label="حصص هذا الشهر"
              value={value(stats?.sessionsThisMonth)}
              icon={CalendarDays}
              iconClassName="bg-info-subtle text-info"
            />
            <StatisticCard
              label="إيرادات هذا الشهر"
              value={isLoading ? '...' : `${formatNumber(stats?.revenueThisMonth)} EGP`}
              icon={Wallet}
              iconClassName="bg-success-subtle text-success"
            />
          </section>

          <Card className="rounded-sm" bodyClassName="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CalendarDays size={16} />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-bold text-text">جدول الأسبوع</h3>
                    <p className="mt-0.5 text-[12px] text-text-muted">
                      اختر يوماً لعرض حصصه القادمة
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-text-muted">
                <span>{selectedSessions.length} حصص في اليوم</span>
                <span className="inline-flex cursor-not-allowed items-center gap-1 text-text-faint">
                  فتح الجدول كامل <ArrowLeft size={14} />
                </span>
              </div>
            </div>

            <div className="mt-6 -mx-1 overflow-x-auto px-1 pb-2 scrollbar-thin">
              <div className="flex min-w-max snap-x gap-1.5 rounded-sm bg-primary-subtle px-1.5 py-1.5">
                {days.map((day) => (
                  <DayTab
                    key={dateKey(day)}
                    date={day}
                    selected={dateKey(day) === selectedDay}
                    today={dateKey(day) === todayKey}
                    count={
                      sessions.filter(
                        (session) => dateKey(new Date(session.sessionDate)) === dateKey(day)
                      ).length
                    }
                    onClick={() => setSelectedDay(dateKey(day))}
                  />
                ))}
              </div>
            </div>

            {sessionsLoading ? (
              <ScheduleCardsSkeleton />
            ) : selectedSessions.length === 0 ? (
              <EmptySchedule />
            ) : (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                {selectedSessions.map((session, index) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    state={sessionState(session, index, selectedSessions)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ASIDE / SIDEBAR (30% Width) */}
        <aside className="lg:col-span-4 flex flex-col gap-5 w-full">
          <Card className="rounded-sm" bodyClassName="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Users size={16} />
                </span>
                <div>
                  <h3 className="text-[16px] font-bold text-text">مجموعاتي</h3>
                  <p className="mt-0.5 text-[12px] text-text-muted">إدارة مجموعاتك التعليمية</p>
                </div>
              </div>
              <Link
                to="/groups"
                className="text-[12px] font-bold text-primary transition-colors hover:text-primary-hover"
              >
                عرض الكل
              </Link>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              {groupsLoading ? (
                <GroupsCardSkeleton />
              ) : groups.length === 0 ? (
                <p className="py-3 text-center text-[12px] text-text-muted">لا توجد مجموعات بعد</p>
              ) : (
                groups.slice(0, 5).map((group) => (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className="group flex items-center justify-between gap-3 rounded-sm px-1.5 py-1.5 transition-colors bg-neutral-50 hover:bg-neutral-100"
                  >
                    <span className="min-w-0 truncate text-[13px] font-semibold text-text transition-colors group-hover:text-primary">
                      {group.groupName}
                    </span>
                    <ChevronLeft
                      size={16}
                      className="shrink-0 text-text-muted transition-transform "
                    />
                  </Link>
                ))
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function TeacherWelcomeHeader() {
  const navigate = useNavigate()

  return (
    <Card bodyClassName="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between bg-surface">
      <div>
        <p className="text-[13px] font-medium text-primary">مساحتك التعليمية</p>
        <Title size="large" className="mt-1 font-bold tracking-tight text-text">
          أهلاً بك مجدداً، محمد صلاح <span aria-hidden="true">👋</span>
        </Title>
        <p className="mt-1 text-[13px] leading-relaxed text-text-muted max-w-lg">
          يبدو أنك مستعد ليوم تعليمي مثمر. راجع حصصك القادمة وواصل بناء تقدم طلابك.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Main Action - Keeps primary color */}
        <Button
          type="button"
          color="primary"
          style="tint"
          size="sm"
          uppercase={false}
          leftIcon={<CalendarDays size={16} />}
          disabled
        >
          فتح جدول اليوم
        </Button>

        {/* Secondary Actions - Changed to Outline/Subtle styles so they don't clash */}
        <Button
          type="button"
          style="tint"
          color="secondary"
          size="sm"
          uppercase={false}
          leftIcon={<Plus size={14} />}
          onClick={() => navigate('/students')}
        >
          طالب
        </Button>
        <Button
          type="button"
          style="tint"
          color="secondary"
          size="sm"
          uppercase={false}
          leftIcon={<Plus size={14} />}
          onClick={() => navigate('/groups')}
        >
          مجموعة
        </Button>
      </div>
    </Card>
  )
}

function DayTab({
  date,
  selected,
  today,
  count,
  onClick,
}: {
  date: Date
  selected: boolean
  today: boolean
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-16 w-14 shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-sm px-1.5 py-1 text-center transition-all ${selected
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-secondary-foreground/70 hover:bg-white/10 hover:text-white'
        }`}
    >
      <span
        className={`text-[10px] font-medium ${selected ? 'text-accent-foreground/80' : today ? 'text-text' : 'text-text'}`}
      >
        {new Intl.DateTimeFormat('ar-EG', { weekday: 'short' }).format(date)}
      </span>
      <span
        className={`font-inter text-[17px] font-black leading-none ${selected ? 'text-accent-foreground' : today ? 'text-text' : 'text-text'}`}
      >
        {new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date)}
      </span>
      <span
        className={`flex items-center gap-1 text-[9px] ${selected ? 'text-accent-foreground/80' : 'text-text'}`}
      >
        {count > 0 ? (
          <>
            <span
              className={`h-1 w-1 rounded-full ${selected ? 'bg-accent-foreground' : 'bg-primary'}`}
            ></span>{' '}
            {count} حصص
          </>
        ) : (
          'لا حصص'
        )}
      </span>
    </button>
  )
}

function SessionCard({
  session,
  state,
}: {
  session: UpcomingSession
  state: 'current' | 'next' | 'upcoming'
}) {
  const highlighted = state !== 'upcoming'
  return (
    <article
      className={`flex min-w-65 snap-start flex-1 flex-col gap-3 rounded-sm border p-4 transition-colors ${highlighted
        ? 'bg-primary-subtle border-primary/20'
        : 'bg-neutral-100 border-border hover:border-border-hover hover:bg-neutral-200'
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`h-2 w-2 rounded-full shadow-sm ${state === 'current'
                ? 'bg-success animate-pulse'
                : state === 'next'
                  ? 'bg-primary'
                  : 'bg-border-strong'
                }`}
            />
            <h4 className="truncate text-[14px] font-bold text-text">{session.group.groupName}</h4>
          </div>
          <p className="truncate text-[12px] text-text-muted pr-4">
            {session.topic || 'حصة تعليمية عامة'}
          </p>
        </div>
        <div
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-bold ${state === 'current' ? 'bg-success/10 text-success' : 'bg-surface-secondary text-text'
            }`}
        >
          <Clock3 size={12} />
          {sessionTime(session)}
        </div>
      </div>
      <div className="flex items-center justify-between mt-1 text-[11px] font-medium text-text-muted border-t border-border-subtle pt-3">
        <span
          className={
            state === 'current' ? 'text-success font-bold' : state === 'next' ? 'text-primary' : ''
          }
        >
          {state === 'current' ? 'جارية الآن' : state === 'next' ? 'الحصة التالية' : 'مجدولة'}
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} /> {session.group.groupName}
        </span>
      </div>
    </article>
  )
}

function ScheduleCardsSkeleton() {
  return (
    <div className="mt-4 flex gap-3 overflow-hidden">
      <div className="h-30 min-w-65 rounded-sm animate-pulse bg-neutral-100 border border-border-subtle" />
      <div className="h-30 min-w-65 rounded-sm animate-pulse bg-neutral-100 border border-border-subtle" />
      <div className="h-30 min-w-65 rounded-sm animate-pulse bg-neutral-100 border border-border-subtle" />
    </div>
  )
}

function GroupsCardSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-label="جاري تحميل المجموعات">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-10 animate-pulse rounded-sm bg-neutral-100" />
      ))}
    </div>
  )
}

function EmptySchedule() {
  return (
    <div className="my-2 flex flex-col items-center justify-center rounded-sm bg-neutral-50 p-8 text-center">
      <div className="h-12 w-12 rounded-full bg-primary-subtle flex items-center justify-center mb-3">
        <CalendarDays size={24} className="text-text-muted" />
      </div>
      <p className="text-[14px] font-bold text-text">يوم هادئ، لا توجد حصص قادمة</p>
      <p className="mt-1 mb-2 max-w-62.5 text-[12px] text-text-muted">
        استرح قليلاً، أو قم بإضافة حصة جديدة لجدولك اليوم.
      </p>
      <Button
        type="button"
        color="primary"
        style="tint"
        size="sm"
        uppercase={false}
        leftIcon={<ArrowUpLeft size={14} />}
        disabled
      >
        إضافة حصة
      </Button>
    </div>
  )
}
