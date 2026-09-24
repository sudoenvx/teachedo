import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Edit3,
  MapPin,
  Phone,
  School,
  Users,
  Wallet,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Badge,
  Button,
  Card,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  PageHeader,
} from "@teachedo/ui/components";
import { Breadcrumb } from "@teachedo/ui/legacy";
import { useCenter } from "../api/centers.queries";

const commissionText = (type: string, value: number | string | null) =>
  type === "percentage"
    ? `${value ?? 0}%`
    : type === "fixed_per_student"
      ? `${value ?? 0} ج.م / طالب`
      : "بدون عمولة";

export default function CenterProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: center, isLoading } = useCenter(Number(id));
  const [chartMode, setChartMode] = useState<"year" | "month">("year");
  if (isLoading)
    return (
      <p className="py-10 text-center text-sm text-text-muted">
        جاري تحميل بيانات السنتر...
      </p>
    );
  if (!center)
    return (
      <Empty>
        <EmptyTitle>السنتر غير موجود</EmptyTitle>
        <EmptyDescription>تعذر تحميل بيانات السنتر.</EmptyDescription>
        <Button onClick={() => navigate("/centers")}>العودة للسناتر</Button>
      </Empty>
    );
  const monthNames = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  const chartData =
    chartMode === "year"
      ? center.analytics?.year.map((item) => ({
          label: monthNames[item.month - 1],
          income: item.income,
          commission: item.commission,
        })) || []
      : center.analytics?.month.map((item) => ({
          label: String(item.day),
          income: item.income,
          commission: item.commission,
        })) || [];
  return (
    <div className="flex flex-col gap-4 pb-10">
      <Breadcrumb
        items={[{ label: "السناتر", href: "/centers" }, { label: center.name }]}
      />
      <PageHeader
        title={center.name}
        description="ملف السنتر والعلاقة المالية والفصول المرتبطة به."
        actions={
          <div className="flex gap-2">
            <Link to="/centers">
              <Button variant="neutral">
                <ArrowRight /> رجوع
              </Button>
            </Link>
            <Link to={`/centers/${center.id}/edit`}>
              <Button>
                <Edit3 /> تعديل
              </Button>
            </Link>
          </div>
        }
      />
      <div className="grid items-start gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="h-fit gap-4 ">
          <div className="flex items-start justify-between">
            <span className="flex size-12 items-center justify-center rounded-lg bg-primary-subtle text-primary">
              <School className="size-6" />
            </span>
            <Badge variant="neutral">{center._count?.classes ?? 0} فصول</Badge>
          </div>
          <div>
            <h2 className="text-lg font-bold">{center.name}</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-text-muted">
              <MapPin className="size-4" />
              {center.area || center.location || "الموقع غير محدد"}
            </p>
            {center.phoneNumber && (
              <p className="mt-2 flex items-center gap-2 text-sm text-text-muted">
                <Phone className="size-4" />
                {center.phoneNumber}
              </p>
            )}
          </div>
          <div className="border-t border-border-subtle pt-3">
            <p className="text-xs text-text-muted">نظام العمولة</p>
            <p className="mt-1 font-semibold text-primary">
              {commissionText(center.commissionType, center.commission)}
            </p>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3 self-start">
          <Card className="h-32 justify-between">
            <p className="text-xs text-text-muted">دخل الشهر الحالي</p>
            <p className="text-xl font-bold text-text">
              {center.analytics?.currentMonthIncome.toLocaleString()} EGP
            </p>
            <p className="text-[10px] text-text-faint">إجمالي المدفوعات</p>
          </Card>
          <Card className="h-32 justify-between">
            <p className="text-xs text-text-muted">عمولة الشهر الحالي</p>
            <p className="text-xl font-bold text-primary">
              {center.analytics?.currentMonthCommission.toLocaleString()} EGP
            </p>
            <p className="text-[10px] text-text-faint">حسب نظام السنتر</p>
          </Card>
        </div>
      </div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" />
            <h2 className="font-bold">الدخل والعمولة</h2>
          </div>
          <div
            className="flex items-center gap-1 rounded-md bg-surface-secondary p-1"
            dir="rtl"
          >
            <Button
              type="button"
              size="sm"
              variant={chartMode === "year" ? "secondary" : "ghost"}
              onClick={() => setChartMode("year")}
            >
              السنة الحالية
            </Button>
            <Button
              type="button"
              size="sm"
              variant={chartMode === "month" ? "secondary" : "ghost"}
              onClick={() => setChartMode("month")}
            >
              الشهر الحالي
            </Button>
          </div>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          {chartMode === "year"
            ? `الإجمالي الشهري خلال ${new Date().getFullYear()}`
            : "الحركة اليومية خلال الشهر الحالي"}
        </p>
        <div className="mt-5 h-64 w-full" dir="rtl">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border-subtle)"
              />
              <XAxis
                dataKey="label"
                reversed
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                orientation="right"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toLocaleString()} EGP`,
                  name === "income" ? "الدخل" : "العمولة",
                ]}
              />
              <Line
                type="monotone"
                dataKey="income"
                name="income"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="commission"
                name="commission"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex justify-center gap-4 text-xs text-text-muted">
          <span>
            <i className="me-1 inline-block size-2 rounded-full bg-primary" />
            الدخل
          </span>
          <span>
            <i className="me-1 inline-block size-2 rounded-full bg-accent" />
            العمولة
          </span>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h2 className="font-bold">مجموعات هذا السنتر</h2>
          </div>
          <Badge variant="neutral">{center.classes?.length ?? 0} مجموعات</Badge>
        </div>
        {center.classes?.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {center.classes.map((item) => (
              <Link
                key={item.id}
                to={`/groups/${item.id}`}
                className="group rounded-lg  bg-neutral-100 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex size-8 items-center justify-center rounded-md bg-primary-subtle text-primary">
                    <Users className="size-4" />
                  </span>
                  <span className="text-[11px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    عرض
                  </span>
                </div>
                <p className="mt-3 truncate font-semibold">{item.className}</p>
                <p className="mt-1 truncate text-xs text-text-muted">
                  {item.gradeLevel}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-2 text-[11px] text-text-muted">
                  <span>{item._count.enrollments} طلاب</span>
                  <span>{item.monthlyPrice ?? "غير محدد"} EGP</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty className="mt-4">
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>لا توجد مجموعات مرتبطة</EmptyTitle>
              <EmptyDescription>
                اربط مجموعة بهذا السنتر ليظهر هنا.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Card>
    </div>
  );
}
