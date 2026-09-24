import { useState } from "react";
import {
  Edit3,
  GraduationCap,
  Home,
  ArrowRight,
  MapPin,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  IconButton,
  PageHeader,
} from "@teachedo/ui/components";
import { useNotification } from "@/core/hooks/use_notification";
import { useDeleteGroup } from "../api/groups.mutations";
import { useGroups } from "../api/groups.queries";
import type { ClassListItem } from "../types/group.types";
import { StatisticCard } from "@teachedo/ui/legacy";

export default function GroupsPage() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { data: classes = [], isLoading } = useGroups();
  const [classToDelete, setClassToDelete] = useState<ClassListItem | null>(
    null,
  );
  const deleteMutation = useDeleteGroup();

  const totalStudents = classes.reduce(
    (total, group) => total + group._count.enrollments,
    0,
  );

  const confirmDelete = async () => {
    if (!classToDelete) return;
    try {
      await deleteMutation.mutateAsync({ id: classToDelete.id });
      notify.success("تم حذف الفصل");
      setClassToDelete(null);
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "تعذر حذف المجموعة",
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-300">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <a href="/" className="transition-colors hover:text-text">
              <Home className="size-3.5" />
              <span className="sr-only">الرئيسية</span>
            </a>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>المجموعات</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        title="إدارة المجموعات"
        description="نظّم مجموعاتك الدراسية وتابع أعداد الطلاب والحصص."
        actions={<div className="flex items-center gap-2"><Button type="button" variant="neutral" onClick={() => navigate("/")}><ArrowRight /> رجوع</Button><Button type="button" onClick={() => navigate("/groups/new")}><Plus size={15} /> إضافة مجموعة</Button></div>}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <StatisticCard
          label="إجمالي المجموعات"
          value={String(classes.length)}
          icon={Users}
          // iconClassName="bg-primary-subtle"
        />
        <StatisticCard
          label="الطلاب المسجلون"
          value={String(totalStudents)}
          icon={GraduationCap}
          iconClassName="bg-success-subtle"
        />
      </div>
      {!isLoading && classes.length === 0 ? (
        <Card>
          <Empty className="min-h-64 border border-dashed border-border-subtle bg-surface">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Users /></EmptyMedia>
              <EmptyTitle>ابدأ بأول مجموعة</EmptyTitle>
              <EmptyDescription>أنشئ مجموعة وحدد صفها ورسومها لتبدأ في تنظيم طلابك.</EmptyDescription>
            </EmptyHeader>
            <Button type="button" onClick={() => navigate("/groups/new")}><Plus /> إنشاء مجموعة</Button>
          </Empty>
        </Card>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((item) => (
            <Card
              key={item.id}
              role="link"
              tabIndex={0}
              className="cursor-pointer gap-4 transition-all hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => navigate(`/groups/${item.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  navigate(`/groups/${item.id}`)
                }
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary"><Users className="size-4.5" /></span>
                  <div className="min-w-0"><h2 className="truncate font-bold text-text">{item.className}</h2><p className="mt-0.5 text-xs text-text-muted">{item.gradeLevel}</p></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant={item.groupTier === 'vip' ? 'accent' : 'neutral'}>
                    {item.groupTier === 'vip' ? 'VIP' : 'عادية'}
                  </Badge>
                  <Badge variant="neutral">{item._count.classSessions} حصص</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-surface-secondary p-2"><p className="text-text-muted">الطلاب</p><p className="mt-1 flex items-center gap-1 font-semibold"><GraduationCap className="size-3.5" />{item._count.enrollments}{item.maxCapacity ? ` / ${item.maxCapacity}` : ''}</p></div>
                <div className="rounded-md bg-surface-secondary p-2"><p className="text-text-muted">الشهري</p><p className="mt-1 font-semibold">{item.monthlyPrice ?? 'غير محدد'} EGP</p></div>
              </div>
              <div className="flex items-center justify-between border-t border-border-subtle pt-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">{item.center ? <><MapPin className="size-3.5" />{item.center.name}</> : 'بدون سنتر'}</span>
                <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}><IconButton type="button" color="secondary" style="tint" size="sm" aria-label={`تعديل ${item.className}`} title="تعديل المجموعة" icon={<Edit3 size={14} />} onClick={() => navigate(`/groups/${item.id}/edit`)} /><IconButton type="button" color="danger" style="tint" size="sm" aria-label={`حذف ${item.className}`} title="حذف المجموعة" icon={<Trash2 size={14} />} onClick={() => setClassToDelete(item)} /></div>
              </div>
            </Card>
          ))}
        </section>
      )}
      <Dialog
        open={!!classToDelete}
        onOpenChange={(open) => !open && setClassToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              حذف {classToDelete?.className}؟
            </DialogTitle>
            <DialogDescription>
              سيتم إخفاء المجموعة من قائمتك. سجلات الطلاب والحصص المرتبطة بها لن
              تُحذف.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="neutral" />}>
              إلغاء
            </DialogClose>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              حذف المجموعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
