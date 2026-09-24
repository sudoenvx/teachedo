import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  Globe2,
  GraduationCap,
  MessageSquareText,
  Plus,
  Users,
  Wallet,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@teachedo/ui/components";
import {
  useClassSessions,
  useGroups,
} from "@/modules/groups/api/groups.queries";
import { useTeacherDashboardStats } from "../api/dashboard.queries";
import { StatisticCard } from "@teachedo/ui/legacy";
import { MiniCalendar } from "@teachedo/ui/legacy";
import { TodayLiveDeskFeed } from "@/modules/dashboard/pages/today-livefeed";

const formatNumber = (value = 0) => value.toLocaleString("en");

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError } = useTeacherDashboardStats();
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const { data: weekSessions = [], isLoading: weekSessionsLoading } =
    useClassSessions(dateKey(today), dateKey(weekEnd), {
      refetchInterval: 10_000,
    });
  const value = (number: number | undefined) =>
    isLoading ? "..." : formatNumber(number);

  return (
    <div className="animate-in fade-in pb-10 duration-300">
      <div className="flex flex-col items-start gap-6 lg:grid lg:grid-cols-15">
        <div className="flex w-full flex-col gap-6 lg:col-span-11">
          <Card className="overflow-hidden">
            <CardContent>
              <h1 className="font-semibold text-lg">
                أهلاً بك مجدداً، محمد صلاح 👋
              </h1>
              <p className="text-text-muted text-sm">
                راجع بيانات طلابك ومجموعاتك التعليمية، وابدأ بتنظيم يومك من
                الاختصارات السريعة.
              </p>
            </CardContent>
            <CardFooter className="flex overflow-x-auto gap-2">
              <Button type="button" onClick={() => navigate("/students/new")}>
                <Plus />
                تسجيل طالب جديد
              </Button>
              <Button
                type="button"
                variant="neutral"
                onClick={() => navigate("/groups")}
              >
                <CalendarDays />
                جدولة حصة / سنتر
              </Button>
              <Button
                type="button"
                variant="neutral"
                disabled
                onClick={() => navigate("/students")}
              >
                <ClipboardCheck />
                رصد الدرجات والامتحانات
              </Button>
              <Button
                type="button"
                variant="neutral"
                disabled
                title="ستتوفر قريباً"
              >
                <MessageSquareText />
                إرسال تنبيه واتساب
              </Button>
            </CardFooter>
          </Card>
          <TodayLiveDeskFeed
            sessions={weekSessions}
            isLoading={weekSessionsLoading}
          />
          {/*
                  {
                    id: 1,
                    sessionDate: "2026-09-25T09:00:00Z",
                    scheduledStartTime: "09:00",
                    studentClass: {
                      className: "الصف الأول",
                      deliveryMode: "offline",
                      gradeLevel: "Third Prep",
                      groupTier: "normal",
                      center: {
                        name: "الحرمين"
                      }
                    },
                    sessionType: "regular",
                    checkedInCount: 5,
                    totalExpected: 10,
                    classId: 1,
                    durationMinutes: 60,
                    isCompleted: false,
                    isMandatory: true,
                    attendance: []
                  }
                */}

          {isError && (
            <div className="rounded-md bg-destructive-subtle p-2 text-[13px] font-medium text-destructive">
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
              label="الفصول النشطة"
              value={value(stats?.activeClasses)}
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
              value={
                isLoading
                  ? "..."
                  : `${formatNumber(stats?.revenueThisMonth)} EGP`
              }
              icon={Wallet}
              iconClassName="bg-success-subtle text-success"
            />
          </section>
        </div>

        <aside className="flex w-full flex-col gap-5 lg:col-span-4">
          <DashboardMiniCalendar
            onSelect={(date) => navigate(`/schedules?date=${dateKey(date)}`)}
          />
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div>
                    <CardTitle className="text-[16px] font-bold text-text">
                      مجموعاتي
                    </CardTitle>
                  </div>
                </div>
                <Link to="/groups">
                  <Button variant={"link"} size={"sm"} className={"p-0"}>
                    عرض الكل
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {groupsLoading ? (
                  <GroupsCardSkeleton />
                ) : groups.length === 0 ? (
                  <p className="py-3 text-center text-[12px] text-text-muted">
                    لا توجد مجموعات بعد
                  </p>
                ) : (
                  groups.slice(0, 5).map((group) => (
                    <Link
                      key={group.id}
                      to={`/groups/${group.id}`}
                      className="group rounded-md bg-neutral-200 p-2 transition-all hover:bg-neutral-300"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-1.5">
                        <span className="min-w-0 truncate text-sm font-medium text-text transition-colors group-hover:text-text">
                          {group.className}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              group.groupTier === "vip" ? "accent" : "default"
                            }
                          >
                            {group.groupTier === "vip" ? "VIP" : "عادية"}
                          </Badge>
                          <Badge variant="secondary">
                            {group.deliveryMode === "online" ? (
                              <>
                                <Globe2 />
                                أونلاين
                              </>
                            ) : group.deliveryMode === "hybrid" ? (
                              "حضوري + أونلاين"
                            ) : (
                              <>
                                <Building2 />
                                حضوري
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function DashboardMiniCalendar({
  onSelect,
}: {
  onSelect: (date: Date) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    onSelect(date);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent>
        <MiniCalendar
          value={selectedDate}
          onChange={selectDate}
          weekStartsOn={6}
          className="max-w-none"
        />
      </CardContent>
    </Card>
  );
}

function GroupsCardSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-label="جاري تحميل المجموعات">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-10 animate-pulse rounded-md bg-neutral-100"
        />
      ))}
    </div>
  );
}
