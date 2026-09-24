import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IdCard,
  KeyRound,
  Phone,
  Save,
  UserRound,
  UsersRound,
  Users,
} from "lucide-react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Breadcrumb, PageHeader } from "@teachedo/ui/legacy";
import {
  Button,
  Card,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Field,
  FieldError,
  FieldLabel,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@teachedo/ui/components";
import { useNotification } from "@/core/hooks/use_notification";
import { useCreateStudent, useUpdateStudent } from "../api/students.mutations";
import { useEnrollStudent } from "../api/student-enrollment.mutations";
import { useGroups } from "@/modules/groups/api/groups.queries";
import { useStudent } from "../api/students.queries";
import {
  studentFormSchema,
  type StudentFormValues,
} from "../schema/student.schema";
import type {
  CreateStudentInput,
  UpdateStudentInput,
} from "../types/student.types";

export default function StudentFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const studentId = Number(id);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { data: student, isLoading } = useStudent(studentId);
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent(studentId);
  const enrollMutation = useEnrollStudent(studentId);
  const { data: groups = [] } = useGroups();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { status: "active", includeParent: false, studentAttendanceType: "in_person" },
  });
  const includeParent = watch("includeParent");
  const classIds = watch("classIds") || [];
  const studentAttendanceType = watch("studentAttendanceType");

  useEffect(() => {
    if (!student) return;
    reset({
      fullName: student.fullName,
      phoneNumber: student.phoneNumber || "",
      studentCode: student.studentCode || "",
      status: student.status === "inactive" ? "inactive" : "active",
      password: "",
      parentFullName: student.parent?.fullName || student.parentName || "",
      parentPhone: student.parent?.phoneNumber || student.parentPhone || "",
      parentWhatsapp:
        student.parent?.whatsappNumber || student.parentWhatsapp || "",
      parentPassword: "",
      includeParent: Boolean(student.parent || student.parentName),
      classIds:
        student.classEnrollments?.map((item) => String(item.studentClass.id)) ||
        [],
      studentAttendanceType: student.classEnrollments?.[0]?.studentAttendanceType || "in_person",
    });
  }, [student, reset]);

  const onSubmit = async (values: StudentFormValues) => {
    try {
      if (isEdit) {
        const payload: UpdateStudentInput = {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber || null,
          status: values.status,
          studentCode: values.studentCode || null,
          classIds: values.classIds?.map(Number),
          ...(values.password ? { password: values.password } : {}),
        };
        await updateMutation.mutateAsync(payload);
        notify.success("تم تحديث بيانات الطالب");
      } else {
        const payload: CreateStudentInput = {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber || null,
          status: values.status,
          studentCode: values.studentCode || null,
          classIds: values.classIds?.map(Number),
          studentAttendanceType: values.studentAttendanceType,
          ...(values.includeParent
            ? {
                parent: {
                  fullName: values.parentFullName || "",
                  phoneNumber: values.parentPhone || "",
                  whatsappNumber: values.parentWhatsapp || null,
                  password: values.parentPassword || null,
                },
              }
            : {}),
        };
        await createMutation.mutateAsync(payload);
        notify.success("تم إنشاء الطالب بنجاح");
      }
      if (isEdit && values.classIds?.length) {
        await Promise.all(
          values.classIds.map((classId) =>
            enrollMutation.mutateAsync({ classId: Number(classId), studentAttendanceType: values.studentAttendanceType }),
          ),
        );
      }
      navigate("/students");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "تعذر حفظ بيانات الطالب",
      );
    }
  };

  const pending =
    createMutation.isPending ||
    updateMutation.isPending ||
    enrollMutation.isPending;
  if (isEdit && isLoading)
    return (
      <div className="flex h-[50vh] items-center justify-center text-[12px] text-text-muted">
        جاري تحميل بيانات الطالب...
      </div>
    );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full max-w-5xl flex-col gap-5 pb-10 animate-in fade-in duration-300"
    >
      <Breadcrumb
        items={[
          { label: "الطلاب", href: "/students" },
          { label: isEdit ? "تعديل الطالب" : "إضافة طالب" },
        ]}
      />
      <PageHeader
        title={isEdit ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
        description={
          isEdit
            ? "حدّث بيانات الطالب الأساسية وحالة حسابه."
            : "أدخل بيانات الطالب الأساسية، ويمكنك إضافة ولي الأمر اختيارياً."
        }
        actions={
          <Button type="submit" disabled={pending}>
            <Save size={15} />
            حفظ البيانات
          </Button>
        }
      />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-4">
          <FormSection
            icon={<UserRound size={16} />}
            title="بيانات الطالب"
            description="المعلومات الأساسية التي ستظهر في ملف الطالب."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <StudentInput
                id="full-name"
                label="الاسم الكامل"
                placeholder="مثال: أحمد محمد"
                icon={<UserRound />}
                register={register("fullName")}
                error={errors.fullName?.message}
              />
              <StudentInput
                id="phone-number"
                label="رقم الهاتف"
                placeholder="0123456789"
                icon={<Phone />}
                dir="ltr"
                register={register("phoneNumber")}
                error={errors.phoneNumber?.message}
              />
              <StudentInput
                id="student-code"
                label="رمز الطالب"
                placeholder="يُنشأ تلقائياً إذا تركته فارغاً"
                icon={<IdCard />}
                dir="ltr"
                register={register("studentCode")}
                error={errors.studentCode?.message}
              />
              {isEdit && (
                <StudentInput
                  id="password"
                  label="كلمة مرور جديدة"
                  placeholder="اتركها فارغة دون تغيير"
                  icon={<KeyRound />}
                  type="password"
                  dir="ltr"
                  register={register("password")}
                  error={errors.password?.message}
                />
              )}
            </div>
            <label className="mt-4 flex items-center gap-2 text-xs text-text">
              <Checkbox
                checked={includeParent}
                onCheckedChange={(checked) =>
                  setValue("includeParent", checked === true, {
                    shouldValidate: true,
                  })
                }
              />{" "}
              إضافة ولي أمر
            </label>
            <div className="mt-5 border-t border-border-subtle pt-5">
              <Field>
                <FieldLabel>
                  <Users className="size-3.5" /> المجموعات الدراسية (اختياري)
                </FieldLabel>
                <Combobox
                  multiple
                  value={classIds}
                  onValueChange={(value) =>
                    setValue("classIds", value as string[], {
                      shouldDirty: true,
                    })
                  }
                >
                  <ComboboxInput
                    placeholder="ابحث واختر مجموعة أو أكثر"
                    showTrigger
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      <ComboboxEmpty>لا توجد مجموعات مطابقة</ComboboxEmpty>
                      {groups.map((group) => (
                        <ComboboxItem key={group.id} value={String(group.id)}>
                          {group.className}{" "}
                          <span className="text-[10px] text-text-muted">
                            {group.gradeLevel}
                          </span>
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <FieldError>{errors.classIds?.message}</FieldError>
              </Field>
              <Field className="mt-4">
                <FieldLabel htmlFor="student-attendance-type">نوع حضور الطالب</FieldLabel>
                <Select
                  value={studentAttendanceType}
                  onValueChange={(value) =>
                    setValue("studentAttendanceType", (value || "in_person") as StudentFormValues["studentAttendanceType"], {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="student-attendance-type" className="w-full">
                    <SelectValue>
                      {studentAttendanceType === "online_streaming"
                        ? "بث مباشر أونلاين"
                        : studentAttendanceType === "hybrid_both"
                          ? "حضوري وأونلاين"
                          : "حضوري"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_person">حضوري</SelectItem>
                    <SelectItem value="online_streaming">بث مباشر أونلاين</SelectItem>
                    <SelectItem value="hybrid_both">حضوري وأونلاين</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FormSection>
          {includeParent && (
            <FormSection
              icon={<UsersRound size={16} />}
              title="بيانات ولي الأمر"
              description={
                isEdit
                  ? "بيانات ولي الأمر الحالية."
                  : "سيتم إنشاء حساب ولي الأمر تلقائياً عند الحفظ."
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <StudentInput
                  id="parent-name"
                  label="اسم ولي الأمر"
                  placeholder="مثال: محمد أحمد"
                  icon={<UserRound />}
                  disabled={isEdit}
                  register={register("parentFullName")}
                  error={errors.parentFullName?.message}
                />
                <StudentInput
                  id="parent-phone"
                  label="هاتف ولي الأمر"
                  placeholder="01xxxxxxxxx"
                  icon={<Phone />}
                  dir="ltr"
                  disabled={isEdit}
                  register={register("parentPhone")}
                  error={errors.parentPhone?.message}
                />
                <StudentInput
                  id="parent-whatsapp"
                  label="واتساب ولي الأمر"
                  placeholder="01xxxxxxxxx"
                  icon={<Phone />}
                  dir="ltr"
                  disabled={isEdit}
                  register={register("parentWhatsapp")}
                  error={errors.parentWhatsapp?.message}
                />
                {!isEdit && (
                  <StudentInput
                    id="parent-password"
                    label="كلمة مرور ولي الأمر"
                    placeholder="اختياري"
                    icon={<KeyRound />}
                    type="password"
                    dir="ltr"
                    register={register("parentPassword")}
                    error={errors.parentPassword?.message}
                  />
                )}
              </div>
            </FormSection>
          )}
        </div>
        <aside className="flex flex-col gap-4">
          <div className="bg-info-subtle rounded-lg p-2 text-xs leading-relaxed text-info-subtle-foreground">
            <p className="font-bold text-text">ملاحظة مهمة</p>
            <p className="mt-1">
              سيتم إنشاء كلمة مرور عشوائية من 8 أحرف ورموز للطالب تلقائياً عند
              الحفظ.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}

function StudentInput({
  id,
  label,
  placeholder,
  icon,
  register,
  error,
  type = 'text',
  dir,
  disabled,
}: {
  id: string
  label: string
  placeholder: string
  icon: React.ReactNode
  register: UseFormRegisterReturn
  error?: string
  type?: string
  dir?: 'ltr' | 'rtl'
  disabled?: boolean
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup size="sm">
        <InputGroupAddon>{icon}</InputGroupAddon>
        <InputGroupInput id={id} type={type} dir={dir} disabled={disabled} placeholder={placeholder} {...register} />
      </InputGroup>
      <FieldError>{error}</FieldError>
    </Field>
  )
}

function FormSection({
  icon,
  title,
  description,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`${className || ""}`}>
      <header className="mb-4 flex items-start gap-2">
        <span className="flex h-7 w-7 items-center justify-center bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="text-[13px] font-bold text-text">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[11px] text-text-muted">{description}</p>
          )}
        </div>
      </header>
      {children}
    </Card>
  );
}
