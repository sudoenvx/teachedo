import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Banknote,
  GraduationCap,
  Landmark,
  Monitor,
  Save,
  Sparkles,
  Users,
  UsersRound,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, PageHeader } from "@teachedo/ui/legacy";
import { useNotification } from "@/core/hooks/use_notification";
import { useCreateGroup, useUpdateGroup } from "../api/groups.mutations";
import { useGroup } from "../api/groups.queries";
import { groupFormSchema, type GroupFormValues } from "../schema/group.schema";
import type { GroupInput } from "../types/group.types";
import {
  Button,
  Card,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@teachedo/ui/components";
import { useCenters } from "@/modules/centers/api/centers.queries";

export default function GroupFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const groupId = Number(id);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { data: centers = [], isLoading: centersLoading } = useCenters();
  const { data: group, isLoading } = useGroup(groupId);
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup(groupId);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      className: "",
      gradeLevel: "",
      sessionPrice: "",
      monthlyPrice: "",
      maxCapacity: "",
      groupTier: "normal",
      deliveryMode: "offline",
    },
  });

  useEffect(() => {
    if (group)
      reset({
        className: group.className,
        gradeLevel: group.gradeLevel,
        centerId: group.center?.id ? String(group.center.id) : "",
        sessionPrice:
          group.sessionPrice == null ? "" : String(group.sessionPrice),
        monthlyPrice:
          group.monthlyPrice == null ? "" : String(group.monthlyPrice),
        maxCapacity: group.maxCapacity == null ? "" : String(group.maxCapacity),
        groupTier: group.groupTier || "normal",
        deliveryMode: group.deliveryMode || "offline",
      });
  }, [group, reset]);

  const onSubmit = async (values: GroupFormValues) => {
    const payload: GroupInput = {
      className: values.className,
      gradeLevel: values.gradeLevel,
      centerId: values.centerId ? Number(values.centerId) : null,
      sessionPrice: values.sessionPrice ? Number(values.sessionPrice) : null,
      monthlyPrice: values.monthlyPrice ? Number(values.monthlyPrice) : null,
      maxCapacity: values.maxCapacity ? Number(values.maxCapacity) : null,
      groupTier: values.groupTier,
      deliveryMode: values.deliveryMode,
    };
    try {
      if (isEdit) await updateMutation.mutateAsync(payload);
      else await createMutation.mutateAsync(payload);
      notify.success(isEdit ? "تم تحديث المجموعة" : "تم إنشاء المجموعة");
      navigate("/groups");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "تعذر حفظ المجموعة",
      );
    }
  };

  if (isEdit && isLoading)
    return (
      <div className="flex h-[50vh] items-center justify-center text-[12px] text-text-muted">
        جاري تحميل المجموعة...
      </div>
    );
  const pending = createMutation.isPending || updateMutation.isPending;
  const selectedCenterId = watch("centerId") || "";
  const selectedGroupTier = watch("groupTier");
  const selectedDeliveryMode = watch("deliveryMode");
  const selectedCenter = centers.find(
    (center) => String(center.id) === selectedCenterId,
  );
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 pb-10 animate-in fade-in duration-300"
    >
      <Breadcrumb
        items={[
          { label: "المجموعات", href: "/groups" },
          { label: isEdit ? "تعديل المجموعة" : "إضافة مجموعة" },
        ]}
      />
      <PageHeader
        title={isEdit ? "تعديل المجموعة" : "إضافة مجموعة جديدة"}
        description="أنشئ المجموعة وحدد صفها ورسومها والسنتر الذي تُدرّس فيه."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/groups">
              <Button type="button" variant={"neutral"}>
                <ArrowRight size={14} />
                إلغاء
              </Button>
            </Link>
            <Button type="submit" disabled={pending}>
              <Save size={15} />
              {pending ? "جاري الحفظ..." : "حفظ المجموعة"}
            </Button>
          </div>
        }
      />
      <Card className="mx-auto w-full max-w-3xl">
        <div className="mb-5 flex items-center gap-3 border-b border-border-subtle pb-4">
          <span className="flex h-7 w-7 items-center justify-center bg-muted text-muted-foreground rounded-sm">
            <Users size={17} />
          </span>
          <div>
            <h2 className="text-[14px] font-bold text-text">بيانات المجموعة</h2>
            <p className="text-[11px] text-text-muted">
              البيانات الأساسية للمجموعة والرسوم ومكان التدريس.
            </p>
          </div>
        </div>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="class-name">اسم المجموعة</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Users className="size-3.5" />
                </InputGroupAddon>
                <InputGroupInput
                  id="class-name"
                  placeholder="مثال: مجموعة الرياضيات"
                  {...register("className")}
                />
              </InputGroup>
              <FieldError>{errors.className?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="grade-level">الصف الدراسي</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <GraduationCap className="size-3.5" />
                </InputGroupAddon>
                <InputGroupInput
                  id="grade-level"
                  placeholder="مثال: الصف الثالث الإعدادي"
                  {...register("gradeLevel")}
                />
              </InputGroup>
              <FieldError>{errors.gradeLevel?.message}</FieldError>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="center-id">
              <Landmark className="size-3.5" />
              السنتر
            </FieldLabel>
            <Select
              value={selectedCenterId}
              onValueChange={(value) =>
                setValue("centerId", value ?? '', {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger
                id="center-id"
                className="w-full"
                disabled={centersLoading}
                aria-invalid={!!errors.centerId}
              >
                <SelectValue>{selectedCenter?.name || "بدون سنتر"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">بدون سنتر</SelectItem>
                {centers.map((center) => (
                  <SelectItem key={center.id} value={String(center.id)}>
                    {center.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              اربط الفصل بمكان التدريس ليظهر في ملف السنتر.
            </FieldDescription>
            <FieldError>{errors.centerId?.message}</FieldError>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="group-tier">
                <Sparkles className="size-3.5" />
                نوع المجموعة
              </FieldLabel>
              <Select
                value={selectedGroupTier}
                onValueChange={(value) =>
                  setValue("groupTier", (value || "normal") as GroupFormValues["groupTier"], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="group-tier" className="w-full">
                  <SelectValue>{selectedGroupTier === "vip" ? "VIP" : "عادية"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">عادية</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>يظهر نوع المجموعة للمعلم في القوائم والتقارير.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="delivery-mode">
                <Monitor className="size-3.5" />
                طريقة التدريس
              </FieldLabel>
              <Select
                value={selectedDeliveryMode}
                onValueChange={(value) =>
                  setValue("deliveryMode", (value || "offline") as GroupFormValues["deliveryMode"], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="delivery-mode" className="w-full">
                  <SelectValue>
                    {selectedDeliveryMode === "online"
                      ? "أونلاين"
                      : selectedDeliveryMode === "hybrid"
                        ? "هجين"
                        : "حضوري"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offline">حضوري</SelectItem>
                  <SelectItem value="online">أونلاين</SelectItem>
                  <SelectItem value="hybrid">هجين</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>حدد أين يحضر الطلاب حصص المجموعة.</FieldDescription>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="session-price">
                <Banknote className="size-3.5" />
                سعر الحصة
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="session-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="اختياري"
                  {...register("sessionPrice")}
                />
                <InputGroupAddon align="inline-end">
                  <span className="text-[10px]">EGP</span>
                </InputGroupAddon>
              </InputGroup>
              <FieldError>{errors.sessionPrice?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="monthly-price">
                <Banknote className="size-3.5" />
                السعر الشهري
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="monthly-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="اختياري"
                  {...register("monthlyPrice")}
                />
                <InputGroupAddon align="inline-end">
                  <span className="text-[10px]">EGP</span>
                </InputGroupAddon>
              </InputGroup>
              <FieldError>{errors.monthlyPrice?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="max-capacity">
                <UsersRound className="size-3.5" />
                الحد الأقصى للطلاب
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <UsersRound className="size-3.5" />
                </InputGroupAddon>
                <InputGroupInput
                  id="max-capacity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="اختياري"
                  {...register("maxCapacity")}
                />
              </InputGroup>
              <FieldError>{errors.maxCapacity?.message}</FieldError>
            </Field>
          </div>
        </FieldGroup>
      </Card>
    </form>
  );
}
