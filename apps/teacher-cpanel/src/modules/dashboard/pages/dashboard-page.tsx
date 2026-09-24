import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ClipboardCheck,
  FileVideo,
  GraduationCap,
  MessageSquareText,
  Plus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@teachedo/ui/components";
import { useGroups } from "@/modules/groups/api/groups.queries";
import { useTeacherDashboardStats } from "../api/dashboard.queries";
import { StatisticCard } from "@teachedo/ui/legacy";

const formatNumber = (value = 0) => value.toLocaleString("en");

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError } = useTeacherDashboardStats();
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const value = (number: number | undefined) =>
    isLoading ? "..." : formatNumber(number);

  return (
    <div className="animate-in fade-in pb-10 duration-300">
      <div className="flex flex-col items-start gap-6 lg:grid lg:grid-cols-12">
        <div className="flex w-full flex-col gap-6 lg:col-span-8">
          <Card className="overflow-hidden">
            <CardContent>
              <h1 className="font-semibold text-lg">أهلاً بك مجدداً، محمد صلاح 👋</h1>
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
          <Card>
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
              <div className="flex flex-col gap-1.5">
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
                      className="group flex items-center justify-between gap-3 rounded-md bg-neutral-200 px-2 py-1.5 transition-colors hover:bg-neutral-300"
                    >
                      <span className="min-w-0 truncate text-[13px] font-medium text-text transition-colors group-hover:text-text">
                        {group.className}
                      </span>
                      <ChevronLeft
                        size={16}
                        className="shrink-0 text-text-muted group-hover:text-text"
                      />
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
