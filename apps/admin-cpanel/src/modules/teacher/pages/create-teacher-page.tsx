import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Home,
  IdCard,
  KeyRound,
  LockKeyhole,
  Save,
  User,
  Key,
  Copy,
  ArrowRight,
} from "lucide-react";

import { Breadcrumb, Title } from "@teachedo/ui/legacy";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@teachedo/ui/components";
import { useNotification } from "@/core/hooks/use_notification";
import {
  createTeacherSchema,
  type CreateTeacherFormValues,
} from "../schemas/teachers.schemas";
import { useAddTeacher } from "../api/teachers.mutations";

const STATUS_OPTIONS = [
  { value: "active", label: "نشط (صلاحيات كاملة)" },
  { value: "trial", label: "فترة تجريبية" },
  { value: "suspended_payment", label: "موقوف (بسبب الدفع)" },
  { value: "inactive", label: "غير نشط" },
];

export default function CreateTeacherPage() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const addMutation = useAddTeacher();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeacherFormValues>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: { accountStatus: "active" },
  });

  const onSubmit = async (data: CreateTeacherFormValues) => {
    await addMutation.mutateAsync(data, {
      onError: (error) => notify.error(error.message),
      onSuccess: () => {
        notify.success("تم إنشاء حساب المدرس بنجاح");
        navigate("/teachers");
      },
    });
  };

  const renderField = (
    name: "fullName" | "username" | "password",
    label: string,
    icon: React.ReactNode,
  ) => {
    const error = errors[name]?.message;
    return (
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={`teacher-${name}`}>{label}</FieldLabel>
        <FieldContent>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>{icon}</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={`teacher-${name}`}
              dir="ltr"
              aria-invalid={Boolean(error)}
              type={name === "password" ? "password" : "text"}
              {...register(name)}
            />
          </InputGroup>
          <FieldError>
            {typeof error === "string" ? error : undefined}
          </FieldError>
        </FieldContent>
      </Field>
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-8"
      >
      <Breadcrumb
        items={[
          {
            label: "الرئيسية",
            href: "/",
            icon: <Home className="h-4 w-4" />,
          },
          { label: "المدرسون", href: "/teachers" },
          { label: "إنشاء حساب جديد" },
        ]}
      />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <div>
            <Title element="h1" className="font-bold text-text">
              إضافة مدرس جديد
            </Title>
            <p className="m-0 mt-1 text-xs text-text-muted">
              أنشئ بيانات الدخول الأساسية، وسيكمل المدرس ملفه ومحتواه من خلال
              onboarding.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="neutral"
            
            onClick={() => navigate(-1)}
          >
            <ArrowRight /> 
            العودة
          </Button>
          <Button type="submit"  disabled={addMutation.isPending}>
            <Save />{" "}
            {addMutation.isPending ? "جاري الحفظ..." : "حفظ المدرس"}
          </Button>
        </div>
      </header>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card>
          <CardHeader>
            <CardTitle>بيانات حساب المدرس</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              {renderField("fullName", "الاسم الكامل", <User size={14} />)}
            </div>
            {renderField("username", "اسم المستخدم", <IdCard size={14} />)}
            {renderField(
              "password",
              "كلمة المرور المؤقتة",
              <KeyRound size={14} />,
            )}
            
            <Controller
              name="accountStatus"
              control={control}
              render={({ field }) => (
                <Field
                  data-invalid={Boolean(errors.accountStatus)}
                  className="sm:col-span-2"
                >
                  <FieldLabel>حالة الحساب</FieldLabel>
                  <FieldContent>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة الحساب" />
                      </SelectTrigger>
                      <SelectContent className={"max-h-60 overflow-y-auto w-40"}>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value} className={``}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError>{errors.accountStatus?.message}</FieldError>
                  </FieldContent>
                </Field>
              )}
            />
          </CardContent>
          <CardFooter>
            <div className="flex items-start gap-2 text-[11px] leading-6 text-text-muted sm:col-span-2">
              <LockKeyhole size={15} className="mt-1 shrink-0 text-text-muted" />
              <p className="m-0">
                بعد تسجيل الدخول، سيحدد المدرس هاتفه ومادته ومراحله ومجموعاته
                وجدوله بنفسه.
              </p>
            </div>
          </CardFooter>
        </Card>
        <Card className="bg-info-subtle! border-none shadow-none">
          <CardContent className="flex items-start gap-2 p-3">
            <Key size={16} className="mt-0.5 shrink-0 text-info" />
            <div>
              <h2 className="text-[12px] font-bold text-info">
                مساحة مدرس مستقلة
              </h2>
              <p className="mt-1 text-[11px] leading-6 text-text">
                سيُنشئ النظام مساحة معزولة للمدرس، ثم يكمل المدرس بياناته
                ومحتواه من خلال onboarding.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
