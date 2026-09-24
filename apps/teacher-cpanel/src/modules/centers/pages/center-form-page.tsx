import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Banknote,
  MapPin,
  Phone,
  Save,
  School,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { Breadcrumb } from "@teachedo/ui/legacy";
import {
  Button,
  Card,
  Field,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@teachedo/ui/components";
import { useNotification } from "@/core/hooks/use_notification";
import { useCenter } from "../api/centers.queries";
import { useCreateCenter, useUpdateCenter } from "../api/centers.mutations";

const schema = z.object({
  name: z.string().trim().min(2, "اسم السنتر مطلوب"),
  location: z.string().optional(),
  area: z.string().optional(),
  phoneNumber: z.string().optional(),
  commission: z.string().optional(),
  commissionType: z.enum(["percentage", "fixed_per_student", "none"]),
});
type FormValues = z.infer<typeof schema>;

export default function CenterFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const centerId = Number(id);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { data: center, isLoading } = useCenter(centerId);
  const createMutation = useCreateCenter();
  const updateMutation = useUpdateCenter(centerId);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      location: "",
      area: "",
      phoneNumber: "",
      commission: "",
      commissionType: "none",
    },
  });

  useEffect(() => {
    if (center)
      reset({
        name: center.name,
        location: center.location || "",
        area: center.area || "",
        phoneNumber: center.phoneNumber || "",
        commission: center.commission == null ? "" : String(center.commission),
        commissionType: center.commissionType,
      });
  }, [center, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      commission: values.commission ? Number(values.commission) : null,
      location: values.location || null,
      area: values.area || null,
      phoneNumber: values.phoneNumber || null,
    };
    try {
      if (isEdit) await updateMutation.mutateAsync(payload);
      else await createMutation.mutateAsync(payload);
      notify.success(isEdit ? "تم تحديث السنتر" : "تم إنشاء السنتر");
      navigate("/centers");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "تعذر حفظ السنتر");
    }
  };

  if (isEdit && isLoading)
    return (
      <p className="py-10 text-center text-sm text-text-muted">
        جاري تحميل السنتر...
      </p>
    );
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 pb-10"
    >
      <Breadcrumb
        items={[
          { label: "السناتر", href: "/centers" },
          { label: isEdit ? "تعديل السنتر" : "سنتر جديد" },
        ]}
      />
      <PageHeader
        title={isEdit ? "تعديل السنتر" : "إضافة سنتر"}
        description="حدّث بيانات مكان التدريس والعمولة."
        actions={
          <div className="flex gap-2">
            <Link to="/centers">
              <Button type="button" variant="neutral">
                <ArrowRight /> إلغاء
              </Button>
            </Link>
            <Button type="submit">
              <Save /> حفظ
            </Button>
          </div>
        }
      />
      <Card className="mx-auto w-full max-w-2xl">
        <div className="mb-4 flex items-center gap-3 border-b border-border-subtle pb-4">
          <span className="flex size-8 items-center justify-center rounded-sm bg-primary-subtle text-primary">
            <School className="size-4" />
          </span>
          <div>
            <h2 className="font-bold">بيانات السنتر</h2>
            <p className="text-xs text-text-muted">
              المعلومات الأساسية التي ستظهر لك في القائمة.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="center-name">اسم السنتر</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <School className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="center-name"
                placeholder="مثال: سنتر النور"
                {...register("name")}
              />
            </InputGroup>
            <FieldError>{errors.name?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="center-area">المنطقة</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <MapPin className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="center-area"
                placeholder="مثال: مدينة نصر"
                {...register("area")}
              />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="center-location">العنوان أو الموقع</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <MapPin className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="center-location"
                placeholder="العنوان بالتفصيل"
                {...register("location")}
              />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="center-phone">رقم الهاتف</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Phone className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="center-phone"
                dir="ltr"
                placeholder="0123456789"
                {...register("phoneNumber")}
              />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="center-commission">قيمة العمولة</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="center-commission"
                type="number"
                min="0"
                step="0.01"
                placeholder="اختياري"
                {...register("commission")}
              />
              <InputGroupAddon align="inline-end">
                <Banknote className="size-4" />
                <span>EGP</span>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Select
            value={watch("commissionType")}
            onValueChange={(value) =>
              setValue("commissionType", value as FormValues["commissionType"])
            }
          >
            <SelectTrigger>
              <SelectValue>
                {watch("commissionType") === "percentage"
                  ? "نسبة مئوية"
                  : watch("commissionType") === "fixed_per_student"
                    ? "مبلغ ثابت لكل طالب"
                    : "بدون عمولة"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">بدون عمولة</SelectItem>
              <SelectItem value="percentage">نسبة مئوية</SelectItem>
              <SelectItem value="fixed_per_student">
                مبلغ ثابت لكل طالب
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors.name && (
          <p className="mt-2 text-xs text-destructive">{errors.name.message}</p>
        )}
      </Card>
    </form>
  );
}
